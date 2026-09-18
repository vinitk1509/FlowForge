package com.flowforge.common.constants;

public final class KafkaTopics {
    private KafkaTopics() {}

    public static final String WORKFLOW_TRIGGERED = "workflow.triggered";
    public static final String NODE_READY = "node.ready";
    public static final String NODE_COMPLETED = "node.completed";
    public static final String NODE_FAILED = "node.failed";
    public static final String WORKFLOW_COMPLETED = "workflow.completed";
}
