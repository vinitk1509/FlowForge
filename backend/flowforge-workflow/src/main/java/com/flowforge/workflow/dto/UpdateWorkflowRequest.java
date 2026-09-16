package com.flowforge.workflow.dto;

import com.flowforge.common.model.WorkflowGraph;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWorkflowRequest {
    private String name;
    private String description;
    private WorkflowGraph graph;
}
