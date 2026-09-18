package com.flowforge.execution.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowforge.common.model.ExecutionStatus;
import com.flowforge.execution.dto.ExecutionResponse;
import com.flowforge.execution.dto.TriggerExecutionRequest;
import com.flowforge.execution.service.ExecutionOrchestratorService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ExecutionController.class)
class ExecutionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ExecutionOrchestratorService orchestratorService;

    @Test
    @DisplayName("POST /api/v1/executions/trigger/{workflowId} should trigger execution and return 201 CREATED")
    void shouldTriggerExecution() throws Exception {
        ExecutionResponse mockResponse = ExecutionResponse.builder()
                .id("exec-123")
                .workflowId("wf-456")
                .status(ExecutionStatus.RUNNING)
                .triggerSource("MANUAL")
                .startTime(Instant.now())
                .nodeExecutions(Collections.emptyList())
                .build();

        when(orchestratorService.startExecution(eq("wf-456"), any(), any(), any(), eq("MANUAL")))
                .thenReturn(mockResponse);

        TriggerExecutionRequest request = TriggerExecutionRequest.builder()
                .triggerSource("MANUAL")
                .payload(Map.of("customerId", "CUST-99"))
                .build();

        mockMvc.perform(post("/api/v1/executions/trigger/wf-456")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("exec-123"))
                .andExpect(jsonPath("$.data.status").value("RUNNING"));
    }

    @Test
    @DisplayName("GET /api/v1/executions/{id} should return execution details")
    void shouldGetExecutionById() throws Exception {
        ExecutionResponse mockResponse = ExecutionResponse.builder()
                .id("exec-123")
                .workflowId("wf-456")
                .status(ExecutionStatus.SUCCEEDED)
                .startTime(Instant.now())
                .durationMs(350L)
                .build();

        when(orchestratorService.getExecution("exec-123")).thenReturn(mockResponse);

        mockMvc.perform(get("/api/v1/executions/exec-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("exec-123"))
                .andExpect(jsonPath("$.data.status").value("SUCCEEDED"));
    }

    @Test
    @DisplayName("GET /api/v1/executions/workflow/{workflowId} should return execution history list")
    void shouldGetWorkflowExecutions() throws Exception {
        ExecutionResponse mockResponse = ExecutionResponse.builder()
                .id("exec-123")
                .workflowId("wf-456")
                .status(ExecutionStatus.SUCCEEDED)
                .build();

        when(orchestratorService.getWorkflowExecutions("wf-456")).thenReturn(List.of(mockResponse));

        mockMvc.perform(get("/api/v1/executions/workflow/wf-456"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value("exec-123"));
    }

    @Test
    @DisplayName("POST /api/v1/executions/{id}/cancel should cancel execution")
    void shouldCancelExecution() throws Exception {
        ExecutionResponse mockResponse = ExecutionResponse.builder()
                .id("exec-123")
                .workflowId("wf-456")
                .status(ExecutionStatus.CANCELLED)
                .build();

        when(orchestratorService.cancelExecution("exec-123")).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/executions/exec-123/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));
    }
}
