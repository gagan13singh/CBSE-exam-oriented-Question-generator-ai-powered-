import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { goToScientia } from '../utils/sso';

// ─────────────────────────────────────────────────────────────────────────────
//  Small reusable input
// ─────────────────────────────────────────────────────────────────────────────
const Input = ({ type = 'text', placeholder, value, onChange, disabled }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    disabled={disabled}
    style={{
      width: '100%',
      padding: '12px 16px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(99,102,241,0.3)',
      borderRadius: 12,
      color: '#e2e8f0',
      fontSize: 14,
      fontFamily: 'DM Sans, sans-serif',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s',
    }}
    onFocus={e => e.target.style.borderColor = '#6366f1'}
    onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.3)'}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function LoginPage({ onBack = null, onSuccess = null }) {
  const { signIn, signUp, signInWithMagicLink, signOut, isLoggedIn, loading, isGuest } = useAuth();

  const [mode, setMode] = useState('login');       // 'login' | 'register' | 'magic'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // If already logged in OR already in guest mode, call onSuccess callback
  useEffect(() => {
    if (!loading && (isLoggedIn || isGuest) && onSuccess) {
      onSuccess();
    }
  }, [loading, isLoggedIn, isGuest, onSuccess]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(email, password);
      window.history.pushState({}, '', '/');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signUp(email, password, name);
      setSuccess('Account created! Please check your email to confirm, then log in.');
      setMode('login');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signInWithMagicLink(email);
      setSuccess('Magic link sent! Check your email and click the link to sign in.');
    } catch (err) {
      setError(err.message || 'Failed to send magic link. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuest = () => {
    // Switch to generator mode and clean up URL
    window.history.pushState({}, '', '/');
    if (onSuccess) onSuccess();
  };

  const handleScientiaSSO = () => {
    // Redirect to Scientia login, which will auto-login back to Vidyastra
    const returnUrl = `${import.meta.env.VITE_VIDYASTRA_URL || window.location.origin}/`;
    window.location.href = `${import.meta.env.VITE_SCIENTIA_URL}/login?sso_return=${encodeURIComponent(returnUrl)}`;
  };

  // ── Styles ─────────────────────────────────────────────────────────────────

  const tabStyle = (active) => ({
    flex: 1,
    padding: '10px',
    background: active ? 'var(--accent, #6366f1)' : 'transparent',
    border: 'none',
    borderRadius: 10,
    color: active ? '#fff' : 'var(--muted, #64748b)',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg, #050915)',
      }}>
        <div style={{
          width: 40, height: 40,
          borderRadius: '50%',
          border: '3px solid rgba(99,102,241,0.2)',
          borderTopColor: '#6366f1',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg, #050915)',
      padding: '20px',
      fontFamily: 'DM Sans, sans-serif',
    }}>

      {/* Background orbs */}
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute', width: 500, height: 500,
          borderRadius: '50%', top: '-100px', left: '-100px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400,
          borderRadius: '50%', bottom: '-80px', right: '-80px',
          background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
      </div>

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 420,
        background: 'var(--surface, #0d1425)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 24,
        padding: '36px 32px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
      }}>

        {/* Logo + Title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 28, fontWeight: 800,
            background: 'linear-gradient(135deg,#818cf8,#fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 6,
          }}>
            Vidyastra
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted, #64748b)', margin: 0 }}>
            {mode === 'login' && 'Welcome back'}
            {mode === 'register' && 'Create your account'}
            {mode === 'magic' && 'Sign in without a password'}
          </p>
        </div>

        {/* Continue with Scientia — top CTA */}
        <button
          onClick={handleScientiaSSO}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: 20,
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.35)',
            borderRadius: 12,
            color: '#818cf8',
            fontSize: 14, fontWeight: 600,
            fontFamily: 'DM Sans, sans-serif',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(99,102,241,0.18)';
            e.currentTarget.style.borderColor = '#6366f1';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(99,102,241,0.1)';
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)';
          }}
        >
          <span style={{
            width: 20, height: 20, borderRadius: 6,
            background: 'linear-gradient(135deg,#6366f1,#a78bfa)',
            display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 11,
            fontWeight: 800, color: '#fff',
          }}>S</span>
          Continue with Scientia
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: 12, marginBottom: 20,
        }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontSize: 12, color: 'var(--muted, #64748b)' }}>or continue with email</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Mode Tabs */}
        <div style={{
          display: 'flex', gap: 4,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 12, padding: 4,
          marginBottom: 24,
        }}>
          <button style={tabStyle(mode === 'login')} onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
            Login
          </button>
          <button style={tabStyle(mode === 'register')} onClick={() => { setMode('register'); setError(''); setSuccess(''); }}>
            Register
          </button>
          <button style={tabStyle(mode === 'magic')} onClick={() => { setMode('magic'); setError(''); setSuccess(''); }}>
            Magic Link
          </button>
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 10, marginBottom: 16,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#f87171', fontSize: 13,
          }}>
            ⚠ {error}
          </div>
        )}
        {success && (
          <div style={{
            padding: '10px 14px', borderRadius: 10, marginBottom: 16,
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            color: '#34d399', fontSize: 13,
          }}>
            ✓ {success}
          </div>
        )}

        {/* ── LOGIN FORM ── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={submitting}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !email || !password}
              style={{
                width: '100%', padding: '13px',
                background: '#6366f1', border: 'none',
                borderRadius: 12, color: '#fff',
                fontSize: 14, fontWeight: 600,
                fontFamily: 'Syne, sans-serif',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                transition: 'all 0.2s',
                marginTop: 4,
              }}
            >
              {submitting ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        )}

        {/* ── REGISTER FORM ── */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={submitting}
            />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={submitting}
            />
            <Input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !email || !password || !name}
              style={{
                width: '100%', padding: '13px',
                background: '#6366f1', border: 'none',
                borderRadius: 12, color: '#fff',
                fontSize: 14, fontWeight: 600,
                fontFamily: 'Syne, sans-serif',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                transition: 'all 0.2s',
                marginTop: 4,
              }}
            >
              {submitting ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>
        )}

        {/* ── MAGIC LINK FORM ── */}
        {mode === 'magic' && (
          <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--muted, #64748b)', margin: '0 0 4px' }}>
              Enter your email and we'll send you a one-click sign-in link. No password needed.
            </p>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !email}
              style={{
                width: '100%', padding: '13px',
                background: '#6366f1', border: 'none',
                borderRadius: 12, color: '#fff',
                fontSize: 14, fontWeight: 600,
                fontFamily: 'Syne, sans-serif',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                transition: 'all 0.2s',
                marginTop: 4,
              }}
            >
              {submitting ? 'Sending…' : '✉ Send Magic Link'}
            </button>
          </form>
        )}

        {/* Guest Mode Button */}
        <button
          onClick={handleGuest}
          style={{
            width: '100%', padding: '12px',
            marginTop: 16,
            background: 'transparent',
            border: '1px dashed rgba(99,102,241,0.25)',
            borderRadius: 12,
            color: 'var(--muted, #64748b)',
            fontSize: 13, fontWeight: 500,
            fontFamily: 'DM Sans, sans-serif',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
            e.currentTarget.style.color = '#818cf8';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)';
            e.currentTarget.style.color = 'var(--muted, #64748b)';
          }}
        >
          Continue as Guest · 20 free questions
        </button>

        {/* Footer note */}
        <p style={{
          textAlign: 'center', marginTop: 20, marginBottom: 0,
          fontSize: 11, color: 'rgba(100,116,139,0.6)',
          lineHeight: 1.6,
        }}>
          By continuing you agree to our terms.
          <br />
          Scientia users get unlimited access automatically.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #475569; }
      `}</style>
    </div>
  );
}