package com.flowforge.workflow.entity;

import com.flowforge.common.model.WorkflowGraph;
import com.flowforge.workflow.converter.WorkflowGraphConverter;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "workflow_versions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "workflow_id", nullable = false)
    private UUID workflowId;

    @Column(name = "version_number", nullable = false)
    private int versionNumber;

    @Convert(converter = WorkflowGraphConverter.class)
    @Column(name = "graph_definition", nullable = false, columnDefinition = "TEXT")
    private WorkflowGraph graphDefinition;

    @Column(name = "is_immutable", nullable = false)
    @Builder.Default
    private boolean isImmutable = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
