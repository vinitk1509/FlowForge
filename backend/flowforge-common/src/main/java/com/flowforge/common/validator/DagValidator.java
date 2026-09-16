package com.flowforge.common.validator;

import com.flowforge.common.model.NodeCategory;
import com.flowforge.common.model.WorkflowEdge;
import com.flowforge.common.model.WorkflowGraph;
import com.flowforge.common.model.WorkflowNode;

import java.util.*;

public class DagValidator {

    public static ValidationResult validate(WorkflowGraph graph) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        if (graph == null || graph.getNodes() == null || graph.getNodes().isEmpty()) {
            return ValidationResult.failure(List.of("Workflow must contain at least one node."));
        }

        List<WorkflowNode> nodes = graph.getNodes();
        List<WorkflowEdge> edges = graph.getEdges() != null ? graph.getEdges() : Collections.emptyList();

        Map<String, WorkflowNode> nodeMap = new HashMap<>();
        Set<String> triggerNodeIds = new HashSet<>();

        // 1. Verify Node ID uniqueness and identify triggers
        for (WorkflowNode node : nodes) {
            if (node.getId() == null || node.getId().trim().isEmpty()) {
                errors.add("Every node must have a non-empty ID.");
                continue;
            }
            if (nodeMap.containsKey(node.getId())) {
                errors.add("Duplicate node ID detected: " + node.getId());
            }
            if (node.getType() == null) {
                errors.add("Node '" + node.getId() + "' is missing a node type.");
            } else if (node.getType().getCategory() == NodeCategory.TRIGGER) {
                triggerNodeIds.add(node.getId());
            }
            nodeMap.put(node.getId(), node);
        }

        if (triggerNodeIds.isEmpty()) {
            errors.add("Workflow must have at least one trigger node (e.g. TRIGGER_MANUAL, TRIGGER_WEBHOOK, TRIGGER_SCHEDULE).");
        }

        // 2. Validate Edges
        Map<String, List<String>> adjacencyList = new HashMap<>();
        Map<String, Integer> inDegree = new HashMap<>();
        for (String nodeId : nodeMap.keySet()) {
            adjacencyList.put(nodeId, new ArrayList<>());
            inDegree.put(nodeId, 0);
        }

        for (WorkflowEdge edge : edges) {
            if (edge.getSourceNodeId() == null || edge.getTargetNodeId() == null) {
                errors.add("Edge must specify both sourceNodeId and targetNodeId.");
                continue;
            }
            if (!nodeMap.containsKey(edge.getSourceNodeId())) {
                errors.add("Edge references non-existent source node: " + edge.getSourceNodeId());
                continue;
            }
            if (!nodeMap.containsKey(edge.getTargetNodeId())) {
                errors.add("Edge references non-existent target node: " + edge.getTargetNodeId());
                continue;
            }
            if (edge.getSourceNodeId().equals(edge.getTargetNodeId())) {
                errors.add("Self-loop edge detected on node: " + edge.getSourceNodeId());
                continue;
            }

            // Triggers should not have incoming edges
            if (triggerNodeIds.contains(edge.getTargetNodeId())) {
                errors.add("Trigger node '" + edge.getTargetNodeId() + "' cannot have incoming edges.");
            }

            adjacencyList.get(edge.getSourceNodeId()).add(edge.getTargetNodeId());
            inDegree.put(edge.getTargetNodeId(), inDegree.get(edge.getTargetNodeId()) + 1);
        }

        // 3. Cycle Detection using Kahn's Algorithm
        Queue<String> queue = new LinkedList<>();
        for (Map.Entry<String, Integer> entry : inDegree.entrySet()) {
            if (entry.getValue() == 0) {
                queue.add(entry.getKey());
            }
        }

        int visitedCount = 0;
        while (!queue.isEmpty()) {
            String current = queue.poll();
            visitedCount++;

            for (String neighbor : adjacencyList.get(current)) {
                int updatedInDegree = inDegree.get(neighbor) - 1;
                inDegree.put(neighbor, updatedInDegree);
                if (updatedInDegree == 0) {
                    queue.add(neighbor);
                }
            }
        }

        if (visitedCount < nodeMap.size()) {
            errors.add("Cycle detected in workflow graph! Workflows must be Directed Acyclic Graphs (DAG).");
        }

        // 4. Check for Orphaned / Unreachable nodes
        for (WorkflowNode node : nodes) {
            if (!triggerNodeIds.contains(node.getId())) {
                // If it's not a trigger and has inDegree == 0 initially, check whether it was ever reached
                boolean hasIncoming = edges.stream().anyMatch(e -> node.getId().equals(e.getTargetNodeId()));
                if (!hasIncoming) {
                    warnings.add("Node '" + node.getId() + "' (" + node.getName() + ") has no incoming connections and is unreachable.");
                }
            }
        }

        boolean isValid = errors.isEmpty();
        return ValidationResult.builder()
                .valid(isValid)
                .errors(errors)
                .warnings(warnings)
                .build();
    }
}
