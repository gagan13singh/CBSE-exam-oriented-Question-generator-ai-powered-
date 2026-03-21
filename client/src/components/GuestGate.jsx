import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
//  Soft top bar — shown while under limit, non-annoying
// ─────────────────────────────────────────────────────────────────────────────

function SoftCTABar() {
  const [dismissed, setDismissed] = useState(false);
  const { questionsUsed, currentLimit, questionsRemaining, isFirstSession } = useAuth();

  // Don't show until user has used at least 3 questions
  if (dismissed || questionsUsed < 3) return null;

  return (
    <div style={{
      width: '100%',
      background: 'rgba(99,102,241,0.07)',
      borderBottom: '1px solid rgba(99,102,241,0.15)',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
        {/* Usage pill */}
        <span style={{
          padding: '2px 10px', borderRadius: 20,
          background: 'rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.25)',
          color: '#818cf8', fontSize: 11, fontWeight: 600,
        }}>
          {questionsRemaining} left today
        </span>
        <span style={{ color: 'var(--muted, #64748b)' }}>
          Login with Scientia to get unlimited practice — it's free
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => window.location.href = '/login'}
          style={{
            padding: '5px 14px',
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.35)',
            borderRadius: 8,
            color: '#818cf8',
            fontSize: 12, fontWeight: 600,
            fontFamily: 'DM Sans, sans-serif',
            cursor: 'pointer',
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
        >
          Save progress →
        </button>

        {/* Dismiss — respects user, not annoying */}
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none', border: 'none',
            color: 'var(--muted, #64748b)',
            fontSize: 16, cursor: 'pointer',
            padding: '2px 4px', lineHeight: 1,
          }}
          title="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Full-screen gate — shown only when limit is hit
// ─────────────────────────────────────────────────────────────────────────────

function LimitGate({ onMaybeLater }) {
  const { isFirstSession, currentLimit } = useAuth();

  const handleContinueWithScientia = () => {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login?redirect=${returnUrl}`;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(5,9,21,0.92)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'DM Sans, sans-serif',
      animation: 'fadeIn 0.3s ease',
    }}>

      {/* Background orb */}
      <div style={{
        position: 'absolute',
        width: 500, height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 460,
        background: 'var(--surface, #0d1425)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 24,
        padding: '40px 36px',
        textAlign: 'center',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        animation: 'slideUp 0.35s cubic-bezier(0.22,1,0.36,1)',
      }}>

        {/* Icon */}
        <div style={{
          width: 64, height: 64,
          borderRadius: 20,
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.25)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 28,
        }}>
          ⚡
        </div>

        {/* Heading */}
        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 22, fontWeight: 800,
          color: 'var(--text, #e2e8f0)',
          margin: '0 0 10px',
          lineHeight: 1.2,
        }}>
          You've used all {currentLimit} free questions today
        </h2>

        <p style={{
          fontSize: 14, color: 'var(--muted, #64748b)',
          margin: '0 0 28px', lineHeight: 1.6,
        }}>
          {isFirstSession
            ? "Great start! Join Scientia for free to keep practising without any limits."
            : "Come back tomorrow for 10 more free questions, or join Scientia for unlimited access."
          }
        </p>

        {/* Scientia benefits */}
        <div style={{
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: 14,
          padding: '16px',
          marginBottom: 24,
          textAlign: 'left',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted, #64748b)', marginBottom: 12 }}>
            What you get with Scientia
          </div>
          {[
            '⚡ Unlimited questions on Vidyastra',
            '📚 Full LMS — courses, tests, assignments',
            '📊 Track your progress across sessions',
            '🎓 CBSE Class 9–12 curriculum',
          ].map((item, i) => (
            <div key={i} style={{
              fontSize: 13, color: '#94a3b8',
              padding: '4px 0',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {item}
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <button
          onClick={handleContinueWithScientia}
          style={{
            width: '100%', padding: '14px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', borderRadius: 13,
            color: '#fff',
            fontSize: 15, fontWeight: 700,
            fontFamily: 'Syne, sans-serif',
            cursor: 'pointer',
            marginBottom: 10,
            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          <span style={{
            width: 20, height: 20, borderRadius: 6,
            background: 'rgba(255,255,255,0.2)',
            display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 11, fontWeight: 800,
          }}>S</span>
          Continue unlimited with Scientia — Free
        </button>

        {/* Secondary — Maybe later */}
        <button
          onClick={onMaybeLater}
          style={{
            width: '100%', padding: '12px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 13,
            color: 'var(--muted, #64748b)',
            fontSize: 13, fontWeight: 500,
            fontFamily: 'DM Sans, sans-serif',
            cursor: 'pointer',
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)';
            e.currentTarget.style.color = '#94a3b8';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = 'var(--muted, #64748b)';
          }}
        >
          ⏳ Maybe later — come back tomorrow
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main GuestGate wrapper — wrap your question generation area with this
// ─────────────────────────────────────────────────────────────────────────────

export default function GuestGate({ children }) {
  const { isGuest, limitReached, markFirstSessionComplete, isFirstSession } = useAuth();
  const [gateDismissed, setGateDismissed] = useState(false);

  // Not a guest — render children normally
  if (!isGuest) return <>{children}</>;

  const handleMaybeLater = () => {
    // Mark first session done so next visit uses 10/day limit
    if (isFirstSession) markFirstSessionComplete();
    setGateDismissed(true);
  };

  return (
    <>
      {/* Soft top bar */}
      <SoftCTABar />

      {/* Full-screen gate when limit hit */}
      {limitReached && !gateDismissed && (
        <LimitGate onMaybeLater={handleMaybeLater} />
      )}

      {/* Always render children underneath */}
      {children}
    </>
  );
}