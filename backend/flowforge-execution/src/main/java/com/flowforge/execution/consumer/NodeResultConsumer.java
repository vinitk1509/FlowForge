package com.flowforge.execution.consumer;

import com.flowforge.common.constants.KafkaTopics;
import com.flowforge.common.events.NodeCompletedEvent;
import com.flowforge.common.events.NodeFailedEvent;
import com.flowforge.execution.service.ExecutionOrchestratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NodeResultConsumer {

    private final ExecutionOrchestratorService orchestratorService;

    @KafkaListener(topics = KafkaTopics.NODE_COMPLETED, groupId = "flowforge-execution-group")
    public void consumeNodeCompleted(NodeCompletedEvent event) {
        log.info("Received [{}] event for execution [{}] node [{}] (branch: {})",
                KafkaTopics.NODE_COMPLETED, event.getExecutionId(), event.getNodeId(), event.getActiveBranchHandle());
        try {
            orchestratorService.handleNodeCompleted(event);
        } catch (Exception e) {
            log.error("Error processing node completed event for execution [{}] node [{}]: {}",
                    event.getExecutionId(), event.getNodeId(), e.getMessage(), e);
        }
    }

    @KafkaListener(topics = KafkaTopics.NODE_FAILED, groupId = "flowforge-execution-group")
    public void consumeNodeFailed(NodeFailedEvent event) {
        log.warn("Received [{}] event for execution [{}] node [{}]: {}",
                KafkaTopics.NODE_FAILED, event.getExecutionId(), event.getNodeId(), event.getErrorMessage());
        try {
            orchestratorService.handleNodeFailed(event);
        } catch (Exception e) {
            log.error("Error processing node failed event for execution [{}] node [{}]: {}",
                    event.getExecutionId(), event.getNodeId(), e.getMessage(), e);
        }
    }
}
