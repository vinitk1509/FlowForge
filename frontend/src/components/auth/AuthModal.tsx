import React, { useState } from 'react';
import {
  Zap,
  Lock,
  Mail,
  User,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';
import { AuthService } from '../../services/api';
import type { AuthSession } from '../../types/auth';
import { sounds } from '../../utils/soundEffects';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'LOGIN' | 'SIGNUP';
  onClose: () => void;
  onSuccess: (session: AuthSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'LOGIN',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>(initialMode);
  const [email, setEmail] = useState('alex.chen@flowforge.io');
  const [password, setPassword] = useState('supersecret123');
  const [name, setName] = useState('Alex Chen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    setLoading(true);
    setError(null);

    try {
      let session: AuthSession;
      if (mode === 'LOGIN') {
        session = await AuthService.login(email, password);
      } else {
        session = await AuthService.register(email, password, name);
      }
      sounds.playSuccess();
      onSuccess(session);
      onClose();
    } catch {
      setError('Authentication failed. Please check your credentials.');
      sounds.playError();
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async () => {
    sounds.playClick();
    setEmail('alex.chen@flowforge.io');
    setPassword('supersecret123');
    setName('Alex Chen');
    setLoading(true);

    const session = await AuthService.login('alex.chen@flowforge.io', 'supersecret123');
    sounds.playSuccess();
    setLoading(false);
    onSuccess(session);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(3, 5, 8, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 440,
          background: 'linear-gradient(180deg, #131b2a 0%, #0c1017 100%)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: 20,
          padding: '32px',
          boxShadow: '0 0 40px rgba(6, 182, 212, 0.25), 0 24px 64px rgba(0,0,0,0.85)',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            color: '#94a3b8',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
          }}
        >
          <X size={16} />
        </button>

        {/* Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
            }}
          >
            <Zap size={20} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
              {mode === 'LOGIN' ? 'Welcome Back to FlowForge' : 'Create FlowForge Account'}
            </h2>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              {mode === 'LOGIN'
                ? 'Sign in to access your distributed workflows'
                : 'Build event-driven microservices workflows'}
            </div>
          </div>
        </div>

        {/* 1-Click Demo Fill Banner */}
        <div
          onClick={handleDemoFill}
          style={{
            marginTop: 18,
            marginBottom: 20,
            background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
            border: '1px dashed rgba(6, 182, 212, 0.5)',
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color="#06b6d4" />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8' }}>1-Click Instant Demo Login</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>Test with pre-configured workflows and history</div>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8' }}>Sign in &rarr;</span>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 8,
              padding: '10px',
              fontSize: 12,
              color: '#fca5a5',
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'SIGNUP' && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                Full Name
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  padding: '10px 14px',
                }}
              >
                <User size={15} color="#64748b" />
                <input
                  type="text"
                  required
                  placeholder="Alex Chen"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: 13,
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
              Work Email
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 10,
                padding: '10px 14px',
              }}
            >
              <Mail size={15} color="#64748b" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 13,
                  outline: 'none',
                  width: '100%',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
              Password
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 10,
                padding: '10px 14px',
              }}
            >
              <Lock size={15} color="#64748b" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 13,
                  outline: 'none',
                  width: '100%',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: 10,
              color: '#ffffff',
              padding: '12px',
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'LOGIN' ? 'Sign In to Studio' : 'Create Free Account'}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Switch mode */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#94a3b8' }}>
          {mode === 'LOGIN' ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('SIGNUP');
                  setError(null);
                }}
                style={{ background: 'transparent', border: 'none', color: '#06b6d4', fontWeight: 700, cursor: 'pointer' }}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setError(null);
                }}
                style={{ background: 'transparent', border: 'none', color: '#06b6d4', fontWeight: 700, cursor: 'pointer' }}
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
