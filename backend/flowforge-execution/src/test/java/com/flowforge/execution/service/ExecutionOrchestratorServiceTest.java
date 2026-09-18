package com.flowforge.execution.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowforge.common.events.NodeCompletedEvent;
import com.flowforge.common.events.NodeFailedEvent;
import com.flowforge.common.events.NodeReadyEvent;
import com.flowforge.common.events.WorkflowCompletedEvent;
import com.flowforge.common.model.*;
import com.flowforge.execution.dto.ExecutionResponse;
import com.flowforge.execution.entity.NodeExecution;
import com.flowforge.execution.entity.WorkflowExecution;
import com.flowforge.execution.producer.ExecutionEventProducer;
import com.flowforge.execution.repository.NodeExecutionRepository;
import com.flowforge.execution.repository.WorkflowExecutionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExecutionOrchestratorServiceTest {

    @Mock
    private WorkflowExecutionRepository executionRepository;

    @Mock
    private NodeExecutionRepository nodeExecutionRepository;

    @Mock
    private ExecutionEventProducer eventProducer;

    @Mock
    private DistributedLockService lockService;

    @Mock
    private WorkflowClient workflowClient;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private ExecutionOrchestratorService orchestratorService;

    private WorkflowGraph linearGraph;

    @BeforeEach
    void setUp() {
        lenient().when(lockService.acquireLock(any(), any(), any())).thenReturn(true);

        // Build A -> B -> C linear graph
        WorkflowNode nodeA = WorkflowNode.builder().id("node-a").name("Trigger Webhook").type(NodeType.TRIGGER_WEBHOOK).build();
        WorkflowNode nodeB = WorkflowNode.builder().id("node-b").name("Transform JSON").type(NodeType.DATA_TRANSFORM).build();
        WorkflowNode nodeC = WorkflowNode.builder().id("node-c").name("Send Email").type(NodeType.ACTION_EMAIL).build();

        WorkflowEdge edgeAB = WorkflowEdge.builder().id("edge-1").sourceNodeId("node-a").targetNodeId("node-b").build();
        WorkflowEdge edgeBC = WorkflowEdge.builder().id("edge-2").sourceNodeId("node-b").targetNodeId("node-c").build();

        linearGraph = WorkflowGraph.builder()
                .nodes(List.of(nodeA, nodeB, nodeC))
                .edges(List.of(edgeAB, edgeBC))
                .build();
    }

    @Test
    @DisplayName("Should start execution, initialize all nodes, and emit NodeReadyEvent for entry node")
    void shouldStartExecutionSuccessfully() {
        when(executionRepository.save(any(WorkflowExecution.class))).thenAnswer(i -> i.getArgument(0));

        Map<String, Object> triggerPayload = Map.of("orderId", "ORD-12345");
        ExecutionResponse response = orchestratorService.startExecution(
                "wf-100", "v1", linearGraph, triggerPayload, "WEBHOOK");

        assertThat(response).isNotNull();
        assertThat(response.getWorkflowId()).isEqualTo("wf-100");
        assertThat(response.getStatus()).isEqualTo(ExecutionStatus.RUNNING);

        // Verify NodeReadyEvent was emitted for entry node-a
        ArgumentCaptor<NodeReadyEvent> readyCaptor = ArgumentCaptor.forClass(NodeReadyEvent.class);
        verify(eventProducer, times(1)).publishNodeReady(readyCaptor.capture());
        assertThat(readyCaptor.getValue().getNodeId()).isEqualTo("node-a");
    }

    @Test
    @DisplayName("Should unblock child node when parent completes in linear DAG")
    void shouldUnblockChildNodeWhenParentCompletes() throws Exception {
        String executionId = "exec-test-1";
        WorkflowExecution execution = WorkflowExecution.builder()
                .id(executionId)
                .workflowId("wf-100")
                .status(ExecutionStatus.RUNNING)
                .contextData(new HashMap<>(Map.of("__graph", objectMapper.writeValueAsString(linearGraph))))
                .startTime(Instant.now())
                .build();

        NodeExecution nodeExecA = NodeExecution.builder()
                .id("ne-a").execution(execution).nodeId("node-a").nodeName("Trigger").nodeType("TRIGGER_WEBHOOK")
                .status(NodeStatus.RUNNING).build();
        NodeExecution nodeExecB = NodeExecution.builder()
                .id("ne-b").execution(execution).nodeId("node-b").nodeName("Transform").nodeType("TRANSFORM_JSON")
                .status(NodeStatus.PENDING).build();
        NodeExecution nodeExecC = NodeExecution.builder()
                .id("ne-c").execution(execution).nodeId("node-c").nodeName("Email").nodeType("ACTION_EMAIL")
                .status(NodeStatus.PENDING).build();

        when(executionRepository.findById(executionId)).thenReturn(Optional.of(execution));
        when(nodeExecutionRepository.findByExecutionIdAndNodeId(executionId, "node-a")).thenReturn(Optional.of(nodeExecA));
        when(nodeExecutionRepository.findByExecutionIdAndNodeId(executionId, "node-b")).thenReturn(Optional.of(nodeExecB));
        when(nodeExecutionRepository.findByExecutionIdOrderByStartTimeAsc(executionId))
                .thenReturn(List.of(nodeExecA, nodeExecB, nodeExecC));

        NodeCompletedEvent completedA = NodeCompletedEvent.builder()
                .executionId(executionId)
                .workflowId("wf-100")
                .nodeId("node-a")
                .outputData(Map.of("amount", 250))
                .durationMs(45)
                .build();

        orchestratorService.handleNodeCompleted(completedA);

        assertThat(nodeExecA.getStatus()).isEqualTo(NodeStatus.SUCCEEDED);
        assertThat(nodeExecB.getStatus()).isEqualTo(NodeStatus.READY);

        ArgumentCaptor<NodeReadyEvent> readyCaptor = ArgumentCaptor.forClass(NodeReadyEvent.class);
        verify(eventProducer, times(1)).publishNodeReady(readyCaptor.capture());
        assertThat(readyCaptor.getValue().getNodeId()).isEqualTo("node-b");
    }

    @Test
    @DisplayName("Should handle conditional branching and mark untaken branch as SKIPPED")
    void shouldHandleConditionalBranching() throws Exception {
        String executionId = "exec-test-branch";

        // Graph: A (Condition) -> TRUE -> NodeB, FALSE -> NodeC
        WorkflowNode nodeBranch = WorkflowNode.builder().id("node-if").name("Check VIP").type(NodeType.LOGIC_IF).build();
        WorkflowNode nodeTrue = WorkflowNode.builder().id("node-vip").name("Notify VIP Slack").type(NodeType.ACTION_SLACK).build();
        WorkflowNode nodeFalse = WorkflowNode.builder().id("node-std").name("Send Standard Receipt").type(NodeType.ACTION_EMAIL).build();

        WorkflowEdge edgeTrue = WorkflowEdge.builder().id("e-true").sourceNodeId("node-if").targetNodeId("node-vip").sourceHandle("true").build();
        WorkflowEdge edgeFalse = WorkflowEdge.builder().id("e-false").sourceNodeId("node-if").targetNodeId("node-std").sourceHandle("false").build();

        WorkflowGraph branchGraph = WorkflowGraph.builder()
                .nodes(List.of(nodeBranch, nodeTrue, nodeFalse))
                .edges(List.of(edgeTrue, edgeFalse))
                .build();

        WorkflowExecution execution = WorkflowExecution.builder()
                .id(executionId)
                .workflowId("wf-branch")
                .status(ExecutionStatus.RUNNING)
                .contextData(new HashMap<>(Map.of("__graph", objectMapper.writeValueAsString(branchGraph))))
                .startTime(Instant.now())
                .build();

        NodeExecution execBranch = NodeExecution.builder()
                .id("ne-if").execution(execution).nodeId("node-if").nodeName("Check VIP").nodeType("LOGIC_IF")
                .status(NodeStatus.RUNNING).build();
        NodeExecution execVip = NodeExecution.builder()
                .id("ne-vip").execution(execution).nodeId("node-vip").nodeName("Notify VIP").nodeType("ACTION_SLACK")
                .status(NodeStatus.PENDING).build();
        NodeExecution execStd = NodeExecution.builder()
                .id("ne-std").execution(execution).nodeId("node-std").nodeName("Standard").nodeType("ACTION_EMAIL")
                .status(NodeStatus.PENDING).build();

        when(executionRepository.findById(executionId)).thenReturn(Optional.of(execution));
        when(nodeExecutionRepository.findByExecutionIdAndNodeId(executionId, "node-if")).thenReturn(Optional.of(execBranch));
        when(nodeExecutionRepository.findByExecutionIdAndNodeId(executionId, "node-vip")).thenReturn(Optional.of(execVip));
        when(nodeExecutionRepository.findByExecutionIdAndNodeId(executionId, "node-std")).thenReturn(Optional.of(execStd));
        when(nodeExecutionRepository.findByExecutionIdOrderByStartTimeAsc(executionId))
                .thenReturn(List.of(execBranch, execVip, execStd));

        // Complete branch node with branch = "true"
        NodeCompletedEvent completedEvent = NodeCompletedEvent.builder()
                .executionId(executionId)
                .workflowId("wf-branch")
                .nodeId("node-if")
                .activeBranchHandle("true")
                .outputData(Map.of("isVip", true))
                .durationMs(30)
                .build();

        orchestratorService.handleNodeCompleted(completedEvent);

        // TRUE branch should be READY
        assertThat(execVip.getStatus()).isEqualTo(NodeStatus.READY);
        // FALSE branch should be SKIPPED
        assertThat(execStd.getStatus()).isEqualTo(NodeStatus.SKIPPED);

        ArgumentCaptor<NodeReadyEvent> readyCaptor = ArgumentCaptor.forClass(NodeReadyEvent.class);
        verify(eventProducer, times(1)).publishNodeReady(readyCaptor.capture());
        assertThat(readyCaptor.getValue().getNodeId()).isEqualTo("node-vip");
    }

    @Test
    @DisplayName("Should mark workflow as COMPLETED when all terminal nodes finish")
    void shouldMarkWorkflowCompleted() throws Exception {
        String executionId = "exec-done";

        WorkflowNode nodeOnly = WorkflowNode.builder().id("node-only").name("Run Task").type(NodeType.ACTION_HTTP).build();
        WorkflowGraph singleGraph = WorkflowGraph.builder().nodes(List.of(nodeOnly)).edges(Collections.emptyList()).build();

        WorkflowExecution execution = WorkflowExecution.builder()
                .id(executionId)
                .workflowId("wf-single")
                .status(ExecutionStatus.RUNNING)
                .contextData(new HashMap<>(Map.of("__graph", objectMapper.writeValueAsString(singleGraph))))
                .startTime(Instant.now())
                .build();

        NodeExecution nodeExec = NodeExecution.builder()
                .id("ne-1").execution(execution).nodeId("node-only").nodeName("Run Task").nodeType("ACTION_HTTP")
                .status(NodeStatus.RUNNING).build();

        when(executionRepository.findById(executionId)).thenReturn(Optional.of(execution));
        when(nodeExecutionRepository.findByExecutionIdAndNodeId(executionId, "node-only")).thenReturn(Optional.of(nodeExec));
        when(nodeExecutionRepository.findByExecutionIdOrderByStartTimeAsc(executionId))
                .thenReturn(List.of(nodeExec));

        NodeCompletedEvent event = NodeCompletedEvent.builder()
                .executionId(executionId)
                .workflowId("wf-single")
                .nodeId("node-only")
                .outputData(Map.of("status", 200))
                .durationMs(150)
                .build();

        orchestratorService.handleNodeCompleted(event);

        assertThat(execution.getStatus()).isEqualTo(ExecutionStatus.SUCCEEDED);
        assertThat(execution.getEndTime()).isNotNull();

        verify(eventProducer, times(1)).publishWorkflowCompleted(any(WorkflowCompletedEvent.class));
    }

    @Test
    @DisplayName("Should halt workflow and mark execution as FAILED when a node fails")
    void shouldHaltWorkflowOnNodeFailure() {
        String executionId = "exec-fail";

        WorkflowExecution execution = WorkflowExecution.builder()
                .id(executionId)
                .workflowId("wf-fail")
                .status(ExecutionStatus.RUNNING)
                .startTime(Instant.now())
                .build();

        NodeExecution nodeExec = NodeExecution.builder()
                .id("ne-err").execution(execution).nodeId("node-err").nodeName("Failing Node").nodeType("ACTION_HTTP")
                .status(NodeStatus.RUNNING).build();

        when(executionRepository.findById(executionId)).thenReturn(Optional.of(execution));
        when(nodeExecutionRepository.findByExecutionIdAndNodeId(executionId, "node-err")).thenReturn(Optional.of(nodeExec));
        when(nodeExecutionRepository.findByExecutionIdOrderByStartTimeAsc(executionId)).thenReturn(List.of(nodeExec));

        NodeFailedEvent failEvent = NodeFailedEvent.builder()
                .executionId(executionId)
                .workflowId("wf-fail")
                .nodeId("node-err")
                .errorMessage("Connection timed out to payment gateway")
                .build();

        orchestratorService.handleNodeFailed(failEvent);

        assertThat(execution.getStatus()).isEqualTo(ExecutionStatus.FAILED);
        assertThat(nodeExec.getStatus()).isEqualTo(NodeStatus.FAILED);
        assertThat(nodeExec.getErrorMessage()).contains("Connection timed out");

        verify(eventProducer, times(1)).publishWorkflowCompleted(any(WorkflowCompletedEvent.class));
    }
}
