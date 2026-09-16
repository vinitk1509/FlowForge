package com.flowforge.common.events;

import com.flowforge.common.model.NodeType;
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
public class NodeReadyEvent {
    private String executionId;
    private String workflowId;
    private String workflowVersionId;
    private String nodeId;
    private String nodeName;
    private NodeType nodeType;
    
    @Builder.Default
    private Map<String, Object> nodeConfig = new HashMap<>();
    
    @Builder.Default
    private Map<String, Object> resolvedInputs = new HashMap<>();
    
    private String credentialsRef;
    
    @Builder.Default
    private int attempt = 1;
    
    @Builder.Default
    private Instant timestamp = Instant.now();
}
