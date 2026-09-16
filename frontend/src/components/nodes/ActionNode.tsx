import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { WorkflowNodeData } from '../../types/workflow';
import { Globe, Mail, MessageSquare, Database, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const ActionNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as WorkflowNodeData;
  const getIcon = () => {
    switch (nodeData.type) {
      case 'ACTION_HTTP':
        return <Globe size={16} style={{ color: '#f59e0b' }} />;
      case 'ACTION_EMAIL':
        return <Mail size={16} style={{ color: '#f59e0b' }} />;
      case 'ACTION_SLACK':
        return <MessageSquare size={16} style={{ color: '#f59e0b' }} />;
      case 'ACTION_POSTGRESQL':
        return <Database size={16} style={{ color: '#f59e0b' }} />;
      default:
        return <Globe size={16} style={{ color: '#f59e0b' }} />;
    }
  };

  const getStatusBadge = () => {
    switch (nodeData.status) {
      case 'RUNNING':
        return (
          <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <Loader2 size={12} className="spin-animation" /> Running
          </span>
        );
      case 'SUCCEEDED':
        return (
          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <CheckCircle2 size={12} /> {nodeData.lastRunDurationMs ? `${nodeData.lastRunDurationMs}ms` : 'Done'}
          </span>
        );
      case 'FAILED':
        return (
          <span style={{ color: '#f43f5e', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <AlertCircle size={12} /> Error
          </span>
        );
      default:
        return (
          <span style={{ color: '#f59e0b', fontSize: 10, padding: '2px 6px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Action
          </span>
        );
    }
  };

  const getSubtitle = () => {
    if (nodeData.type === 'ACTION_HTTP' && nodeData.config?.url) {
      return `${nodeData.config.method || 'GET'} ${nodeData.config.url}`;
    }
    if (nodeData.type === 'ACTION_SLACK' && nodeData.config?.slackChannel) {
      return `Channel: ${nodeData.config.slackChannel}`;
    }
    if (nodeData.type === 'ACTION_EMAIL' && nodeData.config?.emailTo) {
      return `To: ${nodeData.config.emailTo}`;
    }
    if (nodeData.type === 'ACTION_POSTGRESQL') {
      return 'PostgreSQL Connector';
    }
    return nodeData.description || 'Executes external system action';
  };

  return (
    <div
      style={{
        width: 270,
        background: 'linear-gradient(180deg, rgba(22, 27, 36, 0.95) 0%, rgba(15, 18, 26, 0.98) 100%)',
        border: selected ? '2px solid #f59e0b' : '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: 12,
        padding: '12px 14px',
        boxShadow: selected
          ? '0 0 20px rgba(245, 158, 11, 0.4), 0 8px 24px rgba(0,0,0,0.6)'
          : '0 4px 16px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(16px)',
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
      className={nodeData.status === 'RUNNING' ? 'node-running' : ''}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="handle-action"
        style={{ left: -6 }}
      />

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            {getIcon()}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>
            {nodeData.name || nodeData.label}
          </span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Detail snippet */}
      <div
        style={{
          fontSize: 11,
          color: '#cbd5e1',
          background: 'rgba(0,0,0,0.3)',
          padding: '6px 8px',
          borderRadius: 6,
          fontFamily: nodeData.type === 'ACTION_HTTP' || nodeData.type === 'ACTION_POSTGRESQL' ? 'var(--font-mono)' : 'inherit',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {getSubtitle()}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="handle-action"
        style={{ right: -6 }}
      />
    </div>
  );
});
ActionNode.displayName = 'ActionNode';
