package com.flowforge.execution.repository;

import com.flowforge.common.model.NodeStatus;
import com.flowforge.execution.entity.NodeExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NodeExecutionRepository extends JpaRepository<NodeExecution, String> {

    List<NodeExecution> findByExecutionIdOrderByStartTimeAsc(String executionId);

    Optional<NodeExecution> findByExecutionIdAndNodeId(String executionId, String nodeId);

    List<NodeExecution> findByExecutionIdAndStatus(String executionId, NodeStatus status);

    long countByExecutionIdAndStatus(String executionId, NodeStatus status);
}
