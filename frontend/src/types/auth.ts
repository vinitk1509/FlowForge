export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
}

export interface AuthSession {
  token: string;
  user: UserProfile;
}

export interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  triggerType: 'TRIGGER_WEBHOOK' | 'TRIGGER_SCHEDULE' | 'TRIGGER_MANUAL';
  isActive: boolean;
  activeVersion: string;
  lastExecutedAt?: string;
  successRate: number;
  totalRuns: number;
  nodeCount: number;
}

export interface HistoricalRun {
  id: string;
  workflowId: string;
  workflowName: string;
  triggerType: string;
  status: 'SUCCEEDED' | 'FAILED' | 'RUNNING';
  durationMs: number;
  finishedAt: string;
  stepsCount: number;
  logs?: Array<{
    step: string;
    status: string;
    durationMs: number;
    details: string;
  }>;
}

export interface ConnectorCredential {
  id: string;
  name: string;
  type: 'POSTGRESQL' | 'SLACK' | 'STRIPE' | 'SMTP' | 'GITHUB';
  status: 'CONNECTED' | 'EXPIRED' | 'UNCONFIGURED';
  lastUsed: string;
  maskedKey: string;
}
