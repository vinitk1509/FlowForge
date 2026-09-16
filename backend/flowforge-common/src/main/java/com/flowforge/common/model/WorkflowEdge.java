package com.flowforge.common.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowEdge {
    private String id;
    private String sourceNodeId;
    private String targetNodeId;
    
    @Builder.Default
    private String sourceHandle = "default"; // e.g. "default", "true", "false"
    
    @Builder.Default
    private String targetHandle = "default";
}
