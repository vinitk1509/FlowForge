import type { Node, Edge } from '@xyflow/react';
import type { ValidationResult, WorkflowNodeData } from '../types/workflow';

export function validateDag(nodes: Node<WorkflowNodeData>[], edges: Edge[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (nodes.length === 0) {
    return {
      valid: false,
      errors: ['The canvas is empty. Add at least one trigger node to start your workflow.'],
      warnings: [],
    };
  }

  const nodeMap = new Map<string, Node<WorkflowNodeData>>();
  const triggerIds = new Set<string>();

  for (const node of nodes) {
    nodeMap.set(node.id, node);
    if (node.data.category === 'TRIGGER') {
      triggerIds.add(node.id);
    }
  }

  if (triggerIds.size === 0) {
    errors.push('Workflow must contain at least one Trigger node (e.g. Webhook, Schedule, or Manual Trigger).');
  }

  // Build Adjacency List & inDegree
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of nodes) {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  for (const edge of edges) {
    if (!nodeMap.has(edge.source)) {
      errors.push(`Edge connects from an unknown node: ${edge.source}`);
      continue;
    }
    if (!nodeMap.has(edge.target)) {
      errors.push(`Edge connects to an unknown node: ${edge.target}`);
      continue;
    }

    if (edge.source === edge.target) {
      errors.push(`Self-loop detected on node "${nodeMap.get(edge.source)?.data.name}". Cycles are not allowed.`);
      continue;
    }

    if (triggerIds.has(edge.target)) {
      errors.push(`Trigger "${nodeMap.get(edge.target)?.data.name}" cannot have incoming connections.`);
    }

    adjacencyList.get(edge.source)!.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  // Kahn's Algorithm for cycle detection
  const queue: string[] = [];
  for (const [nodeId, deg] of inDegree.entries()) {
    if (deg === 0) {
      queue.push(nodeId);
    }
  }

  let visitedCount = 0;
  while (queue.length > 0) {
    const current = queue.shift()!;
    visitedCount++;

    for (const neighbor of adjacencyList.get(current) || []) {
      const updated = inDegree.get(neighbor)! - 1;
      inDegree.set(neighbor, updated);
      if (updated === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (visitedCount < nodes.length) {
    errors.push('Cycle detected in workflow! Directed Acyclic Graphs (DAG) cannot contain infinite loops.');
  }

  // Check for orphan non-trigger nodes
  for (const node of nodes) {
    if (!triggerIds.has(node.id)) {
      const hasIncoming = edges.some(e => e.target === node.id);
      if (!hasIncoming) {
        warnings.push(`Node "${node.data.name}" has no incoming connection and will not be triggered.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
