package com.flowforge.execution.consumer;

import com.flowforge.common.constants.KafkaTopics;
import com.flowforge.common.events.WorkflowTriggeredEvent;
import com.flowforge.execution.service.ExecutionOrchestratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WorkflowTriggerConsumer {

    private final ExecutionOrchestratorService orchestratorService;

    @KafkaListener(topics = KafkaTopics.WORKFLOW_TRIGGERED, groupId = "flowforge-execution-group")
    public void consumeWorkflowTrigger(WorkflowTriggeredEvent event) {
        log.info("Received [{}] event for workflow [{}] trigger [{}]",
                KafkaTopics.WORKFLOW_TRIGGERED, event.getWorkflowId(), event.getTriggerType());
        try {
            orchestratorService.startExecution(
                    event.getWorkflowId(),
                    event.getWorkflowVersionId(),
                    null,
                    event.getTriggerPayload(),
                    event.getTriggerType()
            );
        } catch (Exception e) {
            log.error("Failed to start execution from Kafka trigger event for workflow [{}]: {}",
                    event.getWorkflowId(), e.getMessage(), e);
        }
    }
}
