package com.flowforge.common.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowNode {
    private String id;
    private String name;
    private NodeType type;
    
    @Builder.Default
    private Position position = new Position(0.0, 0.0);

    @Builder.Default
    private Map<String, Object> config = new HashMap<>();

    private String credentialsRef;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Position {
        private Double x;
        private Double y;
    }
}
