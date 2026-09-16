package com.flowforge.common.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NodeFailedEvent {
    private String executionId;
    private String workflowId;
    private String nodeId;
    private String errorMessage;
    private String errorDetails;
    private boolean retryable;
    private int attempt;
    
    @Builder.Default
    private Instant timestamp = Instant.now();
}
