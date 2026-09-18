import React, { useState } from 'react';
import type { ExecutionSummary, ExecutionLogEntry } from '../types/workflow';
import {
  Terminal,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';

interface ExecutionConsoleProps {
  execution: ExecutionSummary | null;
  isOpen: boolean;
  onToggleOpen: () => void;
  onClose: () => void;
  onRerun: () => void;
}

export const ExecutionConsole: React.FC<ExecutionConsoleProps> = ({
  execution,
  isOpen,
  onToggleOpen,
  onClose,
  onRerun,
}) => {
  const [selectedEntry, setSelectedEntry] = useState<ExecutionLogEntry | null>(null);
  const [copied, setCopied] = useState(false);

  if (!execution) return null;

  const currentEntry = selectedEntry || execution.logs[execution.logs.length - 1];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 280,
        right: 0,
        height: isOpen ? 260 : 40,
        background: 'var(--bg-glass-elevated)',
        borderTop: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 14,
        transition: 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease',
        boxShadow: 'var(--shadow-lg)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Console Bar Header */}
      <div
        style={{
          height: 40,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isOpen ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={onToggleOpen}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Terminal size={15} color="#06b6d4" />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc', letterSpacing: '0.02em' }}>
            EXECUTION CONSOLE
          </span>

          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 4,
              background:
                execution.status === 'SUCCEEDED'
                  ? 'rgba(16, 185, 129, 0.15)'
                  : execution.status === 'RUNNING'
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(244, 63, 94, 0.15)',
              color:
                execution.status === 'SUCCEEDED'
                  ? '#10b981'
                  : execution.status === 'RUNNING'
                  ? '#fbbf24'
                  : '#f43f5e',
              border: `1px solid ${
                execution.status === 'SUCCEEDED'
                  ? 'rgba(16, 185, 129, 0.3)'
                  : execution.status === 'RUNNING'
                  ? 'rgba(245, 158, 11, 0.3)'
                  : 'rgba(244, 63, 94, 0.3)'
              }`,
            }}
          >
            {execution.status}
          </span>

          {execution.totalDurationMs !== undefined && (
            <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> {execution.totalDurationMs}ms total
            </span>
          )}

          <span style={{ fontSize: 11, color: '#64748b' }}>
            ID: {execution.executionId.slice(0, 8)}...
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={e => e.stopPropagation()}>
          <button
            onClick={onRerun}
            title="Re-run simulation"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 6,
              color: '#cbd5e1',
              padding: '4px 8px',
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={12} /> Re-run
          </button>
          <button
            onClick={onToggleOpen}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}
          >
            {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Expanded Console Content */}
      {isOpen && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Step Timeline List */}
          <div
            style={{
              width: 320,
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              overflowY: 'auto',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {execution.logs.map((log, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedEntry(log)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: currentEntry === log ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                  border: currentEntry === log ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {log.status === 'SUCCEEDED' ? (
                    <CheckCircle2 size={14} color="#10b981" />
                  ) : log.status === 'RUNNING' ? (
                    <Clock size={14} color="#fbbf24" />
                  ) : (
                    <AlertCircle size={14} color="#f43f5e" />
                  )}
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#f8fafc' }}>
                    {idx + 1}. {log.nodeName}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                  {log.durationMs}ms
                </span>
              </div>
            ))}
          </div>

          {/* JSON Payload Inspector */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div
              style={{
                height: 32,
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(7, 9, 14, 0.4)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>
                Output Data: {currentEntry?.nodeName}
              </span>
              <button
                onClick={() => handleCopy(JSON.stringify(currentEntry?.outputPayload || {}, null, 2))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copied ? '#10b981' : '#94a3b8',
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
            </div>

            <pre
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px 16px',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: '#38bdf8',
                lineHeight: 1.4,
              }}
            >
              {JSON.stringify(currentEntry?.outputPayload || { status: 'pending' }, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
