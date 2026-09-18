package com.flowforge.execution.dto;

import com.flowforge.common.model.ExecutionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionResponse {
    private String id;
    private String workflowId;
    private String workflowVersionId;
    private ExecutionStatus status;
    private String triggerSource;
    private Map<String, Object> triggerPayload;
    private Map<String, Object> contextData;
    private Instant startTime;
    private Instant endTime;
    private Long durationMs;
    private String errorMessage;
    
    @Builder.Default
    private List<NodeExecutionResponse> nodeExecutions = new ArrayList<>();
}
