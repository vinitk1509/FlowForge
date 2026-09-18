package com.flowforge.execution.producer;

import com.flowforge.common.constants.KafkaTopics;
import com.flowforge.common.events.NodeReadyEvent;
import com.flowforge.common.events.WorkflowCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExecutionEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishNodeReady(NodeReadyEvent event) {
        log.info("Emitting [{}] event for execution [{}] node [{}] ({})",
                KafkaTopics.NODE_READY, event.getExecutionId(), event.getNodeId(), event.getNodeType());
        kafkaTemplate.send(KafkaTopics.NODE_READY, event.getExecutionId(), event);
    }

    public void publishWorkflowCompleted(WorkflowCompletedEvent event) {
        log.info("Emitting [{}] event for execution [{}] status [{}] duration [{}ms]",
                KafkaTopics.WORKFLOW_COMPLETED, event.getExecutionId(), event.getStatus(), event.getDurationMs());
        kafkaTemplate.send(KafkaTopics.WORKFLOW_COMPLETED, event.getExecutionId(), event);
    }
}
