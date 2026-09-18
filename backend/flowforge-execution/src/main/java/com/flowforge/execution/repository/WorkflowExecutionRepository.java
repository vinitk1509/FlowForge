package com.flowforge.execution.repository;

import com.flowforge.common.model.ExecutionStatus;
import com.flowforge.execution.entity.WorkflowExecution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowExecutionRepository extends JpaRepository<WorkflowExecution, String> {

    List<WorkflowExecution> findByWorkflowIdOrderByStartTimeDesc(String workflowId);

    Page<WorkflowExecution> findByWorkflowIdOrderByStartTimeDesc(String workflowId, Pageable pageable);

    List<WorkflowExecution> findByStatus(ExecutionStatus status);

    Optional<WorkflowExecution> findById(String id);
}
