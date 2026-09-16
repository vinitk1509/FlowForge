import React, { useState } from 'react';
import {
  Zap,
  Webhook,
  Clock,
  Globe,
  Mail,
  MessageSquare,
  Database,
  GitBranch,
  Code2,
  Sliders,
  Search,
  Plus,
  GripVertical,
} from 'lucide-react';
import type { NodeType, NodeCategory, WorkflowNodeConfig } from '../types/workflow';

interface PaletteItem {
  type: NodeType;
  reactFlowType: 'triggerNode' | 'actionNode' | 'logicNode' | 'dataNode';
  category: NodeCategory;
  name: string;
  description: string;
  icon: React.ReactNode;
  defaultConfig: WorkflowNodeConfig;
}

const PALETTE_ITEMS: PaletteItem[] = [
  // Triggers
  {
    type: 'TRIGGER_WEBHOOK',
    reactFlowType: 'triggerNode',
    category: 'TRIGGER',
    name: 'Webhook',
    description: 'Trigger flow via public HTTP webhook URL',
    icon: <Webhook size={16} color="#06b6d4" />,
    defaultConfig: { webhookPath: '/webhooks/v1/custom-event' },
  },
  {
    type: 'TRIGGER_SCHEDULE',
    reactFlowType: 'triggerNode',
    category: 'TRIGGER',
    name: 'Schedule',
    description: 'Trigger flow at scheduled cron intervals',
    icon: <Clock size={16} color="#06b6d4" />,
    defaultConfig: { cronExpression: '*/5 * * * *' },
  },
  {
    type: 'TRIGGER_MANUAL',
    reactFlowType: 'triggerNode',
    category: 'TRIGGER',
    name: 'Manual Run',
    description: 'Trigger flow on-demand via UI or API',
    icon: <Zap size={16} color="#06b6d4" />,
    defaultConfig: {},
  },

  // Actions
  {
    type: 'ACTION_HTTP',
    reactFlowType: 'actionNode',
    category: 'ACTION',
    name: 'HTTP Request',
    description: 'Call any external REST API endpoint',
    icon: <Globe size={16} color="#f59e0b" />,
    defaultConfig: { method: 'POST', url: 'https://api.example.com/data', body: '{\n  "status": "active"\n}' },
  },
  {
    type: 'ACTION_SLACK',
    reactFlowType: 'actionNode',
    category: 'ACTION',
    name: 'Slack Notification',
    description: 'Send alerts to Slack workspace channel',
    icon: <MessageSquare size={16} color="#f59e0b" />,
    defaultConfig: { slackChannel: '#alerts', slackMessage: 'FlowForge Alert: Task finished successfully.' },
  },
  {
    type: 'ACTION_EMAIL',
    reactFlowType: 'actionNode',
    category: 'ACTION',
    name: 'Send Email',
    description: 'Dispatch transactional emails via SMTP',
    icon: <Mail size={16} color="#f59e0b" />,
    defaultConfig: { emailTo: 'team@company.com', emailSubject: 'Workflow Notification', emailBody: 'Hello from FlowForge!' },
  },
  {
    type: 'ACTION_POSTGRESQL',
    reactFlowType: 'actionNode',
    category: 'ACTION',
    name: 'PostgreSQL Query',
    description: 'Execute parameterized query against DB',
    icon: <Database size={16} color="#f59e0b" />,
    defaultConfig: { sqlQuery: 'SELECT * FROM users WHERE active = true LIMIT 10;' },
  },

  // Logic
  {
    type: 'LOGIC_IF',
    reactFlowType: 'logicNode',
    category: 'LOGIC',
    name: 'IF Condition',
    description: 'Branch execution based on boolean condition',
    icon: <GitBranch size={16} color="#8b5cf6" />,
    defaultConfig: { conditionExpression: '$json.amount > 1000' },
  },

  // Data
  {
    type: 'DATA_TRANSFORM',
    reactFlowType: 'dataNode',
    category: 'DATA',
    name: 'Transform JSON',
    description: 'Map, reshape, and filter JSON payload',
    icon: <Code2 size={16} color="#10b981" />,
    defaultConfig: { transformCode: 'return {\n  ...$json,\n  processedAt: new Date().toISOString()\n};' },
  },
  {
    type: 'DATA_SET_VARIABLE',
    reactFlowType: 'dataNode',
    category: 'DATA',
    name: 'Set Variable',
    description: 'Assign workflow context variables',
    icon: <Sliders size={16} color="#10b981" />,
    defaultConfig: { variableName: 'retryCount', variableValue: '3' },
  },
];

interface NodePaletteProps {
  onAddNode: (item: PaletteItem) => void;
}

export const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredItems = PALETTE_ITEMS.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const onDragStart = (event: React.DragEvent, item: PaletteItem) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside
      style={{
        width: 280,
        height: 'calc(100vh - 62px)',
        background: 'rgba(10, 14, 22, 0.95)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(16px)',
        zIndex: 10,
      }}
    >
      {/* Search Header */}
      <div style={{ padding: '16px 16px 12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 8,
            padding: '8px 12px',
          }}
        >
          <Search size={14} color="#64748b" />
          <input
            type="text"
            placeholder="Search nodes & connectors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
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

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12, overflowX: 'auto', paddingBottom: 2 }}>
          {['ALL', 'TRIGGER', 'ACTION', 'LOGIC', 'DATA'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                border: selectedCategory === cat ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                borderRadius: 6,
                color: selectedCategory === cat ? '#ffffff' : '#94a3b8',
                padding: '4px 8px',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.04em',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Node Catalog List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 4px 4px 4px' }}>
          Drag or click to add
        </div>

        {filteredItems.map(item => (
          <div
            key={item.type}
            draggable
            onDragStart={e => onDragStart(e, item)}
            onClick={() => onAddNode(item)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(19, 27, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 10,
              padding: '10px 12px',
              cursor: 'grab',
              transition: 'all 0.15s ease',
              userSelect: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(25, 35, 54, 0.9)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(19, 27, 42, 0.6)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <GripVertical size={14} color="#475569" style={{ cursor: 'grab' }} />
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>{item.name}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.3 }}>{item.description}</div>
              </div>
            </div>

            <button
              onClick={e => {
                e.stopPropagation();
                onAddNode(item);
              }}
              title="Add to canvas"
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} />
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
};
