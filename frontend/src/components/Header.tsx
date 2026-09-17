import React, { useState } from 'react';
import {
  Play,
  ShieldCheck,
  Zap,
  Volume2,
  VolumeX,
  Download,
  FolderOpen,
  Check,
  Edit2,
  ArrowLeft,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface HeaderProps {
  workflowName: string;
  onRenameWorkflow: (name: string) => void;
  onSimulate: () => void;
  isSimulating: boolean;
  onValidate: () => void;
  isActive: boolean;
  onToggleActive: () => void;
  onOpenTemplates: () => void;
  onExportJson: () => void;
  nodeCount: number;
  edgeCount: number;
  onBackToDashboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  workflowName,
  onRenameWorkflow,
  onSimulate,
  isSimulating,
  onValidate,
  isActive,
  onToggleActive,
  onOpenTemplates,
  onExportJson,
  nodeCount,
  edgeCount,
  onBackToDashboard,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(workflowName);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSaveName = () => {
    if (tempName.trim()) {
      onRenameWorkflow(tempName.trim());
    }
    setIsEditingName(false);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
    if (next) sounds.playClick();
  };

  return (
    <header
      style={{
        height: 62,
        background: 'linear-gradient(90deg, rgba(7, 9, 14, 0.98) 0%, rgba(13, 18, 28, 0.95) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 20,
        position: 'relative',
      }}
    >
      {/* Left: Brand & Workflow Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              color: '#cbd5e1',
              padding: '6px 10px',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={14} />
            <span>Dashboard</span>
          </button>
        )}

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
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', color: '#ffffff' }}>
                FLOW<span style={{ color: '#06b6d4' }}>FORGE</span>
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: '#38bdf8',
                  padding: '2px 5px',
                  borderRadius: 4,
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                }}
              >
                STUDIO v1.0
              </span>
            </div>
          </div>
        </div>

        <div style={{ width: 1, height: 26, background: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Workflow Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isEditingName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="text"
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                autoFocus
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid #06b6d4',
                  borderRadius: 6,
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '4px 8px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSaveName}
                style={{
                  background: '#06b6d4',
                  border: 'none',
                  borderRadius: 6,
                  color: '#07090e',
                  padding: '5px',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => {
                setTempName(workflowName);
                setIsEditingName(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 6,
                transition: 'background 0.15s ease',
              }}
              className="hover-bg"
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{workflowName}</span>
              <Edit2 size={12} color="#64748b" />
            </div>
          )}

          {/* Stats pill */}
          <div
            style={{
              fontSize: 11,
              color: '#94a3b8',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              padding: '3px 8px',
              borderRadius: 6,
              display: 'flex',
              gap: 8,
            }}
          >
            <span>{nodeCount} nodes</span>
            <span style={{ color: '#475569' }}>•</span>
            <span>{edgeCount} connections</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Templates */}
        <button
          onClick={onOpenTemplates}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            color: '#cbd5e1',
            padding: '7px 12px',
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <FolderOpen size={14} color="#38bdf8" />
          <span>Templates</span>
        </button>

        {/* DAG Validator */}
        <button
          onClick={onValidate}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            color: '#cbd5e1',
            padding: '7px 12px',
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <ShieldCheck size={14} color="#10b981" />
          <span>Validate DAG</span>
        </button>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            color: soundEnabled ? '#38bdf8' : '#64748b',
            padding: '7px 10px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>

        {/* Export JSON */}
        <button
          onClick={onExportJson}
          title="Export Workflow JSON"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            color: '#cbd5e1',
            padding: '7px 10px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <Download size={15} />
        </button>

        <div style={{ width: 1, height: 24, background: 'rgba(255, 255, 255, 0.1)', margin: '0 4px' }} />

        {/* Simulate Execution Button */}
        <button
          onClick={onSimulate}
          disabled={isSimulating}
          style={{
            background: isSimulating
              ? 'rgba(245, 158, 11, 0.2)'
              : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            border: '1px solid #f59e0b',
            borderRadius: 8,
            color: isSimulating ? '#f59e0b' : '#07090e',
            padding: '7px 14px',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: isSimulating ? 'not-allowed' : 'pointer',
            boxShadow: isSimulating ? 'none' : '0 0 16px rgba(245, 158, 11, 0.35)',
            transition: 'all 0.2s ease',
          }}
        >
          <Play size={14} fill={isSimulating ? 'none' : '#07090e'} />
          <span>{isSimulating ? 'Simulating...' : 'Simulate Run'}</span>
        </button>

        {/* Active Toggle Switch */}
        <div
          onClick={onToggleActive}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
            padding: '5px 10px',
            borderRadius: 8,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isActive ? '#10b981' : '#64748b',
              boxShadow: isActive ? '0 0 8px #10b981' : 'none',
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? '#10b981' : '#94a3b8' }}>
            {isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
      </div>
    </header>
  );
};
