package com.flowforge.common.validator;

import com.flowforge.common.model.NodeType;
import com.flowforge.common.model.WorkflowEdge;
import com.flowforge.common.model.WorkflowGraph;
import com.flowforge.common.model.WorkflowNode;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DagValidatorTest {

    @Test
    void shouldValidateValidLinearWorkflow() {
        WorkflowNode trigger = WorkflowNode.builder()
                .id("node-1")
                .name("Manual Trigger")
                .type(NodeType.TRIGGER_MANUAL)
                .build();

        WorkflowNode httpAction = WorkflowNode.builder()
                .id("node-2")
                .name("Call Payment API")
                .type(NodeType.ACTION_HTTP)
                .build();

        WorkflowEdge edge = WorkflowEdge.builder()
                .id("edge-1")
                .sourceNodeId("node-1")
                .targetNodeId("node-2")
                .build();

        WorkflowGraph graph = WorkflowGraph.builder()
                .nodes(List.of(trigger, httpAction))
                .edges(List.of(edge))
                .build();

        ValidationResult result = DagValidator.validate(graph);
        assertThat(result.isValid()).isTrue();
        assertThat(result.getErrors()).isEmpty();
    }

    @Test
    void shouldDetectCycleInWorkflow() {
        WorkflowNode trigger = WorkflowNode.builder().id("1").type(NodeType.TRIGGER_MANUAL).build();
        WorkflowNode action1 = WorkflowNode.builder().id("2").type(NodeType.ACTION_HTTP).build();
        WorkflowNode action2 = WorkflowNode.builder().id("3").type(NodeType.ACTION_SLACK).build();

        // 1 -> 2 -> 3 -> 2 (Cycle between 2 and 3)
        WorkflowEdge e1 = WorkflowEdge.builder().id("e1").sourceNodeId("1").targetNodeId("2").build();
        WorkflowEdge e2 = WorkflowEdge.builder().id("e2").sourceNodeId("2").targetNodeId("3").build();
        WorkflowEdge e3 = WorkflowEdge.builder().id("e3").sourceNodeId("3").targetNodeId("2").build();

        WorkflowGraph graph = WorkflowGraph.builder()
                .nodes(List.of(trigger, action1, action2))
                .edges(List.of(e1, e2, e3))
                .build();

        ValidationResult result = DagValidator.validate(graph);
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).anyMatch(e -> e.contains("Cycle detected"));
    }

    @Test
    void shouldDetectSelfLoop() {
        WorkflowNode trigger = WorkflowNode.builder().id("1").type(NodeType.TRIGGER_MANUAL).build();
        WorkflowNode action = WorkflowNode.builder().id("2").type(NodeType.ACTION_HTTP).build();

        WorkflowEdge e1 = WorkflowEdge.builder().id("e1").sourceNodeId("1").targetNodeId("2").build();
        WorkflowEdge e2 = WorkflowEdge.builder().id("e2").sourceNodeId("2").targetNodeId("2").build();

        WorkflowGraph graph = WorkflowGraph.builder()
                .nodes(List.of(trigger, action))
                .edges(List.of(e1, e2))
                .build();

        ValidationResult result = DagValidator.validate(graph);
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).anyMatch(e -> e.contains("Self-loop"));
    }

    @Test
    void shouldRejectWhenNoTriggerPresent() {
        WorkflowNode action = WorkflowNode.builder().id("1").type(NodeType.ACTION_HTTP).build();
        WorkflowGraph graph = WorkflowGraph.builder().nodes(List.of(action)).build();

        ValidationResult result = DagValidator.validate(graph);
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).anyMatch(e -> e.contains("at least one trigger node"));
    }

    @Test
    void shouldRejectTriggerWithIncomingEdge() {
        WorkflowNode trigger = WorkflowNode.builder().id("1").type(NodeType.TRIGGER_MANUAL).build();
        WorkflowNode action = WorkflowNode.builder().id("2").type(NodeType.ACTION_HTTP).build();

        WorkflowEdge e1 = WorkflowEdge.builder().id("e1").sourceNodeId("2").targetNodeId("1").build();

        WorkflowGraph graph = WorkflowGraph.builder()
                .nodes(List.of(trigger, action))
                .edges(List.of(e1))
                .build();

        ValidationResult result = DagValidator.validate(graph);
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).anyMatch(e -> e.contains("cannot have incoming edges"));
    }
}
