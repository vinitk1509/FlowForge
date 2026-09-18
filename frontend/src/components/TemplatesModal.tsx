import React from 'react';
import { DEMO_TEMPLATES } from '../utils/demoWorkflows';
import type { WorkflowTemplate } from '../utils/demoWorkflows';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: WorkflowTemplate) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 620,
          maxHeight: '85vh',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 16,
          padding: '24px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          color: 'var(--text-primary)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} color="#06b6d4" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Workflow Blueprints</h3>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Select a pre-configured architecture template</div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              color: 'var(--text-secondary)',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <X size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingRight: 4 }}>
          {DEMO_TEMPLATES.map(template => (
            <div
              key={template.id}
              onClick={() => {
                sounds.playSuccess();
                onSelectTemplate(template);
                onClose();
              }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-card-hover)';
                e.currentTarget.style.borderColor = '#06b6d4';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg-card)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{template.name}</span>
                  {template.category && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: 'rgba(6, 182, 212, 0.12)',
                        color: '#0284c7',
                      }}
                    >
                      {template.category}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: '#06b6d4', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  Load Blueprint <ArrowRight size={12} />
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                {template.description}
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <span style={{ fontSize: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-secondary)' }}>
                  {template.nodes.length} Nodes
                </span>
                <span style={{ fontSize: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-secondary)' }}>
                  {template.edges.length} Connections
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
