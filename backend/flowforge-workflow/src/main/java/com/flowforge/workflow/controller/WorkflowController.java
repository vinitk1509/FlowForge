package com.flowforge.workflow.controller;

import com.flowforge.common.dto.ApiResponse;
import com.flowforge.workflow.dto.CreateWorkflowRequest;
import com.flowforge.workflow.dto.UpdateWorkflowRequest;
import com.flowforge.workflow.dto.WorkflowResponse;
import com.flowforge.workflow.service.WorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workflows")
@RequiredArgsConstructor
public class WorkflowController {

    private final WorkflowService workflowService;

    @PostMapping
    public ResponseEntity<ApiResponse<WorkflowResponse>> createWorkflow(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @Valid @RequestBody CreateWorkflowRequest request) {
        UUID userId = resolveUserId(userIdHeader);
        WorkflowResponse response = workflowService.createWorkflow(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Workflow created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkflowResponse>>> listWorkflows(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        UUID userId = resolveUserId(userIdHeader);
        List<WorkflowResponse> response = workflowService.listWorkflows(userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkflowResponse>> getWorkflow(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable UUID id) {
        UUID userId = resolveUserId(userIdHeader);
        WorkflowResponse response = workflowService.getWorkflow(userId, id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkflowResponse>> updateWorkflow(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateWorkflowRequest request) {
        UUID userId = resolveUserId(userIdHeader);
        WorkflowResponse response = workflowService.updateWorkflow(userId, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Workflow updated successfully", response));
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<WorkflowResponse>> activateWorkflow(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable UUID id) {
        UUID userId = resolveUserId(userIdHeader);
        WorkflowResponse response = workflowService.activateWorkflow(userId, id);
        return ResponseEntity.ok(ApiResponse.ok("Workflow activated successfully", response));
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<WorkflowResponse>> deactivateWorkflow(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable UUID id) {
        UUID userId = resolveUserId(userIdHeader);
        WorkflowResponse response = workflowService.deactivateWorkflow(userId, id);
        return ResponseEntity.ok(ApiResponse.ok("Workflow deactivated successfully", response));
    }

    private UUID resolveUserId(String userIdHeader) {
        if (userIdHeader != null && !userIdHeader.trim().isEmpty()) {
            return UUID.fromString(userIdHeader);
        }
        // Default demo user ID for direct testing without gateway
        return UUID.fromString("00000000-0000-0000-0000-000000000001");
    }
}
