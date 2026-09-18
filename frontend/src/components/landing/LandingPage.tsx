import React, { useEffect, useRef } from 'react';
import {
  Zap,
  Shield,
  ArrowRight,
  Database,
  Cpu,
  Terminal,
  Activity,
  Lock,
  GitBranch,
  Play,
  ChevronRight,
  Sun,
  Moon,
  Workflow,
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import { useTheme } from '../../context/ThemeContext';
import { DEMO_TEMPLATES } from '../../utils/demoWorkflows';
import type { WorkflowTemplate } from '../../utils/demoWorkflows';

interface LandingPageProps {
  onOpenAuth: (mode?: 'LOGIN' | 'SIGNUP') => void;
  onEnterStudio: (template?: WorkflowTemplate) => void;
  onOpenDashboard: () => void;
  isLoggedIn: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onEnterStudio,
  onOpenDashboard,
  isLoggedIn,
}) => {
  const { theme, toggleTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth scroll handler for one-page navigation
  const scrollToSection = (sectionId: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    sounds.playClick();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', `#${sectionId}`);
    }
  };

  // Scroll to hash on mount or when hash changes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: '100vh',
        height: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        overflowY: 'auto',
        scrollBehavior: 'smooth',
        position: 'relative',
      }}
    >
      {/* Top Title Bar / Navbar */}
      <nav
        style={{
          height: 70,
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          boxShadow: 'var(--shadow-sm)',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          {/* Brand Logo */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            onClick={() => {
              sounds.playClick();
              containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
              window.history.pushState(null, '', window.location.pathname);
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
              }}
            >
              <Zap size={20} color="#ffffff" />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: 18,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              FLOW<span style={{ color: '#06b6d4' }}>FORGE</span>
            </span>
          </div>

          {/* Clean One-Page Nav Links (GitHub removed from title) */}
          <div style={{ display: 'flex', gap: 28, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
            <a
              href="#features"
              onClick={e => scrollToSection('features', e)}
              style={{
                color: 'inherit',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#06b6d4')}
              onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}
            >
              Features
            </a>
            <a
              href="#architecture"
              onClick={e => scrollToSection('architecture', e)}
              style={{
                color: 'inherit',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#06b6d4')}
              onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}
            >
              Architecture
            </a>
            <a
              href="#blueprints"
              onClick={e => scrollToSection('blueprints', e)}
              style={{
                color: 'inherit',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#06b6d4')}
              onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}
            >
              Blueprints
            </a>
          </div>
        </div>

        {/* Right Nav Actions: Theme Toggle & Studio/Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme mode"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              color: theme === 'dark' ? '#fbbf24' : '#6366f1',
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.borderColor = 'var(--border-highlight)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {isLoggedIn ? (
            <>
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenDashboard();
                }}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 10,
                  color: 'var(--text-primary)',
                  padding: '9px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  onEnterStudio();
                }}
                style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
                  border: 'none',
                  borderRadius: 10,
                  color: '#ffffff',
                  padding: '9px 20px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
                }}
              >
                Launch Studio &rarr;
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenAuth('LOGIN');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  padding: '9px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenAuth('SIGNUP');
                }}
                style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
                  border: 'none',
                  borderRadius: 10,
                  color: '#ffffff',
                  padding: '9px 20px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 0 18px rgba(6, 182, 212, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>Get Started</span>
                <ArrowRight size={14} />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          padding: '80px 40px 100px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background:
            theme === 'dark'
              ? 'radial-gradient(ellipse at 50% 0%, rgba(6, 182, 212, 0.15) 0%, rgba(7, 9, 14, 0) 70%)'
              : 'radial-gradient(ellipse at 50% 0%, rgba(6, 182, 212, 0.12) 0%, rgba(248, 250, 252, 0) 70%)',
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: 999,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              color: '#0284c7',
              marginBottom: 24,
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.15)',
            }}
          >
            <Activity size={14} color="#06b6d4" />
            <span>Distributed Event-Driven Automation Engine</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(36px, 5vw, 58px)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: 20,
              color: 'var(--text-primary)',
            }}
          >
            Forge Mission-Critical Automations with{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #38bdf8 50%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Zero-Loss Reliability.
            </span>
          </h1>

          <p
            style={{
              fontSize: 17,
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              maxWidth: 720,
              margin: '0 auto 36px auto',
            }}
          >
            Stop writing fragile point-to-point glue code. FlowForge gives engineering teams a high-performance DAG engine powered by Spring Boot, Apache Kafka, Redis locks, and PostgreSQL database-per-service isolation.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <button
              onClick={() => {
                sounds.playClick();
                if (isLoggedIn) onEnterStudio();
                else onOpenAuth('SIGNUP');
              }}
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: 12,
                color: '#ffffff',
                padding: '14px 28px',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 0 28px rgba(6, 182, 212, 0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Play size={16} fill="#ffffff" />
              <span>Launch Live Studio</span>
            </button>

            <button
              onClick={e => scrollToSection('blueprints', e)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                color: 'var(--text-primary)',
                padding: '14px 24px',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span>Explore Blueprints</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Metric Badges */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: 16,
              marginTop: 64,
              textAlign: 'left',
            }}
          >
            {[
              { label: 'DAG Validation', value: '100% Kahn Acyclic', desc: 'Zero accidental infinite loops' },
              { label: 'Execution Guarantees', value: 'Idempotent Workers', desc: 'Redis lock delivery guards' },
              { label: 'Secret Security', value: 'AES-256 GCM Vault', desc: 'Credentials never in JSON' },
              { label: 'Latency Telemetry', value: '< 45ms Overhead', desc: 'Kafka KRaft streaming' },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  padding: '18px 20px',
                  backdropFilter: 'blur(12px)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ fontSize: 11, color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 1: FEATURES (#features) */}
      <section
        id="features"
        style={{
          padding: '90px 40px',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          transition: 'background-color 0.2s ease',
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Engineered for Mission-Critical Reliability
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 34,
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginTop: 8,
              }}
            >
              Enterprise Capabilities Out of the Box
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 650, margin: '12px auto 0 auto' }}>
              FlowForge combines the visual speed of node canvases with the resilience of Kafka event-driven architectures.
            </p>
          </div>

          {/* Feature Grid Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 60 }}>
            {[
              {
                icon: <Workflow size={22} color="#06b6d4" />,
                title: 'Visual Drag & Drop Canvas',
                desc: 'Reactive node canvas with smooth-step connectors, auto-snapping grid, and instant visual validation for multi-branch branching.',
              },
              {
                icon: <GitBranch size={22} color="#8b5cf6" />,
                title: 'Kahn Topological Cycle Detection',
                desc: 'Every workflow is verified via topological sort before persistence. Circular loops and orphan nodes are flagged before deployment.',
              },
              {
                icon: <Cpu size={22} color="#f59e0b" />,
                title: 'Stateless Kafka Worker Pool',
                desc: 'Horizontally scalable worker processes consume execution queues asynchronously with partitioned worker group balancing.',
              },
              {
                icon: <Lock size={22} color="#10b981" />,
                title: 'AES-256 GCM Secret Vault',
                desc: 'Secrets, API tokens, and database credentials are encrypted at rest with AES-GCM and referenced only by UUID identifiers.',
              },
              {
                icon: <Activity size={22} color="#38bdf8" />,
                title: 'Real-Time Step Telemetry',
                desc: 'Track each node runtime, HTTP status codes, latency histograms, and exact JSON payloads across historical execution runs.',
              },
              {
                icon: <Shield size={22} color="#f43f5e" />,
                title: 'Dead Letter Queue & Auto-Retry',
                desc: 'Transient HTTP network drops are retried with exponential backoff. Irrecoverable failures are routed to DLQ with debug context.',
              },
            ].map((feat, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 16,
                  padding: '28px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#06b6d4';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{feat.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{feat.desc}</p>
              </div>
            ))}
          </div>

          {/* Architecture Comparison Table */}
          <div style={{ marginTop: 40 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Engineering Comparison
              </span>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginTop: 6 }}>
                Point-to-Point Scripts vs. FlowForge Engine
              </h3>
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 700 }}>Capability</th>
                    <th style={{ padding: '16px 20px', color: '#f43f5e', fontWeight: 700 }}>Custom Point-to-Point Scripts</th>
                    <th style={{ padding: '16px 20px', color: '#06b6d4', fontWeight: 700 }}>FlowForge Platform</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cap: 'Retry Handling', bad: 'Custom try-catch, inconsistent sleep() loops', good: 'Configurable exponential backoff + DLQ' },
                    { cap: 'Secret Management', bad: 'Hardcoded env vars & accidental git commits', good: 'AES-GCM encrypted vault with UUID references' },
                    { cap: 'Execution Observability', bad: 'Scattered logs in stdout / files', good: 'Step-by-step DAG telemetry with inputs/outputs' },
                    { cap: 'Branching & Validation', bad: 'Complex nested conditionals, risk of infinite loops', good: 'Strict Kahn DAG validator with dual-branch handles' },
                    { cap: 'Concurrency & Scaling', bad: 'Single thread bottlenecks, duplicate events', good: 'Kafka consumer groups + Redis idempotency locks' },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-primary)' }}>{row.cap}</td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{row.bad}</td>
                      <td style={{ padding: '16px 20px', color: '#0284c7', fontWeight: 600 }}>{row.good}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ARCHITECTURE (#architecture) */}
      <section
        id="architecture"
        style={{
          padding: '90px 40px',
          background: 'var(--bg-primary)',
          transition: 'background-color 0.2s ease',
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Distributed System Blueprint
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 34,
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginTop: 8,
              }}
            >
              Built for Scale. Engineered Without Shortcuts.
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 680, margin: '12px auto 0 auto' }}>
              Unlike monolithic workflow tools that execute arbitrary scripts on shared threads, FlowForge treats every node as a stateless microservice consumer with database-per-service isolation.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {[
              {
                icon: <Database size={22} color="#f59e0b" />,
                title: 'Database-Per-Service Isolation',
                desc: 'Clean microservice separation: auth_db, workflow_db, execution_db, and credential_db are logically isolated with zero cross-database joins.',
              },
              {
                icon: <Terminal size={22} color="#06b6d4" />,
                title: 'Kahn DAG Topological Validation',
                desc: 'Guarantees execution predictability. Circular dependencies are impossible to instantiate, allowing safe concurrent multi-branch branching.',
              },
              {
                icon: <Cpu size={22} color="#10b981" />,
                title: 'Redis Distributed Idempotency Locks',
                desc: 'Atomic lock coordination guarantees each ready node is processed by exactly one worker, completely avoiding duplicated writes or payouts.',
              },
              {
                icon: <Lock size={22} color="#8b5cf6" />,
                title: 'Cryptographic Connector Vault',
                desc: 'Credentials never touch execution payload JSON. Workers resolve secret UUIDs at runtime via authenticated AES-256 GCM vault calls.',
              },
              {
                icon: <Activity size={22} color="#38bdf8" />,
                title: 'Real-Time State Machine (SSE)',
                desc: 'Studio and execution consoles stream live node status changes via Server-Sent Events with under 35ms update propagation.',
              },
              {
                icon: <Shield size={22} color="#f43f5e" />,
                title: 'Immutable Version Snapshots',
                desc: 'Deployed workflows are version-locked. Running workflows execute against their immutable revision snapshot even while drafts are edited.',
              },
            ].map((arch, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 16,
                  padding: '28px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#8b5cf6';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {arch.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{arch.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{arch.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: BLUEPRINTS (#blueprints) */}
      <section
        id="blueprints"
        style={{
          padding: '90px 40px',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          transition: 'background-color 0.2s ease',
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Pre-Configured Architecture Blueprints
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 34,
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginTop: 8,
              }}
            >
              Battle-Tested Production Templates
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 650, margin: '12px auto 0 auto' }}>
              Select any pre-architected blueprint to instantly open and simulate in the FlowForge Studio canvas.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            {DEMO_TEMPLATES.map(template => (
              <div
                key={template.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 16,
                  padding: '26px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#06b6d4';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div>
                  {/* Category badge & Node count */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 6,
                        background: 'rgba(6, 182, 212, 0.12)',
                        color: '#0284c7',
                        border: '1px solid rgba(6, 182, 212, 0.25)',
                      }}
                    >
                      {template.category || 'Architecture Blueprint'}
                    </span>
                    <div style={{ display: 'flex', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                      <span>{template.nodes.length} nodes</span>
                      <span>•</span>
                      <span>{template.edges.length} edges</span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                    {template.name}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 18 }}>
                    {template.description}
                  </p>

                  {/* Node Sequence Preview */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                    {template.nodes.map(n => (
                      <span
                        key={n.id}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          padding: '2px 8px',
                          borderRadius: 6,
                          color: 'var(--text-secondary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background:
                              n.data.category === 'TRIGGER'
                                ? 'var(--color-trigger)'
                                : n.data.category === 'ACTION'
                                ? 'var(--color-action)'
                                : n.data.category === 'LOGIC'
                                ? 'var(--color-logic)'
                                : 'var(--color-data)',
                          }}
                        />
                        {n.data.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Launch Action */}
                <button
                  onClick={() => {
                    sounds.playSuccess();
                    onEnterStudio(template);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
                    border: 'none',
                    borderRadius: 10,
                    color: '#ffffff',
                    padding: '11px 18px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 0 16px rgba(6, 182, 212, 0.35)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Play size={14} fill="#ffffff" />
                  <span>Launch in Studio</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: '90px 40px',
          textAlign: 'center',
          background:
            theme === 'dark'
              ? 'radial-gradient(ellipse at 50% 100%, rgba(6, 182, 212, 0.2) 0%, rgba(7, 9, 14, 0) 70%)'
              : 'radial-gradient(ellipse at 50% 100%, rgba(6, 182, 212, 0.15) 0%, rgba(248, 250, 252, 0) 70%)',
        }}
      >
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 36,
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: 14,
            }}
          >
            Ready to Build With Architectural Certainty?
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 32 }}>
            Launch the visual canvas studio or dive into the pre-loaded blueprints with zero configuration.
          </p>
          <button
            onClick={() => {
              sounds.playClick();
              if (isLoggedIn) onEnterStudio();
              else onOpenAuth('SIGNUP');
            }}
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: 12,
              color: '#ffffff',
              padding: '16px 36px',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 32px rgba(6, 182, 212, 0.5)',
            }}
          >
            Get Started with FlowForge Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '24px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'var(--text-muted)',
          background: 'var(--bg-surface)',
        }}
      >
        <div>&copy; 2026 FlowForge Platform. Distributed Workflow Automation Engine.</div>
        <div style={{ display: 'flex', gap: 20 }}>
          <span>Java 21 • Spring Boot 3.4 • Apache Kafka KRaft • Redis • PostgreSQL</span>
        </div>
      </footer>
    </div>
  );
};
