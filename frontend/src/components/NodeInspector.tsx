import React, { useState } from 'react';
import type { Node } from '@xyflow/react';
import type { WorkflowNodeData, WorkflowNodeConfig } from '../types/workflow';
import {
  X,
  Trash2,
  Copy,
  Play,
  Clock,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface NodeInspectorProps {
  selectedNode: Node<WorkflowNodeData> | null;
  onClose: () => void;
  onUpdateNodeData: (id: string, partialData: Partial<WorkflowNodeData>) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (node: Node<WorkflowNodeData>) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  selectedNode,
  onClose,
  onUpdateNodeData,
  onDeleteNode,
  onDuplicateNode,
}) => {
  const [activeTab, setActiveTab] = useState<'CONFIG' | 'TEST' | 'OUTPUT'>('CONFIG');
  const [isTestingStep, setIsTestingStep] = useState(false);

  if (!selectedNode) return null;

  const { data } = selectedNode;
  const config = data.config || {};

  const handleConfigChange = (key: keyof WorkflowNodeConfig, value: unknown) => {
    onUpdateNodeData(selectedNode.id, {
      config: {
        ...config,
        [key]: value,
      },
    });
  };

  const handleTestStep = () => {
    sounds.playStepRun();
    setIsTestingStep(true);

    setTimeout(() => {
      setIsTestingStep(false);
      sounds.playSuccess();

      let mockOutput: Record<string, unknown> = {};

      if (data.type === 'ACTION_HTTP') {
        mockOutput = {
          status: 200,
          statusText: 'OK',
          data: { success: true, processedAt: new Date().toISOString() },
          headers: { 'content-type': 'application/json' },
        };
      } else if (data.type === 'LOGIC_IF') {
        mockOutput = {
          result: true,
          evaluatedBranch: 'true',
          condition: config.conditionExpression,
        };
      } else if (data.type === 'DATA_TRANSFORM') {
        mockOutput = {
          transformed: true,
          timestamp: Date.now(),
          outputFieldsCount: 4,
        };
      } else {
        mockOutput = {
          executed: true,
          timestamp: new Date().toISOString(),
          type: data.type,
        };
      }

      onUpdateNodeData(selectedNode.id, {
        status: 'SUCCEEDED',
        lastRunDurationMs: Math.floor(Math.random() * 45) + 15,
        lastOutput: mockOutput,
      });

      setActiveTab('OUTPUT');
    }, 450);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 62,
        right: 0,
        width: 380,
        height: 'calc(100vh - 62px)',
        background: 'var(--bg-glass-elevated)',
        borderLeft: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 15,
        boxShadow: 'var(--shadow-lg)',
        color: 'var(--text-primary)',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="text"
              value={data.name || data.label}
              onChange={e => onUpdateNodeData(selectedNode.id, { name: e.target.value })}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 700,
                outline: 'none',
                fontFamily: 'var(--font-heading)',
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>ID: {selectedNode.id}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => onDuplicateNode(selectedNode)}
            title="Duplicate Node"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 6,
              color: '#cbd5e1',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => onDeleteNode(selectedNode.id)}
            title="Delete Node"
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              borderRadius: 6,
              color: '#f43f5e',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={onClose}
            title="Close Panel"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 6,
              color: '#cbd5e1',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(7, 9, 14, 0.5)',
        }}
      >
        {(['CONFIG', 'TEST', 'OUTPUT'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '10px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #06b6d4' : '2px solid transparent',
              color: activeTab === tab ? '#ffffff' : '#64748b',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab === 'CONFIG' ? 'Parameters' : tab === 'TEST' ? 'Test Step' : 'Last Output'}
          </button>
        ))}
      </div>

      {/* Tab Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {activeTab === 'CONFIG' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Description */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                Description
              </label>
              <input
                type="text"
                value={data.description || ''}
                onChange={e => onUpdateNodeData(selectedNode.id, { description: e.target.value })}
                placeholder="Node purpose / note..."
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </div>

            {/* Type-Specific Forms */}
            {data.type === 'ACTION_HTTP' && (
              <>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 100 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                      Method
                    </label>
                    <select
                      value={config.method || 'GET'}
                      onChange={e => handleConfigChange('method', e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 8,
                        padding: '8px',
                        color: '#f59e0b',
                        fontWeight: 700,
                        fontSize: 12,
                        outline: 'none',
                      }}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                      URL
                    </label>
                    <input
                      type="text"
                      value={config.url || ''}
                      onChange={e => handleConfigChange('url', e.target.value)}
                      placeholder="https://api.example.com/v1/..."
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 8,
                        padding: '8px 12px',
                        color: '#ffffff',
                        fontSize: 12,
                        outline: 'none',
                        fontFamily: 'var(--font-mono)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                    Request Body (JSON)
                  </label>
                  <textarea
                    rows={6}
                    value={config.body || ''}
                    onChange={e => handleConfigChange('body', e.target.value)}
                    placeholder='{"key": "value"}'
                    style={{
                      width: '100%',
                      background: 'rgba(7, 9, 14, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      padding: '10px 12px',
                      color: '#38bdf8',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
                    Supports expression interpolation: <code style={{ color: '#06b6d4' }}>{'{{ $json.amount }}'}</code>
                  </div>
                </div>
              </>
            )}

            {data.type === 'LOGIC_IF' && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                  Condition Expression
                </label>
                <input
                  type="text"
                  value={config.conditionExpression || ''}
                  onChange={e => handleConfigChange('conditionExpression', e.target.value)}
                  placeholder="$json.amount > 10000"
                  style={{
                    width: '100%',
                    background: 'rgba(7, 9, 14, 0.7)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#c084fc',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {['$json.amount > 10000', '$json.status === "ACTIVE"', '$json.items.length > 0'].map(expr => (
                    <button
                      key={expr}
                      onClick={() => handleConfigChange('conditionExpression', expr)}
                      style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: 4,
                        color: '#c084fc',
                        fontSize: 10,
                        padding: '2px 6px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {expr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {data.type === 'DATA_TRANSFORM' && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                  Transform Logic (JavaScript)
                </label>
                <textarea
                  rows={8}
                  value={config.transformCode || ''}
                  onChange={e => handleConfigChange('transformCode', e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(7, 9, 14, 0.7)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    color: '#34d399',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {data.type === 'ACTION_SLACK' && (
              <>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                    Channel
                  </label>
                  <input
                    type="text"
                    value={config.slackChannel || ''}
                    onChange={e => handleConfigChange('slackChannel', e.target.value)}
                    placeholder="#alerts"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                    Message Template
                  </label>
                  <textarea
                    rows={4}
                    value={config.slackMessage || ''}
                    onChange={e => handleConfigChange('slackMessage', e.target.value)}
                    placeholder="Alert message..."
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  />
                </div>
              </>
            )}

            {data.type === 'ACTION_EMAIL' && (
              <>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                    Recipient Email
                  </label>
                  <input
                    type="text"
                    value={config.emailTo || ''}
                    onChange={e => handleConfigChange('emailTo', e.target.value)}
                    placeholder="recipient@example.com"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    value={config.emailSubject || ''}
                    onChange={e => handleConfigChange('emailSubject', e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'TEST' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                borderRadius: 8,
                padding: '12px',
                fontSize: 12,
                color: '#38bdf8',
                lineHeight: 1.4,
              }}
            >
              Test execution for step: <strong>{data.name}</strong>. This triggers the isolated worker logic and reports execution outputs.
            </div>

            <button
              onClick={handleTestStep}
              disabled={isTestingStep}
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                border: 'none',
                borderRadius: 8,
                color: '#ffffff',
                padding: '10px',
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: isTestingStep ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
              }}
            >
              <Play size={14} fill="#ffffff" />
              <span>{isTestingStep ? 'Executing Step...' : 'Execute Test Step'}</span>
            </button>
          </div>
        )}

        {activeTab === 'OUTPUT' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>Step Output Payload</span>
              {data.lastRunDurationMs && (
                <span style={{ fontSize: 10, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} /> {data.lastRunDurationMs}ms
                </span>
              )}
            </div>
            <pre
              style={{
                background: '#07090e',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 8,
                padding: '12px',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: '#38bdf8',
                overflowX: 'auto',
                lineHeight: 1.4,
              }}
            >
              {JSON.stringify(data.lastOutput || { note: 'No execution output yet. Click Test Step to run.' }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
