import React from 'react';
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
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface LandingPageProps {
  onOpenAuth: (mode?: 'LOGIN' | 'SIGNUP') => void;
  onEnterStudio: () => void;
  onOpenDashboard: () => void;
  isLoggedIn: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onEnterStudio,
  onOpenDashboard,
  isLoggedIn,
}) => {
  return (
    <div style={{ minHeight: '100vh', background: '#07090e', color: '#f8fafc', overflowY: 'auto' }}>
      {/* Top Navbar */}
      <nav
        style={{
          height: 70,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(7, 9, 14, 0.85)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>
              FLOW<span style={{ color: '#06b6d4' }}>FORGE</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: 24, fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>
            <a href="#features" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s' }}>Features</a>
            <a href="#architecture" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s' }}>Architecture</a>
            <a href="#blueprints" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s' }}>Blueprints</a>
            <a href="https://github.com/vinitk1509/FlowForge" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
              GitHub
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isLoggedIn ? (
            <>
              <button
                onClick={onOpenDashboard}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 10,
                  color: '#ffffff',
                  padding: '9px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Go to Dashboard
              </button>
              <button
                onClick={onEnterStudio}
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
                onClick={() => onOpenAuth('LOGIN')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#cbd5e1',
                  padding: '9px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('SIGNUP')}
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
          background: 'radial-gradient(ellipse at 50% 0%, rgba(6, 182, 212, 0.15) 0%, rgba(7, 9, 14, 0) 70%)',
        }}
      >
        <div style={{ maxWidth: 940, margin: '0 auto' }}>
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
              color: '#38bdf8',
              marginBottom: 24,
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.2)',
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
              color: '#94a3b8',
              lineHeight: 1.6,
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
              onClick={() => {
                sounds.playClick();
                if (isLoggedIn) onOpenDashboard();
                else onOpenAuth('LOGIN');
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 12,
                color: '#e2e8f0',
                padding: '14px 24px',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>Explore Workflows</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Metric Badges */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
                  background: 'rgba(19, 27, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 12,
                  padding: '16px 20px',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div style={{ fontSize: 11, color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#f8fafc', margin: '4px 0' }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Architecture & Showcase */}
      <section id="architecture" style={{ padding: '80px 40px', background: '#0a0e17' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Architectural Standard
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800, color: '#ffffff', marginTop: 8 }}>
              Built for Scale. Engineered Without Shortcuts.
            </h2>
            <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 650, margin: '12px auto 0 auto' }}>
              Unlike monolithic workflow tools that execute arbitrary scripts on shared threads, FlowForge treats every node as a stateless microservice consumer.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {[
              {
                icon: <GitBranch size={22} color="#8b5cf6" />,
                title: 'Directed Acyclic Graph (DAG)',
                desc: 'Topological sorting via Kahn’s algorithm detects circular cycles before execution, allowing parallel branch execution without deadlock.',
              },
              {
                icon: <Cpu size={22} color="#06b6d4" />,
                title: 'Asynchronous Worker Pool',
                desc: 'Kafka topics buffer node executions. Horizontal worker processes consume ready nodes and emit completion events asynchronously.',
              },
              {
                icon: <Database size={22} color="#f59e0b" />,
                title: 'Database-Per-Service Autonomy',
                desc: 'Clean microservice separation: auth_db, workflow_db, execution_db, and credential_db are logically isolated with zero cross-database joins.',
              },
              {
                icon: <Lock size={22} color="#10b981" />,
                title: 'Cryptographic Connector Vault',
                desc: 'External passwords, API keys, and OAuth tokens are stored encrypted at rest with AES-GCM and referenced only by credential UUIDs.',
              },
              {
                icon: <Shield size={22} color="#f43f5e" />,
                title: 'Dead Letter Queue & Retries',
                desc: 'Transient HTTP timeouts recover with exponential backoff. Exhausted failures are preserved in DLQs with diagnostic context.',
              },
              {
                icon: <Terminal size={22} color="#38bdf8" />,
                title: 'Node-Level Telemetry',
                desc: 'Inspect exact inputs, transformed outputs, and millisecond latencies for every individual node run in execution history.',
              },
            ].map((feat, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(19, 27, 42, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 16,
                  padding: '28px',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(255, 255, 255, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 18,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f8fafc', marginBottom: 10 }}>{feat.title}</h3>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Comparison */}
      <section id="features" style={{ padding: '80px 40px', background: '#07090e' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Why FlowForge
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 30, fontWeight: 800, color: '#ffffff', marginTop: 8 }}>
              Point-to-Point Scripts vs. FlowForge Engine
            </h2>
          </div>

          <div
            style={{
              background: 'rgba(19, 27, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(7, 9, 14, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <th style={{ padding: '16px 20px', color: '#94a3b8', fontWeight: 700 }}>Capability</th>
                  <th style={{ padding: '16px 20px', color: '#f43f5e', fontWeight: 700 }}>Custom Point-to-Point Scripts</th>
                  <th style={{ padding: '16px 20px', color: '#06b6d4', fontWeight: 700 }}>FlowForge Platform</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cap: 'Retry Handling', bad: 'Custom try-catch, inconsistent sleep() loops', good: 'Configurable exponential backoff + DLQ' },
                  { cap: 'Secret Management', bad: 'Hardcoded env vars & accidental git commits', good: 'AES-GCM encrypted vault with UUID references' },
                  { cap: 'Execution Observability', bad: 'Scattered logs in cloud watch / stdout', good: 'Step-by-step DAG telemetry with inputs/outputs' },
                  { cap: 'Branching & Validation', bad: 'Complex nested conditionals, risk of loops', good: 'Strict Kahn DAG validator with dual-branch handles' },
                  { cap: 'Concurrency & Scaling', bad: 'Single thread bottlenecks, duplicate events', good: 'Kafka consumer groups + Redis idempotency locks' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#ffffff' }}>{row.cap}</td>
                    <td style={{ padding: '16px 20px', color: '#cbd5e1' }}>{row.bad}</td>
                    <td style={{ padding: '16px 20px', color: '#38bdf8', fontWeight: 600 }}>{row.good}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section style={{ padding: '80px 40px', textAlign: 'center', background: 'radial-gradient(ellipse at 50% 100%, rgba(6, 182, 212, 0.2) 0%, rgba(7, 9, 14, 0) 70%)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 34, fontWeight: 800, color: '#ffffff', marginBottom: 14 }}>
            Ready to Build With Architectural Certainty?
          </h2>
          <p style={{ fontSize: 16, color: '#94a3b8', marginBottom: 32 }}>
            Launch the visual canvas studio or dive into the pre-loaded blueprints.
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
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          color: '#64748b',
          background: '#07090e',
        }}
      >
        <div>&copy; 2026 FlowForge Platform. Distributed Workflow Automation.</div>
        <div style={{ display: 'flex', gap: 20 }}>
          <a href="https://github.com/vinitk1509/FlowForge" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
            GitHub Repository
          </a>
          <span>Java 21 • Spring Boot • Apache Kafka • Redis • PostgreSQL</span>
        </div>
      </footer>
    </div>
  );
};
