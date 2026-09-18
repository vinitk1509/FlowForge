package com.flowforge.execution.config;

import com.flowforge.common.constants.KafkaTopics;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic workflowTriggeredTopic() {
        return TopicBuilder.name(KafkaTopics.WORKFLOW_TRIGGERED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic nodeReadyTopic() {
        return TopicBuilder.name(KafkaTopics.NODE_READY)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic nodeCompletedTopic() {
        return TopicBuilder.name(KafkaTopics.NODE_COMPLETED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic nodeFailedTopic() {
        return TopicBuilder.name(KafkaTopics.NODE_FAILED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic workflowCompletedTopic() {
        return TopicBuilder.name(KafkaTopics.WORKFLOW_COMPLETED)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
