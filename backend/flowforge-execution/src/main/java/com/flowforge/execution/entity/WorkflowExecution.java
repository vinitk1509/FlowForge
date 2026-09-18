package com.flowforge.execution.entity;

import com.flowforge.common.model.ExecutionStatus;
import com.flowforge.execution.converter.MapJsonConverter;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "workflow_executions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowExecution {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    @Column(name = "workflow_id", length = 36, nullable = false)
    private String workflowId;

    @Column(name = "workflow_version_id", length = 36)
    private String workflowVersionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 32, nullable = false)
    private ExecutionStatus status;

    @Column(name = "trigger_source", length = 64, nullable = false)
    private String triggerSource;

    @Convert(converter = MapJsonConverter.class)
    @Column(name = "trigger_payload", columnDefinition = "TEXT")
    @Builder.Default
    private Map<String, Object> triggerPayload = new HashMap<>();

    @Convert(converter = MapJsonConverter.class)
    @Column(name = "context_data", columnDefinition = "TEXT")
    @Builder.Default
    private Map<String, Object> contextData = new HashMap<>();

    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(name = "end_time")
    private Instant endTime;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @OneToMany(mappedBy = "execution", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<NodeExecution> nodeExecutions = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public void addNodeExecution(NodeExecution nodeExecution) {
        nodeExecutions.add(nodeExecution);
        nodeExecution.setExecution(this);
    }
}
