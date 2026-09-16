package com.flowforge.workflow.service;

import com.flowforge.common.model.WorkflowGraph;
import com.flowforge.common.validator.DagValidator;
import com.flowforge.common.validator.ValidationResult;
import com.flowforge.workflow.dto.CreateWorkflowRequest;
import com.flowforge.workflow.dto.UpdateWorkflowRequest;
import com.flowforge.workflow.dto.WorkflowResponse;
import com.flowforge.workflow.entity.Workflow;
import com.flowforge.workflow.entity.WorkflowVersion;
import com.flowforge.workflow.repository.WorkflowRepository;
import com.flowforge.workflow.repository.WorkflowVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final WorkflowVersionRepository workflowVersionRepository;

    @Transactional
    public WorkflowResponse createWorkflow(UUID userId, CreateWorkflowRequest request) {
        Workflow workflow = Workflow.builder()
                .userId(userId)
                .name(request.getName())
                .description(request.getDescription())
                .isActive(false)
                .build();

        Workflow savedWorkflow = workflowRepository.save(workflow);

        WorkflowGraph initialGraph = request.getGraph() != null ? request.getGraph() : new WorkflowGraph();
        WorkflowVersion version = WorkflowVersion.builder()
                .workflowId(savedWorkflow.getId())
                .versionNumber(1)
                .graphDefinition(initialGraph)
                .isImmutable(false)
                .build();

        WorkflowVersion savedVersion = workflowVersionRepository.save(version);

        return mapToResponse(savedWorkflow, savedVersion);
    }

    @Transactional(readOnly = true)
    public List<WorkflowResponse> listWorkflows(UUID userId) {
        return workflowRepository.findAllByUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(workflow -> {
                    WorkflowVersion version = workflowVersionRepository
                            .findFirstByWorkflowIdOrderByVersionNumberDesc(workflow.getId())
                            .orElse(null);
                    return mapToResponse(workflow, version);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkflowResponse getWorkflow(UUID userId, UUID workflowId) {
        Workflow workflow = findUserWorkflow(userId, workflowId);
        WorkflowVersion version = workflowVersionRepository
                .findFirstByWorkflowIdOrderByVersionNumberDesc(workflow.getId())
                .orElse(null);

        return mapToResponse(workflow, version);
    }

    @Transactional
    public WorkflowResponse updateWorkflow(UUID userId, UUID workflowId, UpdateWorkflowRequest request) {
        Workflow workflow = findUserWorkflow(userId, workflowId);

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            workflow.setName(request.getName());
        }
        if (request.getDescription() != null) {
            workflow.setDescription(request.getDescription());
        }

        WorkflowVersion currentVersion = workflowVersionRepository
                .findFirstByWorkflowIdOrderByVersionNumberDesc(workflow.getId())
                .orElseGet(() -> WorkflowVersion.builder()
                        .workflowId(workflow.getId())
                        .versionNumber(1)
                        .graphDefinition(new WorkflowGraph())
                        .isImmutable(false)
                        .build());

        if (request.getGraph() != null) {
            if (currentVersion.isImmutable()) {
                // If latest version is already immutable, create a new draft version
                currentVersion = WorkflowVersion.builder()
                        .workflowId(workflow.getId())
                        .versionNumber(currentVersion.getVersionNumber() + 1)
                        .graphDefinition(request.getGraph())
                        .isImmutable(false)
                        .build();
            } else {
                currentVersion.setGraphDefinition(request.getGraph());
            }
            currentVersion = workflowVersionRepository.save(currentVersion);
        }

        Workflow savedWorkflow = workflowRepository.save(workflow);
        return mapToResponse(savedWorkflow, currentVersion);
    }

    @Transactional
    public WorkflowResponse activateWorkflow(UUID userId, UUID workflowId) {
        Workflow workflow = findUserWorkflow(userId, workflowId);

        WorkflowVersion latestVersion = workflowVersionRepository
                .findFirstByWorkflowIdOrderByVersionNumberDesc(workflow.getId())
                .orElseThrow(() -> new IllegalStateException("No workflow version found to activate."));

        // Validate DAG prior to activation
        ValidationResult validationResult = DagValidator.validate(latestVersion.getGraphDefinition());
        if (!validationResult.isValid()) {
            throw new IllegalArgumentException("Workflow validation failed: " + String.join("; ", validationResult.getErrors()));
        }

        // Freeze this version as immutable
        latestVersion.setImmutable(true);
        workflowVersionRepository.save(latestVersion);

        workflow.setActiveVersionId(latestVersion.getId());
        workflow.setActive(true);
        Workflow savedWorkflow = workflowRepository.save(workflow);

        return mapToResponse(savedWorkflow, latestVersion);
    }

    @Transactional
    public WorkflowResponse deactivateWorkflow(UUID userId, UUID workflowId) {
        Workflow workflow = findUserWorkflow(userId, workflowId);
        workflow.setActive(false);
        Workflow savedWorkflow = workflowRepository.save(workflow);

        WorkflowVersion latestVersion = workflowVersionRepository
                .findFirstByWorkflowIdOrderByVersionNumberDesc(workflow.getId())
                .orElse(null);

        return mapToResponse(savedWorkflow, latestVersion);
    }

    private Workflow findUserWorkflow(UUID userId, UUID workflowId) {
        return workflowRepository.findByIdAndUserId(workflowId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Workflow not found or access denied for id: " + workflowId));
    }

    private WorkflowResponse mapToResponse(Workflow workflow, WorkflowVersion version) {
        return WorkflowResponse.builder()
                .id(workflow.getId())
                .userId(workflow.getUserId())
                .name(workflow.getName())
                .description(workflow.getDescription())
                .isActive(workflow.isActive())
                .activeVersionId(workflow.getActiveVersionId())
                .currentVersionNumber(version != null ? version.getVersionNumber() : null)
                .isCurrentVersionImmutable(version != null ? version.isImmutable() : null)
                .graph(version != null ? version.getGraphDefinition() : null)
                .createdAt(workflow.getCreatedAt())
                .updatedAt(workflow.getUpdatedAt())
                .build();
    }
}
