import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { WorkflowNodeData } from '../../types/workflow';
import { GitBranch, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const LogicNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as WorkflowNodeData;

  const getStatusBadge = () => {
    switch (nodeData.status) {
      case 'RUNNING':
        return (
          <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <Loader2 size={12} className="spin-animation" /> Evaluating
          </span>
        );
      case 'SUCCEEDED':
        return (
          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <CheckCircle2 size={12} /> Branch: {nodeData.activeBranch?.toUpperCase() || 'EVAL'}
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
          <span style={{ color: '#c084fc', fontSize: 10, padding: '2px 6px', background: 'rgba(192, 132, 252, 0.1)', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Branch
          </span>
        );
    }
  };

  return (
    <div
      style={{
        width: 270,
        background: 'linear-gradient(180deg, rgba(26, 21, 38, 0.95) 0%, rgba(17, 14, 26, 0.98) 100%)',
        border: selected ? '2px solid #8b5cf6' : '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: 12,
        padding: '12px 14px',
        boxShadow: selected
          ? '0 0 20px rgba(139, 92, 246, 0.4), 0 8px 24px rgba(0,0,0,0.6)'
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
        className="handle-logic"
        style={{ left: -6, top: '50%' }}
      />

      {/* Top Bar with Icon & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
          >
            <GitBranch size={16} style={{ color: '#c084fc' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>
            {nodeData.name || nodeData.label}
          </span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Condition Expression Preview */}
      <div
        style={{
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: '#e2e8f0',
          background: 'rgba(0,0,0,0.3)',
          padding: '5px 8px',
          borderRadius: 6,
          marginBottom: 10,
          border: '1px solid rgba(255,255,255,0.06)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {nodeData.config?.conditionExpression || '$json.amount > 10000'}
      </div>

      {/* Branch Labels on Right Side */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end', marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', letterSpacing: '0.05em' }}>TRUE</span>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#f43f5e', letterSpacing: '0.05em' }}>FALSE</span>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f43f5e', boxShadow: '0 0 6px #f43f5e' }} />
        </div>
      </div>

      {/* Dual Output Handles: TRUE and FALSE */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="handle-true"
        style={{ right: -6, top: 68 }}
        title="True Branch"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="handle-false"
        style={{ right: -6, top: 96 }}
        title="False Branch"
      />
    </div>
  );
});
LogicNode.displayName = 'LogicNode';
