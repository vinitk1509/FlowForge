export type NodeCategory = 'TRIGGER' | 'ACTION' | 'LOGIC' | 'DATA';

export type NodeType =
  | 'TRIGGER_MANUAL'
  | 'TRIGGER_WEBHOOK'
  | 'TRIGGER_SCHEDULE'
  | 'ACTION_HTTP'
  | 'ACTION_EMAIL'
  | 'ACTION_SLACK'
  | 'ACTION_POSTGRESQL'
  | 'LOGIC_IF'
  | 'DATA_TRANSFORM'
  | 'DATA_SET_VARIABLE';

export type NodeStatus =
  | 'PENDING'
  | 'READY'
  | 'QUEUED'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'WAITING'
  | 'SKIPPED';

export interface WorkflowNodeConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url?: string;
  headers?: Record<string, string>;
  body?: string;
  conditionExpression?: string;
  transformCode?: string;
  slackChannel?: string;
  slackMessage?: string;
  emailTo?: string;
  emailSubject?: string;
  emailBody?: string;
  sqlQuery?: string;
  cronExpression?: string;
  webhookPath?: string;
  variableName?: string;
  variableValue?: string;
  [key: string]: unknown;
}

export interface WorkflowNodeData {
  label: string;
  name: string;
  type: NodeType;
  category: NodeCategory;
  description?: string;
  config: WorkflowNodeConfig;
  status: NodeStatus;
  credentialsRef?: string;
  lastRunDurationMs?: number;
  lastOutput?: Record<string, unknown>;
  errorMessage?: string;
  activeBranch?: 'true' | 'false' | 'default';
  [key: string]: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ExecutionLogEntry {
  nodeId: string;
  nodeName: string;
  nodeType: NodeType;
  status: NodeStatus;
  durationMs: number;
  timestamp: string;
  inputPayload?: Record<string, unknown>;
  outputPayload?: Record<string, unknown>;
  errorMessage?: string;
}

export interface ExecutionSummary {
  executionId: string;
  status: 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  startTime: number;
  endTime?: number;
  totalDurationMs?: number;
  logs: ExecutionLogEntry[];
}
