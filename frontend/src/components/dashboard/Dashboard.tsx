import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Search,
  Lock,
  ArrowRight,
  LogOut,
  Sparkles,
} from 'lucide-react';
import type { WorkflowItem, HistoricalRun, ConnectorCredential, UserProfile } from '../../types/auth';
import type { WorkflowTemplate } from '../../utils/demoWorkflows';
import { DEMO_TEMPLATES } from '../../utils/demoWorkflows';
import { sounds } from '../../utils/soundEffects';

interface DashboardProps {
  user: UserProfile;
  onLogout: () => void;
  onOpenWorkflowInStudio: (workflowId: string) => void;
  onInstantiateTemplate: (template: WorkflowTemplate) => void;
  onCreateBlankWorkflow: () => void;
}

const INITIAL_WORKFLOWS: WorkflowItem[] = [
  {
    id: 'wf-stripe-vip',
    name: 'Payment Webhook VIP Routing',
    description: 'Triage high-value payments via webhook, verify fraud score, and post alerts to Slack VIP channel.',
    triggerType: 'TRIGGER_WEBHOOK',
    isActive: true,
    activeVersion: 'v1.2 (Immutable)',
    lastExecutedAt: '3 minutes ago',
    successRate: 99.4,
    totalRuns: 894,
    nodeCount: 6,
  },
  {
    id: 'wf-postgres-cron',
    name: 'Scheduled Postgres ETL & Alerts',
    description: 'Runs every 15 minutes, queries execution_db for failed jobs, and posts incident summaries.',
    triggerType: 'TRIGGER_SCHEDULE',
    isActive: true,
    activeVersion: 'v1.0 (Immutable)',
    lastExecutedAt: '12 minutes ago',
    successRate: 100,
    totalRuns: 312,
    nodeCount: 3,
  },
  {
    id: 'wf-onboarding-email',
    name: 'User Onboarding Pipeline',
    description: 'Sends multi-stage welcome email sequence upon account registration with delay wakeups.',
    triggerType: 'TRIGGER_WEBHOOK',
    isActive: false,
    activeVersion: 'v0.3 (Draft)',
    lastExecutedAt: '2 days ago',
    successRate: 96.2,
    totalRuns: 142,
    nodeCount: 5,
  },
  {
    id: 'wf-daily-digest',
    name: 'Daily Revenue Aggregator',
    description: 'Aggregates daily transaction volume across stripe and writes metrics into warehouse.',
    triggerType: 'TRIGGER_SCHEDULE',
    isActive: true,
    activeVersion: 'v2.1 (Immutable)',
    lastExecutedAt: '14 hours ago',
    successRate: 98.8,
    totalRuns: 72,
    nodeCount: 4,
  },
];

const INITIAL_RUNS: HistoricalRun[] = [
  {
    id: 'run-90412',
    workflowId: 'wf-stripe-vip',
    workflowName: 'Payment Webhook VIP Routing',
    triggerType: 'Webhook (Stripe)',
    status: 'SUCCEEDED',
    durationMs: 124,
    finishedAt: '3 minutes ago',
    stepsCount: 5,
    logs: [
      { step: 'Payment Webhook', status: 'SUCCEEDED', durationMs: 18, details: 'Payload received from Stripe, orderId: ORD-90412' },
      { step: 'Transform Payload', status: 'SUCCEEDED', durationMs: 12, details: 'Normalized fields, amount: $15,400' },
      { step: 'Verify Account Risk', status: 'SUCCEEDED', durationMs: 42, details: 'POST /v1/score returned 200 OK (risk: 0.02)' },
      { step: 'IF Condition', status: 'SUCCEEDED', durationMs: 8, details: 'Evaluated: $json.amount > 10000 -> TRUE' },
      { step: 'Slack Notification', status: 'SUCCEEDED', durationMs: 44, details: 'Posted message to #vip-sales-alerts' },
    ],
  },
  {
    id: 'run-90411',
    workflowId: 'wf-postgres-cron',
    workflowName: 'Scheduled Postgres ETL & Alerts',
    triggerType: 'Cron Schedule (*/15)',
    status: 'SUCCEEDED',
    durationMs: 98,
    finishedAt: '12 minutes ago',
    stepsCount: 3,
    logs: [
      { step: 'Schedule Trigger', status: 'SUCCEEDED', durationMs: 5, details: 'Cron fired on worker-pod-3' },
      { step: 'Find Failed Jobs', status: 'SUCCEEDED', durationMs: 58, details: 'SELECT query returned 0 failed rows' },
      { step: 'Slack Notification', status: 'SUCCEEDED', durationMs: 35, details: 'Skipped alert: 0 rows found' },
    ],
  },
  {
    id: 'run-90410',
    workflowId: 'wf-stripe-vip',
    workflowName: 'Payment Webhook VIP Routing',
    triggerType: 'Webhook (Stripe)',
    status: 'SUCCEEDED',
    durationMs: 110,
    finishedAt: '25 minutes ago',
    stepsCount: 5,
    logs: [
      { step: 'Payment Webhook', status: 'SUCCEEDED', durationMs: 15, details: 'Payload received, orderId: ORD-90409' },
      { step: 'Transform Payload', status: 'SUCCEEDED', durationMs: 10, details: 'Normalized fields, amount: $1,250' },
      { step: 'Verify Account Risk', status: 'SUCCEEDED', durationMs: 38, details: 'POST /v1/score returned 200 OK' },
      { step: 'IF Condition', status: 'SUCCEEDED', durationMs: 7, details: 'Evaluated: $json.amount > 10000 -> FALSE' },
      { step: 'Send Email', status: 'SUCCEEDED', durationMs: 40, details: 'Dispatched receipt to customer' },
    ],
  },
  {
    id: 'run-90409',
    workflowId: 'wf-onboarding-email',
    workflowName: 'User Onboarding Pipeline',
    triggerType: 'Webhook (Auth)',
    status: 'FAILED',
    durationMs: 480,
    finishedAt: '1 hour ago',
    stepsCount: 3,
    logs: [
      { step: 'User Created Webhook', status: 'SUCCEEDED', durationMs: 12, details: 'Event user.signup received' },
      { step: 'Send Welcome Email', status: 'FAILED', durationMs: 468, details: 'SMTP 503 Connection timed out after 3 retries (Moved to DLQ)' },
    ],
  },
];

const CONNECTORS: ConnectorCredential[] = [
  { id: 'c-1', name: 'Production PostgreSQL', type: 'POSTGRESQL', status: 'CONNECTED', lastUsed: '3 mins ago', maskedKey: 'postgresql://flowforge:••••••••@pg-prod:5432/execution_db' },
  { id: 'c-2', name: 'Alerts Slack Bot', type: 'SLACK', status: 'CONNECTED', lastUsed: '3 mins ago', maskedKey: 'xoxb-89412-••••••••••••••••••••' },
  { id: 'c-3', name: 'Stripe Payments Live', type: 'STRIPE', status: 'CONNECTED', lastUsed: '25 mins ago', maskedKey: 'sk_live_••••••••••••••••••••' },
  { id: 'c-4', name: 'Resend Transactional SMTP', type: 'SMTP', status: 'CONNECTED', lastUsed: '1 hour ago', maskedKey: 'smtp://smtp.resend.com:587' },
];

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onLogout,
  onOpenWorkflowInStudio,
  onInstantiateTemplate,
  onCreateBlankWorkflow,
}) => {
  const [activeTab, setActiveTab] = useState<'WORKFLOWS' | 'TEMPLATES' | 'HISTORY' | 'VAULT'>('WORKFLOWS');
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(INITIAL_WORKFLOWS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRun, setSelectedRun] = useState<HistoricalRun | null>(null);

  const toggleWorkflowActive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    setWorkflows(wfs =>
      wfs.map(w => (w.id === id ? { ...w, isActive: !w.isActive } : w))
    );
  };

  const filteredWorkflows = workflows.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#07090e', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <nav
        style={{
          height: 64,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(13, 18, 28, 0.95)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
              }}
            >
              <Zap size={18} color="#ffffff" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>
              FLOW<span style={{ color: '#06b6d4' }}>FORGE</span>
            </span>
          </div>

          <div style={{ width: 1, height: 24, background: 'rgba(255, 255, 255, 0.1)' }} />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 8,
              padding: '5px 12px',
              fontSize: 12,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span style={{ fontWeight: 600, color: '#f1f5f9' }}>Production Workspace</span>
          </div>
        </div>

        {/* Right Actions & User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => {
              sounds.playClick();
              onCreateBlankWorkflow();
            }}
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: 8,
              color: '#ffffff',
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.35)',
            }}
          >
            <Plus size={15} />
            <span>New Workflow</span>
          </button>

          <div style={{ width: 1, height: 24, background: 'rgba(255, 255, 255, 0.1)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {user.firstName ? user.firstName[0] : 'E'}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>
                {user.firstName} {user.lastName}
              </div>
              <div style={{ fontSize: 10, color: '#64748b' }}>{user.email}</div>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 8,
                color: '#94a3b8',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                marginLeft: 4,
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div style={{ flex: 1, padding: '32px 40px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {/* Top Metrics Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Workflows', value: workflows.length, badge: '+1 this week', color: '#06b6d4' },
            { label: 'Active Executions (24h)', value: '1,420', badge: 'Kafka KRaft', color: '#10b981' },
            { label: 'Execution Success Rate', value: '99.8%', badge: 'Idempotent', color: '#38bdf8' },
            { label: 'Average Step Latency', value: '38ms', badge: 'Redis Cached', color: '#f59e0b' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(19, 27, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 14,
                padding: '18px 20px',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {stat.label}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: stat.color, background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: 4 }}>
                  {stat.badge}
                </span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#f8fafc', marginTop: 8 }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: 24,
            paddingBottom: 4,
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'WORKFLOWS', label: 'Workflows Hub' },
              { id: 'TEMPLATES', label: 'Templates Gallery' },
              { id: 'HISTORY', label: 'Execution History' },
              { id: 'VAULT', label: 'Credentials Vault' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                style={{
                  background: activeTab === tab.id ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                  border: activeTab === tab.id ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                  borderRadius: 8,
                  color: activeTab === tab.id ? '#38bdf8' : '#94a3b8',
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'WORKFLOWS' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 8,
                padding: '6px 12px',
                width: 240,
              }}
            >
              <Search size={14} color="#64748b" />
              <input
                type="text"
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 12,
                  outline: 'none',
                  width: '100%',
                }}
              />
            </div>
          )}
        </div>

        {/* TAB 1: WORKFLOWS */}
        {activeTab === 'WORKFLOWS' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {/* Create Blank Card */}
            <div
              onClick={() => {
                sounds.playClick();
                onCreateBlankWorkflow();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: 16,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 180,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#06b6d4';
                e.currentTarget.style.background = 'rgba(6, 182, 212, 0.04)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(6, 182, 212, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <Plus size={22} color="#06b6d4" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>Create Blank Workflow</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Design a custom DAG from scratch</div>
            </div>

            {/* Workflow Cards */}
            {filteredWorkflows.map(wf => (
              <div
                key={wf.id}
                onClick={() => {
                  sounds.playClick();
                  onOpenWorkflowInStudio(wf.id);
                }}
                style={{
                  background: 'rgba(19, 27, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 16,
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'rgba(6, 182, 212, 0.12)',
                        color: '#38bdf8',
                        border: '1px solid rgba(6, 182, 212, 0.25)',
                      }}
                    >
                      {wf.triggerType.replace('TRIGGER_', '')}
                    </span>

                    {/* Active toggle */}
                    <div
                      onClick={e => toggleWorkflowActive(wf.id, e)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: wf.isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${wf.isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                        borderRadius: 999,
                        padding: '3px 8px',
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: wf.isActive ? '#10b981' : '#64748b',
                          boxShadow: wf.isActive ? '0 0 6px #10b981' : 'none',
                        }}
                      />
                      <span style={{ fontSize: 10, fontWeight: 700, color: wf.isActive ? '#10b981' : '#94a3b8' }}>
                        {wf.isActive ? 'ACTIVE' : 'DRAFT'}
                      </span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>{wf.name}</h3>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4, margin: '0 0 14px 0' }}>{wf.description}</p>
                </div>

                {/* Footer stats */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span>{wf.nodeCount} nodes</span>
                    <span>{wf.totalRuns} runs</span>
                    <span style={{ color: '#10b981' }}>{wf.successRate}%</span>
                  </div>
                  <span style={{ color: '#06b6d4', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Open Studio &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: TEMPLATES */}
        {activeTab === 'TEMPLATES' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
            {DEMO_TEMPLATES.map(template => (
              <div
                key={template.id}
                style={{
                  background: 'rgba(19, 27, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 16,
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'rgba(6, 182, 212, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Sparkles size={16} color="#06b6d4" />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', margin: 0 }}>{template.name}</h3>
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 18 }}>
                    {template.description}
                  </p>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                    <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 4, color: '#cbd5e1' }}>
                      {template.nodes.length} Nodes
                    </span>
                    <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 4, color: '#cbd5e1' }}>
                      {template.edges.length} Connections
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sounds.playSuccess();
                    onInstantiateTemplate(template);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
                    border: 'none',
                    borderRadius: 10,
                    color: '#ffffff',
                    padding: '10px 16px',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    boxShadow: '0 0 16px rgba(6, 182, 212, 0.3)',
                  }}
                >
                  <span>Instantiate in Studio</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: EXECUTION HISTORY */}
        {activeTab === 'HISTORY' && (
          <div
            style={{
              background: 'rgba(19, 27, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'rgba(7, 9, 14, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', color: '#94a3b8', fontWeight: 700 }}>Execution ID</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', color: '#94a3b8', fontWeight: 700 }}>Workflow</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', color: '#94a3b8', fontWeight: 700 }}>Trigger</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', color: '#94a3b8', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', color: '#94a3b8', fontWeight: 700 }}>Duration</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', color: '#94a3b8', fontWeight: 700 }}>Time</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', color: '#94a3b8', fontWeight: 700 }}>Telemetry</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_RUNS.map(run => (
                  <tr
                    key={run.id}
                    onClick={() => setSelectedRun(run)}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{run.id}</td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#ffffff' }}>{run.workflowName}</td>
                    <td style={{ padding: '14px 20px', color: '#cbd5e1' }}>{run.triggerType}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: run.status === 'SUCCEEDED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                          color: run.status === 'SUCCEEDED' ? '#10b981' : '#f43f5e',
                          border: `1px solid ${run.status === 'SUCCEEDED' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                        }}
                      >
                        {run.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>{run.durationMs}ms</td>
                    <td style={{ padding: '14px 20px', color: '#64748b' }}>{run.finishedAt}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'right', color: '#06b6d4', fontWeight: 600 }}>
                      Inspect &rarr;
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: CREDENTIALS VAULT */}
        {activeTab === 'VAULT' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
            {CONNECTORS.map(conn => (
              <div
                key={conn.id}
                style={{
                  background: 'rgba(19, 27, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 16,
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Lock size={16} color="#10b981" />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>{conn.name}</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>Type: {conn.type}</div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#10b981',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}
                  >
                    {conn.status}
                  </span>
                </div>

                <div
                  style={{
                    background: 'rgba(7, 9, 14, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: '#94a3b8',
                    marginBottom: 10,
                  }}
                >
                  {conn.maskedKey}
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Encrypted with AES-256 GCM in credential_db</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Execution Telemetry Modal / Drawer */}
      {selectedRun && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
          }}
          onClick={() => setSelectedRun(null)}
        >
          <div
            style={{
              width: 580,
              background: 'linear-gradient(180deg, #131b2a 0%, #0d121c 100%)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: 16,
              padding: '24px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.85)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  Telemetry: {selectedRun.id}
                </h3>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  {selectedRun.workflowName} • {selectedRun.durationMs}ms
                </div>
              </div>
              <button
                onClick={() => setSelectedRun(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  color: '#94a3b8',
                  padding: '5px 10px',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
              {selectedRun.logs?.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 8,
                    padding: '10px 14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>
                      {idx + 1}. {step.step}
                    </span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#06b6d4' }}>
                      {step.durationMs}ms
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{step.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
