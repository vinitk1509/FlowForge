import type { Node, Edge } from '@xyflow/react';
import type { WorkflowNodeData } from '../types/workflow';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
}

export const DEMO_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'base-demo-workflow',
    name: 'Payment Webhook VIP Routing',
    description: 'High-value transaction triage from Base Architecture Document: Webhook -> Transform -> HTTP Verification -> IF Amount > 10,000 -> Slack VIP / Email',
    nodes: [
      {
        id: 'node-webhook-1',
        type: 'triggerNode',
        position: { x: 50, y: 220 },
        data: {
          label: 'Payment Webhook',
          name: 'Stripe Webhook',
          type: 'TRIGGER_WEBHOOK',
          category: 'TRIGGER',
          description: 'Listens for payment_intent.succeeded events',
          status: 'READY',
          config: {
            webhookPath: '/webhooks/v1/stripe-payments',
          },
          lastOutput: {
            event: 'payment_intent.succeeded',
            amount: 15400,
            currency: 'USD',
            customer: {
              id: 'cus_894218',
              email: 'enterprise@apexcorp.com',
              tier: 'ENTERPRISE',
            },
            orderId: 'ORD-2026-90412',
          },
        },
      },
      {
        id: 'node-transform-2',
        type: 'dataNode',
        position: { x: 380, y: 220 },
        data: {
          label: 'Transform Payload',
          name: 'Normalize Order',
          type: 'DATA_TRANSFORM',
          category: 'DATA',
          description: 'Reshapes raw payload and calculates VIP tier',
          status: 'PENDING',
          config: {
            transformCode: 'return {\n  orderId: $json.orderId,\n  amount: $json.amount,\n  email: $json.customer.email,\n  isHighValue: $json.amount >= 10000\n};',
          },
          lastOutput: {
            orderId: 'ORD-2026-90412',
            amount: 15400,
            email: 'enterprise@apexcorp.com',
            isHighValue: true,
          },
        },
      },
      {
        id: 'node-http-3',
        type: 'actionNode',
        position: { x: 720, y: 220 },
        data: {
          label: 'HTTP Request',
          name: 'Verify Account Risk',
          type: 'ACTION_HTTP',
          category: 'ACTION',
          description: 'Checks fraud risk score with internal service',
          status: 'PENDING',
          config: {
            method: 'POST',
            url: 'https://api.internal-fraud.net/v1/score',
            headers: {
              'Content-Type': 'application/json',
              'X-Risk-Model': 'v4-prod',
            },
            body: '{\n  "email": "{{ $json.email }}",\n  "amount": {{ $json.amount }}\n}',
          },
          lastOutput: {
            riskScore: 0.04,
            status: 'VERIFIED',
            latencyMs: 38,
          },
        },
      },
      {
        id: 'node-if-4',
        type: 'logicNode',
        position: { x: 1060, y: 210 },
        data: {
          label: 'IF Condition',
          name: 'Amount > $10,000?',
          type: 'LOGIC_IF',
          category: 'LOGIC',
          description: 'Routes to VIP channel if amount exceeds threshold',
          status: 'PENDING',
          config: {
            conditionExpression: '$json.amount > 10000',
          },
        },
      },
      {
        id: 'node-slack-5',
        type: 'actionNode',
        position: { x: 1420, y: 100 },
        data: {
          label: 'Slack Notification',
          name: 'Post to #vip-orders',
          type: 'ACTION_SLACK',
          category: 'ACTION',
          description: 'Alerts VIP account executive on Slack',
          status: 'PENDING',
          config: {
            slackChannel: '#vip-sales-alerts',
            slackMessage: '🚨 New VIP Transaction! Order {{ $json.orderId }} for ${{ $json.amount }} from {{ $json.email }} has been verified.',
          },
        },
      },
      {
        id: 'node-email-6',
        type: 'actionNode',
        position: { x: 1420, y: 340 },
        data: {
          label: 'Send Email',
          name: 'Customer Receipt',
          type: 'ACTION_EMAIL',
          category: 'ACTION',
          description: 'Sends standard receipt to buyer',
          status: 'PENDING',
          config: {
            emailTo: '{{ $json.email }}',
            emailSubject: 'Your order confirmation #{{ $json.orderId }}',
            emailBody: 'Thank you for your order of ${{ $json.amount }}. Your payment was processed successfully.',
          },
        },
      },
    ],
    edges: [
      {
        id: 'e-1-2',
        source: 'node-webhook-1',
        target: 'node-transform-2',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#06b6d4', strokeWidth: 2 },
      },
      {
        id: 'e-2-3',
        source: 'node-transform-2',
        target: 'node-http-3',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 },
      },
      {
        id: 'e-3-4',
        source: 'node-http-3',
        target: 'node-if-4',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#f59e0b', strokeWidth: 2 },
      },
      {
        id: 'e-4-5-true',
        source: 'node-if-4',
        sourceHandle: 'true',
        target: 'node-slack-5',
        type: 'smoothstep',
        animated: true,
        label: 'TRUE (Amount > 10,000)',
        labelStyle: { fill: '#10b981', fontWeight: 600, fontSize: 11 },
        labelBgStyle: { fill: '#0a1612', fillOpacity: 0.9, stroke: '#10b981', rx: 6 },
        style: { stroke: '#10b981', strokeWidth: 2.5 },
      },
      {
        id: 'e-4-6-false',
        source: 'node-if-4',
        sourceHandle: 'false',
        target: 'node-email-6',
        type: 'smoothstep',
        animated: true,
        label: 'FALSE (Standard)',
        labelStyle: { fill: '#f43f5e', fontWeight: 600, fontSize: 11 },
        labelBgStyle: { fill: '#1f0d14', fillOpacity: 0.9, stroke: '#f43f5e', rx: 6 },
        style: { stroke: '#f43f5e', strokeWidth: 2 },
      },
    ],
  },
  {
    id: 'db-sync-workflow',
    name: 'Scheduled Postgres ETL & Slack Alert',
    description: 'Runs on a 15-minute cron schedule, queries PostgreSQL database, and posts summaries',
    nodes: [
      {
        id: 'node-cron-1',
        type: 'triggerNode',
        position: { x: 100, y: 180 },
        data: {
          label: 'Schedule Trigger',
          name: 'Every 15 Minutes',
          type: 'TRIGGER_SCHEDULE',
          category: 'TRIGGER',
          description: 'Cron scheduler with Redis distributed lock',
          status: 'READY',
          config: {
            cronExpression: '*/15 * * * *',
          },
        },
      },
      {
        id: 'node-pg-2',
        type: 'actionNode',
        position: { x: 440, y: 180 },
        data: {
          label: 'PostgreSQL Query',
          name: 'Find Failed Jobs',
          type: 'ACTION_POSTGRESQL',
          category: 'ACTION',
          description: 'Executes parameterized query against execution_db',
          status: 'PENDING',
          config: {
            sqlQuery: 'SELECT id, workflow_id, error_message FROM execution_logs WHERE status = \'FAILED\' AND created_at > NOW() - INTERVAL \'15 minutes\';',
          },
        },
      },
      {
        id: 'node-slack-3',
        type: 'actionNode',
        position: { x: 780, y: 180 },
        data: {
          label: 'Slack Notification',
          name: 'Post Failed Job Digest',
          type: 'ACTION_SLACK',
          category: 'ACTION',
          description: 'Notifies #oncall-alerts channel with query output',
          status: 'PENDING',
          config: {
            slackChannel: '#oncall-alerts',
            slackMessage: '⚠️ FlowForge Health Alert: Found {{ $json.length }} failed node executions in the last 15 minutes.',
          },
        },
      },
    ],
    edges: [
      {
        id: 'e-cron-pg',
        source: 'node-cron-1',
        target: 'node-pg-2',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#06b6d4', strokeWidth: 2 },
      },
      {
        id: 'e-pg-slack',
        source: 'node-pg-2',
        target: 'node-slack-3',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#f59e0b', strokeWidth: 2 },
      },
    ],
  },
];
