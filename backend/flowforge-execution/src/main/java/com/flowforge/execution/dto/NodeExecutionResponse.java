package com.flowforge.execution.dto;

import com.flowforge.common.model.NodeStatus;
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
public class NodeExecutionResponse {
    private String id;
    private String executionId;
    private String nodeId;
    private String nodeName;
    private String nodeType;
    private NodeStatus status;
    private Map<String, Object> inputPayload;
    private Map<String, Object> outputPayload;
    private String branchSelected;
    private String errorMessage;
    private int attempt;
    private Instant startTime;
    private Instant endTime;
    private Long durationMs;
}
