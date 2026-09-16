import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { WorkflowNodeData } from '../../types/workflow';
import { Zap, Webhook, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const TriggerNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as WorkflowNodeData;
  const getIcon = () => {
    switch (nodeData.type) {
      case 'TRIGGER_WEBHOOK':
        return <Webhook size={16} className="text-cyan-400" />;
      case 'TRIGGER_SCHEDULE':
        return <Clock size={16} className="text-cyan-400" />;
      default:
        return <Zap size={16} className="text-cyan-400" />;
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
            <CheckCircle2 size={12} /> {nodeData.lastRunDurationMs ? `${nodeData.lastRunDurationMs}ms` : 'Success'}
          </span>
        );
      case 'FAILED':
        return (
          <span style={{ color: '#f43f5e', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <AlertCircle size={12} /> Failed
          </span>
        );
      default:
        return (
          <span style={{ color: '#38bdf8', fontSize: 10, padding: '2px 6px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Trigger
          </span>
        );
    }
  };

  return (
    <div
      style={{
        width: 260,
        background: 'linear-gradient(180deg, rgba(19, 27, 42, 0.95) 0%, rgba(13, 18, 28, 0.98) 100%)',
        border: selected ? '2px solid #06b6d4' : '1px solid rgba(6, 182, 212, 0.3)',
        borderRadius: 12,
        padding: '12px 14px',
        boxShadow: selected
          ? '0 0 20px rgba(6, 182, 212, 0.4), 0 8px 24px rgba(0,0,0,0.6)'
          : '0 4px 16px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(16px)',
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
      className={nodeData.status === 'RUNNING' ? 'node-running' : ''}
    >
      {/* Top Bar with Icon & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(6, 182, 212, 0.3)',
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

      {/* Description / Subtext */}
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10, lineHeight: 1.4 }}>
        {nodeData.description || 'Starts workflow when event occurs'}
      </div>

      {/* Specific Trigger Meta Pill */}
      {nodeData.config?.webhookPath && (
        <div
          style={{
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: '#38bdf8',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          POST {nodeData.config.webhookPath}
        </div>
      )}

      {nodeData.config?.cronExpression && (
        <div
          style={{
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: '#38bdf8',
          }}
        >
          CRON: {nodeData.config.cronExpression}
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="handle-trigger"
        style={{ right: -6 }}
      />
    </div>
  );
});
TriggerNode.displayName = 'TriggerNode';
