package com.flowforge.execution.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowforge.common.model.WorkflowGraph;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Optional;

@Slf4j
@Service
public class WorkflowClient {

    private final RestTemplate restTemplate;
    private final String workflowServiceUrl;
    private final ObjectMapper objectMapper;

    public WorkflowClient(RestTemplateBuilder builder,
                          @Value("${flowforge.services.workflow-url:http://localhost:8082}") String workflowServiceUrl,
                          ObjectMapper objectMapper) {
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofSeconds(3))
                .setReadTimeout(Duration.ofSeconds(5))
                .build();
        this.workflowServiceUrl = workflowServiceUrl;
        this.objectMapper = objectMapper;
    }

    public Optional<WorkflowGraph> fetchWorkflowGraph(String workflowId) {
        try {
            String url = workflowServiceUrl + "/api/v1/workflows/" + workflowId;
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode graphNode = root.path("data").path("graph");
                if (!graphNode.isMissingNode() && !graphNode.isNull()) {
                    WorkflowGraph graph = objectMapper.treeToValue(graphNode, WorkflowGraph.class);
                    return Optional.ofNullable(graph);
                }
            }
        } catch (Exception e) {
            log.warn("Could not retrieve workflow graph from workflow-service for workflowId [{}]: {}", workflowId, e.getMessage());
        }
        return Optional.empty();
    }
}
