package com.flowforge.common.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowGraph {
    @Builder.Default
    private List<WorkflowNode> nodes = new ArrayList<>();

    @Builder.Default
    private List<WorkflowEdge> edges = new ArrayList<>();
}
