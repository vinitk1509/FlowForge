package com.flowforge.workflow.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowforge.common.model.NodeType;
import com.flowforge.common.model.WorkflowEdge;
import com.flowforge.common.model.WorkflowGraph;
import com.flowforge.common.model.WorkflowNode;
import com.flowforge.workflow.dto.CreateWorkflowRequest;
import com.flowforge.workflow.dto.UpdateWorkflowRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class WorkflowControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldManageWorkflowLifecycleAndValidateDagOnActivation() throws Exception {
        UUID userId = UUID.randomUUID();

        // 1. Create Workflow
        CreateWorkflowRequest createRequest = CreateWorkflowRequest.builder()
                .name("Order Processing Pipeline")
                .description("Processes inbound orders via webhook")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/v1/workflows")
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Order Processing Pipeline"))
                .andExpect(jsonPath("$.data.isActive").value(false))
                .andReturn();

        String workflowId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 2. Add an invalid graph with a cycle
        WorkflowNode trigger = WorkflowNode.builder().id("node-1").type(NodeType.TRIGGER_WEBHOOK).build();
        WorkflowNode actionA = WorkflowNode.builder().id("node-2").type(NodeType.ACTION_HTTP).build();
        WorkflowNode actionB = WorkflowNode.builder().id("node-3").type(NodeType.ACTION_SLACK).build();

        // Cycle: node-2 -> node-3 -> node-2
        WorkflowEdge e1 = WorkflowEdge.builder().id("e1").sourceNodeId("node-1").targetNodeId("node-2").build();
        WorkflowEdge e2 = WorkflowEdge.builder().id("e2").sourceNodeId("node-2").targetNodeId("node-3").build();
        WorkflowEdge e3 = WorkflowEdge.builder().id("e3").sourceNodeId("node-3").targetNodeId("node-2").build();

        WorkflowGraph cyclicGraph = WorkflowGraph.builder()
                .nodes(List.of(trigger, actionA, actionB))
                .edges(List.of(e1, e2, e3))
                .build();

        UpdateWorkflowRequest updateCyclic = UpdateWorkflowRequest.builder()
                .graph(cyclicGraph)
                .build();

        mockMvc.perform(put("/api/v1/workflows/" + workflowId)
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateCyclic)))
                .andExpect(status().isOk());

        // 3. Attempting to activate should fail because of cycle
        mockMvc.perform(post("/api/v1/workflows/" + workflowId + "/activate")
                        .header("X-User-Id", userId.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Cycle detected")));

        // 4. Fix graph to valid DAG: node-1 -> node-2 -> node-3
        WorkflowEdge validE3 = WorkflowEdge.builder().id("e3").sourceNodeId("node-2").targetNodeId("node-3").build();
        WorkflowGraph validGraph = WorkflowGraph.builder()
                .nodes(List.of(trigger, actionA, actionB))
                .edges(List.of(e1, validE3))
                .build();

        UpdateWorkflowRequest updateValid = UpdateWorkflowRequest.builder()
                .graph(validGraph)
                .build();

        mockMvc.perform(put("/api/v1/workflows/" + workflowId)
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateValid)))
                .andExpect(status().isOk());

        // 5. Activate should succeed now
        mockMvc.perform(post("/api/v1/workflows/" + workflowId + "/activate")
                        .header("X-User-Id", userId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.isActive").value(true))
                .andExpect(jsonPath("$.data.isCurrentVersionImmutable").value(true));

        // 6. User isolation test: Another user cannot view or modify this workflow
        UUID otherUserId = UUID.randomUUID();
        mockMvc.perform(get("/api/v1/workflows/" + workflowId)
                        .header("X-User-Id", otherUserId.toString()))
                .andExpect(status().isBadRequest());
    }
}
