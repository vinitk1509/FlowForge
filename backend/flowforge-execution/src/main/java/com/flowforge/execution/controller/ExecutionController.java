package com.flowforge.execution.controller;

import com.flowforge.common.dto.ApiResponse;
import com.flowforge.execution.dto.ExecutionResponse;
import com.flowforge.execution.dto.TriggerExecutionRequest;
import com.flowforge.execution.service.ExecutionOrchestratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/executions")
@RequiredArgsConstructor
public class ExecutionController {

    private final ExecutionOrchestratorService orchestratorService;

    @PostMapping("/trigger/{workflowId}")
    public ResponseEntity<ApiResponse<ExecutionResponse>> triggerExecution(
            @PathVariable String workflowId,
            @RequestBody(required = false) TriggerExecutionRequest request) {
        
        TriggerExecutionRequest safeRequest = request != null ? request : new TriggerExecutionRequest();
        ExecutionResponse response = orchestratorService.startExecution(
                workflowId,
                safeRequest.getWorkflowVersionId(),
                safeRequest.getGraph(),
                safeRequest.getPayload() != null ? safeRequest.getPayload() : Collections.emptyMap(),
                safeRequest.getTriggerSource() != null ? safeRequest.getTriggerSource() : "MANUAL"
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Workflow execution triggered successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExecutionResponse>> getExecution(@PathVariable String id) {
        ExecutionResponse response = orchestratorService.getExecution(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/workflow/{workflowId}")
    public ResponseEntity<ApiResponse<List<ExecutionResponse>>> getWorkflowExecutions(@PathVariable String workflowId) {
        List<ExecutionResponse> responses = orchestratorService.getWorkflowExecutions(workflowId);
        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<ExecutionResponse>> cancelExecution(@PathVariable String id) {
        ExecutionResponse response = orchestratorService.cancelExecution(id);
        return ResponseEntity.ok(ApiResponse.ok("Execution cancelled successfully", response));
    }
}
