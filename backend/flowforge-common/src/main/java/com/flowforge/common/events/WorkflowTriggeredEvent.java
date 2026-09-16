package com.flowforge.common.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTriggeredEvent {
    private String executionId;
    private String workflowId;
    private String workflowVersionId;
    private String triggerNodeId;
    private String triggerType;
    private Map<String, Object> triggerPayload;
    
    @Builder.Default
    private Instant timestamp = Instant.now();
}
