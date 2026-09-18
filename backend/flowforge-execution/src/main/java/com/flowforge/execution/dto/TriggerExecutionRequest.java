package com.flowforge.execution.dto;

import com.flowforge.common.model.WorkflowGraph;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriggerExecutionRequest {
    private String workflowVersionId;
    
    @Builder.Default
    private Map<String, Object> payload = new HashMap<>();
    
    private String triggerSource; // e.g. "MANUAL", "WEBHOOK", "SCHEDULE"

    // Optional direct graph submission (for testing or immediate execution)
    private WorkflowGraph graph;
}
