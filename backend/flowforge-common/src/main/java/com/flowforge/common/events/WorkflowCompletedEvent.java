package com.flowforge.common.events;

import com.flowforge.common.model.ExecutionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowCompletedEvent {
    private String executionId;
    private String workflowId;
    private String workflowVersionId;
    private ExecutionStatus status;
    
    @Builder.Default
    private Map<String, Object> finalOutputs = new HashMap<>();
    
    private long durationMs;
    private String errorMessage;
    
    @Builder.Default
    private Instant timestamp = Instant.now();
}
