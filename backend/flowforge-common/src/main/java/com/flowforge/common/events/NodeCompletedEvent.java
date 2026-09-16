package com.flowforge.common.events;

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
public class NodeCompletedEvent {
    private String executionId;
    private String workflowId;
    private String nodeId;
    
    @Builder.Default
    private Map<String, Object> outputData = new HashMap<>();
    
    private String activeBranchHandle; // e.g., "true", "false", or "default"
    private long durationMs;
    
    @Builder.Default
    private Instant timestamp = Instant.now();
}
