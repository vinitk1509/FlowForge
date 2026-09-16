package com.flowforge.workflow.dto;

import com.flowforge.common.model.WorkflowGraph;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowResponse {
    private UUID id;
    private UUID userId;
    private String name;
    private String description;
    @com.fasterxml.jackson.annotation.JsonProperty("isActive")
    private boolean isActive;
    private UUID activeVersionId;
    private Integer currentVersionNumber;
    private Boolean isCurrentVersionImmutable;
    private WorkflowGraph graph;
    private Instant createdAt;
    private Instant updatedAt;
}
