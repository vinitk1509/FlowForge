package com.flowforge.execution.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowforge.common.events.NodeCompletedEvent;
import com.flowforge.common.events.NodeFailedEvent;
import com.flowforge.common.events.NodeReadyEvent;
import com.flowforge.common.events.WorkflowCompletedEvent;
import com.flowforge.common.model.*;
import com.flowforge.execution.dto.ExecutionResponse;
import com.flowforge.execution.dto.NodeExecutionResponse;
import com.flowforge.execution.entity.NodeExecution;
import com.flowforge.execution.entity.WorkflowExecution;
import com.flowforge.execution.producer.ExecutionEventProducer;
import com.flowforge.execution.repository.NodeExecutionRepository;
import com.flowforge.execution.repository.WorkflowExecutionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExecutionOrchestratorService {

    private final WorkflowExecutionRepository executionRepository;
    private final NodeExecutionRepository nodeExecutionRepository;
    private final ExecutionEventProducer eventProducer;
    private final DistributedLockService lockService;
    private final WorkflowClient workflowClient;
    private final ObjectMapper objectMapper;

    /**
     * Start a workflow execution from a workflow ID and optional trigger payload.
     */
    @Transactional
    public ExecutionResponse startExecution(String workflowId, String versionId, WorkflowGraph graph,
                                           Map<String, Object> triggerPayload, String triggerSource) {
        log.info("Starting execution for workflow [{}] triggerSource [{}]", workflowId, triggerSource);

        if (graph == null || graph.getNodes() == null || graph.getNodes().isEmpty()) {
            graph = workflowClient.fetchWorkflowGraph(workflowId)
                    .orElseThrow(() -> new IllegalArgumentException("No workflow graph found for workflow ID: " + workflowId));
        }

        String executionId = UUID.randomUUID().toString();
        Instant now = Instant.now();
        Map<String, Object> safeTriggerPayload = triggerPayload != null ? new HashMap<>(triggerPayload) : new HashMap<>();

        Map<String, Object> initialContext = new HashMap<>();
        initialContext.put("trigger", safeTriggerPayload);
        try {
            // Embed graph into context for state machine edge traversal
            initialContext.put("__graph", objectMapper.writeValueAsString(graph));
        } catch (Exception e) {
            log.warn("Failed to serialize graph into context: {}", e.getMessage());
        }

        WorkflowExecution execution = WorkflowExecution.builder()
                .id(executionId)
                .workflowId(workflowId)
                .workflowVersionId(versionId)
                .status(ExecutionStatus.RUNNING)
                .triggerSource(triggerSource != null ? triggerSource : "MANUAL")
                .triggerPayload(safeTriggerPayload)
                .contextData(initialContext)
                .startTime(now)
                .build();

        // Identify in-degrees for all nodes
        Map<String, Integer> inDegrees = new HashMap<>();
        for (WorkflowNode node : graph.getNodes()) {
            inDegrees.put(node.getId(), 0);
        }
        if (graph.getEdges() != null) {
            for (WorkflowEdge edge : graph.getEdges()) {
                inDegrees.put(edge.getTargetNodeId(), inDegrees.getOrDefault(edge.getTargetNodeId(), 0) + 1);
            }
        }

        List<NodeExecution> readyNodes = new ArrayList<>();

        for (WorkflowNode node : graph.getNodes()) {
            boolean isEntryNode = inDegrees.getOrDefault(node.getId(), 0) == 0;
            NodeStatus status = isEntryNode ? NodeStatus.READY : NodeStatus.PENDING;

            NodeExecution nodeExec = NodeExecution.builder()
                    .id(UUID.randomUUID().toString())
                    .execution(execution)
                    .nodeId(node.getId())
                    .nodeName(node.getName() != null ? node.getName() : node.getId())
                    .nodeType(node.getType() != null ? node.getType().name() : "CUSTOM")
                    .status(status)
                    .inputPayload(isEntryNode ? new HashMap<>(safeTriggerPayload) : new HashMap<>())
                    .startTime(isEntryNode ? now : null)
                    .attempt(1)
                    .build();

            execution.addNodeExecution(nodeExec);
            if (isEntryNode) {
                readyNodes.add(nodeExec);
            }
        }

        WorkflowExecution savedExecution = executionRepository.save(execution);

        // Emit NodeReadyEvent for all entry nodes
        for (NodeExecution entryNode : readyNodes) {
            WorkflowNode nodeModel = findNodeInGraph(graph, entryNode.getNodeId());
            NodeReadyEvent readyEvent = NodeReadyEvent.builder()
                    .executionId(executionId)
                    .workflowId(workflowId)
                    .workflowVersionId(versionId)
                    .nodeId(entryNode.getNodeId())
                    .nodeName(entryNode.getNodeName())
                    .nodeType(nodeModel != null ? nodeModel.getType() : NodeType.TRIGGER_MANUAL)
                    .nodeConfig(nodeModel != null ? nodeModel.getConfig() : Collections.emptyMap())
                    .resolvedInputs(entryNode.getInputPayload())
                    .credentialsRef(nodeModel != null ? nodeModel.getCredentialsRef() : null)
                    .attempt(1)
                    .timestamp(Instant.now())
                    .build();

            eventProducer.publishNodeReady(readyEvent);
        }

        return mapToResponse(savedExecution);
    }

    /**
     * Handle node completion event and progress the DAG state machine.
     */
    @Transactional
    public void handleNodeCompleted(NodeCompletedEvent event) {
        String executionId = event.getExecutionId();
        String lockKey = "lock:execution:" + executionId;
        String lockVal = UUID.randomUUID().toString();

        if (!lockService.acquireLock(lockKey, lockVal, Duration.ofSeconds(10))) {
            log.warn("Could not acquire lock for execution [{}], retrying later", executionId);
            return;
        }

        try {
            WorkflowExecution execution = executionRepository.findById(executionId)
                    .orElseThrow(() -> new IllegalArgumentException("Execution not found: " + executionId));

            if (execution.getStatus() != ExecutionStatus.RUNNING) {
                log.info("Execution [{}] is already [{}] - ignoring node completed event for [{}]",
                        executionId, execution.getStatus(), event.getNodeId());
                return;
            }

            NodeExecution nodeExec = nodeExecutionRepository.findByExecutionIdAndNodeId(executionId, event.getNodeId())
                    .orElseThrow(() -> new IllegalArgumentException("Node execution not found: " + event.getNodeId()));

            Instant now = Instant.now();
            nodeExec.setStatus(NodeStatus.SUCCEEDED);
            nodeExec.setOutputPayload(event.getOutputData() != null ? event.getOutputData() : new HashMap<>());
            nodeExec.setBranchSelected(event.getActiveBranchHandle());
            nodeExec.setDurationMs(event.getDurationMs());
            nodeExec.setEndTime(now);
            nodeExecutionRepository.save(nodeExec);

            // Update execution context data with this node's output
            Map<String, Object> context = execution.getContextData();
            if (context == null) context = new HashMap<>();
            context.put(event.getNodeId(), event.getOutputData());
            execution.setContextData(context);

            WorkflowGraph graph = extractGraphFromContext(context);
            if (graph == null) {
                graph = workflowClient.fetchWorkflowGraph(execution.getWorkflowId()).orElse(null);
            }

            if (graph != null) {
                progressDownstreamNodes(execution, nodeExec, graph, event.getActiveBranchHandle());
            }

            // Check if overall workflow has finished
            checkWorkflowCompletion(execution);

        } finally {
            lockService.releaseLock(lockKey, lockVal);
        }
    }

    /**
     * Handle node failure event.
     */
    @Transactional
    public void handleNodeFailed(NodeFailedEvent event) {
        String executionId = event.getExecutionId();
        log.error("Node [{}] failed in execution [{}]: {}", event.getNodeId(), executionId, event.getErrorMessage());

        WorkflowExecution execution = executionRepository.findById(executionId).orElse(null);
        if (execution == null) return;

        NodeExecution nodeExec = nodeExecutionRepository.findByExecutionIdAndNodeId(executionId, event.getNodeId()).orElse(null);
        if (nodeExec != null) {
            nodeExec.setStatus(NodeStatus.FAILED);
            nodeExec.setErrorMessage(event.getErrorMessage());
            nodeExec.setErrorDetails(event.getErrorDetails());
            nodeExec.setEndTime(Instant.now());
            nodeExecutionRepository.save(nodeExec);
        }

        // Halt workflow execution
        Instant now = Instant.now();
        execution.setStatus(ExecutionStatus.FAILED);
        execution.setErrorMessage(event.getErrorMessage());
        execution.setEndTime(now);
        if (execution.getStartTime() != null) {
            execution.setDurationMs(Duration.between(execution.getStartTime(), now).toMillis());
        }

        // Mark remaining pending or ready nodes as SKIPPED
        List<NodeExecution> remainingNodes = nodeExecutionRepository.findByExecutionIdOrderByStartTimeAsc(executionId);
        for (NodeExecution n : remainingNodes) {
            if (n.getStatus() == NodeStatus.PENDING || n.getStatus() == NodeStatus.READY) {
                n.setStatus(NodeStatus.SKIPPED);
                nodeExecutionRepository.save(n);
            }
        }

        executionRepository.save(execution);

        // Emit workflow completed with FAILED status
        WorkflowCompletedEvent completedEvent = WorkflowCompletedEvent.builder()
                .executionId(executionId)
                .workflowId(execution.getWorkflowId())
                .workflowVersionId(execution.getWorkflowVersionId())
                .status(ExecutionStatus.FAILED)
                .errorMessage(event.getErrorMessage())
                .durationMs(execution.getDurationMs() != null ? execution.getDurationMs() : 0)
                .timestamp(now)
                .build();
        eventProducer.publishWorkflowCompleted(completedEvent);
    }

    private void progressDownstreamNodes(WorkflowExecution execution, NodeExecution completedNode,
                                        WorkflowGraph graph, String branchSelected) {
        if (graph.getEdges() == null) return;

        List<WorkflowEdge> outgoingEdges = graph.getEdges().stream()
                .filter(e -> e.getSourceNodeId().equals(completedNode.getNodeId()))
                .collect(Collectors.toList());

        for (WorkflowEdge edge : outgoingEdges) {
            String targetNodeId = edge.getTargetNodeId();
            NodeExecution targetExec = nodeExecutionRepository.findByExecutionIdAndNodeId(execution.getId(), targetNodeId).orElse(null);
            if (targetExec == null) continue;

            // Handle branching logic: if edge has sourceHandle (e.g. "true" / "false") and branchSelected doesn't match
            boolean isBranchMismatch = edge.getSourceHandle() != null
                    && !edge.getSourceHandle().equalsIgnoreCase("default")
                    && branchSelected != null
                    && !edge.getSourceHandle().equalsIgnoreCase(branchSelected);

            if (isBranchMismatch) {
                log.info("Branch mismatch on edge [{}] -> [{}] (expected: {}, selected: {}). Marking target as SKIPPED",
                        edge.getSourceNodeId(), targetNodeId, edge.getSourceHandle(), branchSelected);
                targetExec.setStatus(NodeStatus.SKIPPED);
                nodeExecutionRepository.save(targetExec);
                continue;
            }

            if (targetExec.getStatus() != NodeStatus.PENDING) {
                continue;
            }

            // Check if all incoming edges to targetNode are satisfied (SUCCEEDED)
            List<WorkflowEdge> incomingEdges = graph.getEdges().stream()
                    .filter(e -> e.getTargetNodeId().equals(targetNodeId))
                    .collect(Collectors.toList());

            boolean allParentsSatisfied = true;
            Map<String, Object> resolvedInputs = new HashMap<>();

            for (WorkflowEdge inEdge : incomingEdges) {
                NodeExecution parentExec = nodeExecutionRepository.findByExecutionIdAndNodeId(execution.getId(), inEdge.getSourceNodeId()).orElse(null);
                if (parentExec == null || parentExec.getStatus() != NodeStatus.SUCCEEDED) {
                    allParentsSatisfied = false;
                    break;
                }
                if (parentExec.getOutputPayload() != null) {
                    resolvedInputs.put(parentExec.getNodeId(), parentExec.getOutputPayload());
                }
            }

            if (allParentsSatisfied) {
                log.info("All dependencies satisfied for node [{}]. Transitioning to READY", targetNodeId);
                targetExec.setStatus(NodeStatus.READY);
                targetExec.setInputPayload(resolvedInputs);
                targetExec.setStartTime(Instant.now());
                nodeExecutionRepository.save(targetExec);

                WorkflowNode targetNodeModel = findNodeInGraph(graph, targetNodeId);
                NodeReadyEvent readyEvent = NodeReadyEvent.builder()
                        .executionId(execution.getId())
                        .workflowId(execution.getWorkflowId())
                        .workflowVersionId(execution.getWorkflowVersionId())
                        .nodeId(targetNodeId)
                        .nodeName(targetExec.getNodeName())
                        .nodeType(targetNodeModel != null ? targetNodeModel.getType() : NodeType.ACTION_HTTP)
                        .nodeConfig(targetNodeModel != null ? targetNodeModel.getConfig() : Collections.emptyMap())
                        .resolvedInputs(resolvedInputs)
                        .credentialsRef(targetNodeModel != null ? targetNodeModel.getCredentialsRef() : null)
                        .attempt(1)
                        .timestamp(Instant.now())
                        .build();

                eventProducer.publishNodeReady(readyEvent);
            }
        }
    }

    private void checkWorkflowCompletion(WorkflowExecution execution) {
        List<NodeExecution> allNodes = nodeExecutionRepository.findByExecutionIdOrderByStartTimeAsc(execution.getId());

        boolean hasActiveNodes = allNodes.stream().anyMatch(n ->
                n.getStatus() == NodeStatus.PENDING ||
                n.getStatus() == NodeStatus.READY ||
                n.getStatus() == NodeStatus.RUNNING ||
                n.getStatus() == NodeStatus.QUEUED);

        if (!hasActiveNodes) {
            Instant now = Instant.now();
            execution.setStatus(ExecutionStatus.SUCCEEDED);
            execution.setEndTime(now);
            if (execution.getStartTime() != null) {
                execution.setDurationMs(Duration.between(execution.getStartTime(), now).toMillis());
            }
            executionRepository.save(execution);

            log.info("Workflow execution [{}] completed successfully in [{}ms]", execution.getId(), execution.getDurationMs());

            WorkflowCompletedEvent completedEvent = WorkflowCompletedEvent.builder()
                    .executionId(execution.getId())
                    .workflowId(execution.getWorkflowId())
                    .workflowVersionId(execution.getWorkflowVersionId())
                    .status(ExecutionStatus.SUCCEEDED)
                    .finalOutputs(execution.getContextData())
                    .durationMs(execution.getDurationMs() != null ? execution.getDurationMs() : 0)
                    .timestamp(now)
                    .build();

            eventProducer.publishWorkflowCompleted(completedEvent);
        }
    }

    @Transactional(readOnly = true)
    public ExecutionResponse getExecution(String executionId) {
        WorkflowExecution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new NoSuchElementException("Execution not found: " + executionId));
        return mapToResponse(execution);
    }

    @Transactional(readOnly = true)
    public List<ExecutionResponse> getWorkflowExecutions(String workflowId) {
        return executionRepository.findByWorkflowIdOrderByStartTimeDesc(workflowId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExecutionResponse cancelExecution(String executionId) {
        WorkflowExecution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new NoSuchElementException("Execution not found: " + executionId));

        if (execution.getStatus() == ExecutionStatus.RUNNING) {
            Instant now = Instant.now();
            execution.setStatus(ExecutionStatus.CANCELLED);
            execution.setEndTime(now);
            if (execution.getStartTime() != null) {
                execution.setDurationMs(Duration.between(execution.getStartTime(), now).toMillis());
            }
            executionRepository.save(execution);

            List<NodeExecution> nodes = nodeExecutionRepository.findByExecutionIdOrderByStartTimeAsc(executionId);
            for (NodeExecution node : nodes) {
                if (node.getStatus() == NodeStatus.PENDING || node.getStatus() == NodeStatus.READY) {
                    node.setStatus(NodeStatus.SKIPPED);
                    nodeExecutionRepository.save(node);
                }
            }
        }
        return mapToResponse(execution);
    }

    private WorkflowNode findNodeInGraph(WorkflowGraph graph, String nodeId) {
        if (graph == null || graph.getNodes() == null) return null;
        return graph.getNodes().stream()
                .filter(n -> n.getId().equals(nodeId))
                .findFirst()
                .orElse(null);
    }

    private WorkflowGraph extractGraphFromContext(Map<String, Object> context) {
        if (context == null || !context.containsKey("__graph")) return null;
        try {
            String json = (String) context.get("__graph");
            return objectMapper.readValue(json, WorkflowGraph.class);
        } catch (Exception e) {
            return null;
        }
    }

    public ExecutionResponse mapToResponse(WorkflowExecution execution) {
        List<NodeExecution> nodeEntities = nodeExecutionRepository.findByExecutionIdOrderByStartTimeAsc(execution.getId());
        List<NodeExecutionResponse> nodeResponses = nodeEntities.stream().map(n ->
                NodeExecutionResponse.builder()
                        .id(n.getId())
                        .executionId(n.getExecution().getId())
                        .nodeId(n.getNodeId())
                        .nodeName(n.getNodeName())
                        .nodeType(n.getNodeType())
                        .status(n.getStatus())
                        .inputPayload(n.getInputPayload())
                        .outputPayload(n.getOutputPayload())
                        .branchSelected(n.getBranchSelected())
                        .errorMessage(n.getErrorMessage())
                        .attempt(n.getAttempt())
                        .startTime(n.getStartTime())
                        .endTime(n.getEndTime())
                        .durationMs(n.getDurationMs())
                        .build()
        ).collect(Collectors.toList());

        return ExecutionResponse.builder()
                .id(execution.getId())
                .workflowId(execution.getWorkflowId())
                .workflowVersionId(execution.getWorkflowVersionId())
                .status(execution.getStatus())
                .triggerSource(execution.getTriggerSource())
                .triggerPayload(execution.getTriggerPayload())
                .contextData(execution.getContextData())
                .startTime(execution.getStartTime())
                .endTime(execution.getEndTime())
                .durationMs(execution.getDurationMs())
                .errorMessage(execution.getErrorMessage())
                .nodeExecutions(nodeResponses)
                .build();
    }
}
