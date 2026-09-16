import React from 'react';
import type { ValidationResult } from '../types/workflow';
import { ShieldCheck, AlertTriangle, XCircle, X } from 'lucide-react';

interface DagValidationModalProps {
  result: ValidationResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DagValidationModal: React.FC<DagValidationModalProps> = ({
  result,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !result) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
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
          width: 480,
          background: 'linear-gradient(180deg, #131b2a 0%, #0d121c 100%)',
          border: `1px solid ${result.valid ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
          borderRadius: 16,
          padding: '24px',
          boxShadow: result.valid
            ? '0 0 32px rgba(16, 185, 129, 0.3), 0 16px 48px rgba(0,0,0,0.8)'
            : '0 0 32px rgba(244, 63, 94, 0.3), 0 16px 48px rgba(0,0,0,0.8)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {result.valid ? (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={20} color="#10b981" />
              </div>
            ) : (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <XCircle size={20} color="#f43f5e" />
              </div>
            )}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                {result.valid ? 'DAG Validation Passed' : 'DAG Validation Issues'}
              </h3>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                {result.valid
                  ? 'Workflow structure adheres to Directed Acyclic Graph standards'
                  : 'Resolve graph cycle or entrypoint conflicts before activating'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              color: '#cbd5e1',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Errors list */}
        {result.errors.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f43f5e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Errors ({result.errors.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {result.errors.map((err, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 12,
                    color: '#fca5a5',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}
                >
                  <XCircle size={14} color="#f43f5e" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings list */}
        {result.warnings.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Warnings ({result.warnings.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {result.warnings.map((warn, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.25)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 12,
                    color: '#fde68a',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}
                >
                  <AlertTriangle size={14} color="#fbbf24" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.valid && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 8,
              padding: '12px',
              fontSize: 12,
              color: '#6ee7b7',
              lineHeight: 1.5,
              marginBottom: 16,
            }}
          >
            ✓ All node references are valid.<br />
            ✓ Valid trigger root identified.<br />
            ✓ Directed graph is strictly acyclic with no infinite loops.<br />
            ✓ Workflow is ready to be locked and activated on the backend.
          </div>
        )}

        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: result.valid ? '#10b981' : '#334155',
              border: 'none',
              borderRadius: 8,
              color: '#ffffff',
              padding: '8px 18px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
