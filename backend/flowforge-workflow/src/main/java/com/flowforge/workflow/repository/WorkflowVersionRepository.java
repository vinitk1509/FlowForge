package com.flowforge.workflow.repository;

import com.flowforge.workflow.entity.WorkflowVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkflowVersionRepository extends JpaRepository<WorkflowVersion, UUID> {
    List<WorkflowVersion> findAllByWorkflowIdOrderByVersionNumberDesc(UUID workflowId);
    Optional<WorkflowVersion> findFirstByWorkflowIdOrderByVersionNumberDesc(UUID workflowId);
    Optional<WorkflowVersion> findByWorkflowIdAndVersionNumber(UUID workflowId, int versionNumber);
}
