package com.flowforge.workflow.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowforge.common.model.WorkflowGraph;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class WorkflowGraphConverter implements AttributeConverter<WorkflowGraph, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(WorkflowGraph graph) {
        if (graph == null) {
            return "{\"nodes\":[],\"edges\":[]}";
        }
        try {
            return objectMapper.writeValueAsString(graph);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Failed to serialize WorkflowGraph to JSON string", e);
        }
    }

    @Override
    public WorkflowGraph convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return new WorkflowGraph();
        }
        try {
            return objectMapper.readValue(dbData, WorkflowGraph.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Failed to deserialize JSON string to WorkflowGraph", e);
        }
    }
}
