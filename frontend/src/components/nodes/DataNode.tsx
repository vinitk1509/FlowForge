import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { WorkflowNodeData } from '../../types/workflow';
import { Code2, Sliders, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const DataNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as WorkflowNodeData;

  const getIcon = () => {
    switch (nodeData.type) {
      case 'DATA_SET_VARIABLE':
        return <Sliders size={16} style={{ color: '#10b981' }} />;
      default:
        return <Code2 size={16} style={{ color: '#10b981' }} />;
    }
  };

  const getStatusBadge = () => {
    switch (nodeData.status) {
      case 'RUNNING':
        return (
          <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <Loader2 size={12} className="spin-animation" /> Reshaping
          </span>
        );
      case 'SUCCEEDED':
        return (
          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <CheckCircle2 size={12} /> {nodeData.lastRunDurationMs ? `${nodeData.lastRunDurationMs}ms` : 'Mapped'}
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
          <span style={{ color: '#34d399', fontSize: 10, padding: '2px 6px', background: 'rgba(52, 211, 153, 0.1)', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Data
          </span>
        );
    }
  };

  return (
    <div
      style={{
        width: 270,
        background: 'linear-gradient(180deg, rgba(18, 30, 26, 0.95) 0%, rgba(12, 20, 18, 0.98) 100%)',
        border: selected ? '2px solid #10b981' : '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: 12,
        padding: '12px 14px',
        boxShadow: selected
          ? '0 0 20px rgba(16, 185, 129, 0.4), 0 8px 24px rgba(0,0,0,0.6)'
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
        className="handle-data"
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
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(16, 185, 129, 0.3)',
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

      {/* Detail preview */}
      <div
        style={{
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: '#a7f3d0',
          background: 'rgba(0,0,0,0.3)',
          padding: '5px 8px',
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.05)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {nodeData.type === 'DATA_SET_VARIABLE'
          ? `set: ${nodeData.config?.variableName || 'key'} = ...`
          : 'JSON Transform -> Map & Filter'}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="handle-data"
        style={{ right: -6 }}
      />
    </div>
  );
});
DataNode.displayName = 'DataNode';
