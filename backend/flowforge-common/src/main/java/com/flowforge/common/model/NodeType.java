package com.flowforge.common.model;

public enum NodeType {
    // Triggers
    TRIGGER_MANUAL(NodeCategory.TRIGGER),
    TRIGGER_WEBHOOK(NodeCategory.TRIGGER),
    TRIGGER_SCHEDULE(NodeCategory.TRIGGER),

    // Actions
    ACTION_HTTP(NodeCategory.ACTION),
    ACTION_EMAIL(NodeCategory.ACTION),
    ACTION_SLACK(NodeCategory.ACTION),
    ACTION_POSTGRESQL(NodeCategory.ACTION),

    // Logic
    LOGIC_IF(NodeCategory.LOGIC),

    // Data
    DATA_TRANSFORM(NodeCategory.DATA),
    DATA_SET_VARIABLE(NodeCategory.DATA);

    private final NodeCategory category;

    NodeType(NodeCategory category) {
        this.category = category;
    }

    public NodeCategory getCategory() {
        return category;
    }
}
