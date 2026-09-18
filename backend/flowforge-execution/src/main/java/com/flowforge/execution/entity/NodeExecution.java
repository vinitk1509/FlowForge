package com.flowforge.execution.entity;

import com.flowforge.common.model.NodeStatus;
import com.flowforge.execution.converter.MapJsonConverter;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "node_executions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NodeExecution {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "execution_id", nullable = false)
    private WorkflowExecution execution;

    @Column(name = "node_id", length = 64, nullable = false)
    private String nodeId;

    @Column(name = "node_name", length = 128, nullable = false)
    private String nodeName;

    @Column(name = "node_type", length = 64, nullable = false)
    private String nodeType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 32, nullable = false)
    private NodeStatus status;

    @Convert(converter = MapJsonConverter.class)
    @Column(name = "input_payload", columnDefinition = "TEXT")
    @Builder.Default
    private Map<String, Object> inputPayload = new HashMap<>();

    @Convert(converter = MapJsonConverter.class)
    @Column(name = "output_payload", columnDefinition = "TEXT")
    @Builder.Default
    private Map<String, Object> outputPayload = new HashMap<>();

    @Column(name = "branch_selected", length = 32)
    private String branchSelected;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "error_details", columnDefinition = "TEXT")
    private String errorDetails;

    @Column(name = "attempt")
    @Builder.Default
    private int attempt = 1;

    @Column(name = "start_time")
    private Instant startTime;

    @Column(name = "end_time")
    private Instant endTime;

    @Column(name = "duration_ms")
    private Long durationMs;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
