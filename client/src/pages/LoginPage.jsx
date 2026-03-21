import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/* ── Starfield canvas ──────────────────────────────────────────────────────── */
function LoginStarfield() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [], shooting = [], animId, t = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = [];
      const n = Math.floor((canvas.width * canvas.height) / 5000);
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * canvas.width, y: Math.random() * canvas.height,
          r: Math.random() * 1.1 + 0.2, base: Math.random() * 0.5 + 0.1,
          spd: Math.random() * 0.04 + 0.01, tw: Math.random() * 0.018 + 0.004,
          off: Math.random() * Math.PI * 2,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01;
      stars.forEach(s => {
        const a = s.base + Math.sin(t * s.tw * 60 + s.off) * 0.12;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,210,255,${Math.max(0, Math.min(1, a))})`; ctx.fill();
        s.y -= s.spd; if (s.y < 0) { s.y = canvas.height; s.x = Math.random() * canvas.width; }
      });
      if (shooting.length < 3 && Math.random() < 0.003) {
        shooting.push({ x: Math.random() * canvas.width * 0.7, y: Math.random() * canvas.height * 0.35,
          dx: 4 + Math.random() * 5, dy: 1.5 + Math.random() * 3, len: 0,
          maxLen: 90 + Math.random() * 110, alpha: 1, growing: true });
      }
      shooting = shooting.filter(s => s.alpha > 0.02);
      shooting.forEach(s => {
        if (s.growing) { s.len += s.dx * 0.7; if (s.len >= s.maxLen) s.growing = false; }
        else s.alpha -= 0.035;
        s.x += s.dx * 0.4; s.y += s.dy * 0.4;
        const ang = Math.atan2(s.dy, s.dx);
        const x0 = s.x - Math.cos(ang) * s.len, y0 = s.y - Math.sin(ang) * s.len;
        const g = ctx.createLinearGradient(x0, y0, s.x, s.y);
        g.addColorStop(0, 'rgba(200,210,255,0)'); g.addColorStop(1, `rgba(200,210,255,${s.alpha * 0.75})`);
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.stroke();
      });
      animId = requestAnimationFrame(draw);
    }

    resize(); window.addEventListener('resize', resize); draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

/* ── Input ─────────────────────────────────────────────────────────────────── */
function Input({ type = 'text', placeholder, value, onChange, disabled }) {
  return (
    <input
      type={type} placeholder={placeholder} value={value}
      onChange={onChange} disabled={disabled}
      style={{
        width: '100%', padding: '12px 16px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(99,102,241,0.25)', borderRadius: 11,
        color: '#e2e8f0', fontSize: 14, fontFamily: 'DM Sans, sans-serif',
        outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s, box-shadow .2s',
      }}
      onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.14)'; }}
      onBlur={e =>  { e.target.style.borderColor = 'rgba(99,102,241,0.25)'; e.target.style.boxShadow = 'none'; }}
    />
  );
}

/* ── SubmitBtn ─────────────────────────────────────────────────────────────── */
function SubmitBtn({ disabled, children }) {
  return (
    <button type="submit" disabled={disabled} style={{
      width: '100%', padding: '13px', marginTop: 4,
      background: disabled ? 'rgba(99,102,241,0.5)' : '#6366f1',
      border: 'none', borderRadius: 12, color: '#fff',
      fontSize: 14, fontWeight: 600, fontFamily: 'Syne, sans-serif',
      cursor: disabled ? 'not-allowed' : 'pointer',
      position: 'relative', overflow: 'hidden',
      transition: 'all .2s',
      boxShadow: disabled ? 'none' : '0 6px 22px rgba(99,102,241,0.35)',
    }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(99,102,241,0.5)'; }}}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = disabled ? 'none' : '0 6px 22px rgba(99,102,241,0.35)'; }}
    >
      <span style={{ position: 'absolute', top: 0, left: '-110%', width: '100%', height: '100%',
        background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent)',
        animation: 'lp-shine 3.5s ease-in-out infinite 1s', pointerEvents: 'none' }} />
      {children}
    </button>
  );
}

function Spinner({ text }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
      <span style={{ width: 14, height: 14, borderRadius: '50%',
        border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff',
        display: 'inline-block', animation: 'lp-spin .7s linear infinite' }} />
      {text}
    </span>
  );
}

/* ── Main LoginPage ────────────────────────────────────────────────────────── */
export default function LoginPage({ onBack, onSuccess }) {
  // Pull auth actions — but DO NOT watch isGuest/isLoggedIn to auto-dismiss.
  // Only explicit user actions (login, register, guest button) call onSuccess.
  const { signIn, signUp, signInWithMagicLink, initGuestMode, loading } = useAuth();

  const [mode,       setMode]       = useState('login');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [name,       setName]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  // Clear error (but NOT success) on mode switch so register success message survives
  useEffect(() => { setError(''); }, [mode]);

  const [showResend, setShowResend] = useState(false);
  const [resending,  setResending]  = useState(false);

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setShowResend(false);
    setSubmitting(true);
    try {
      await signIn(email, password);
      window.history.pushState({}, '', '/');
      onSuccess?.();
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('email not confirmed') || msg.includes('invalid login credentials')) {
        setError('Email not confirmed yet — check your inbox and click the confirmation link first.');
        setShowResend(true);
      } else {
        setError(parseAuthError(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Resend confirmation email ───────────────────────────────────────────────
  const handleResend = async () => {
    if (!email) { setError('Enter your email address above first.'); return; }
    setResending(true);
    try {
      const { supabase: sb, supabaseAvailable } = await import('../context/AuthContext');
      if (!supabaseAvailable || !sb) throw new Error('Supabase not configured');
      const { error } = await sb.auth.resend({ type: 'signup', email });
      if (error) throw error;
      setSuccess('Confirmation email resent! Check your inbox (and spam folder).');
      setShowResend(false);
    } catch (err) {
      setError('Could not resend: ' + (err.message || 'Try again.'));
    } finally {
      setResending(false);
    }
  };

  // ── Smart error parser ─────────────────────────────────────────────────────
  const parseAuthError = (err) => {
    const msg = (err.message || '').toLowerCase();
    if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('over_email_send_rate_limit'))
      return '⏳ Too many attempts — Supabase allows only 2 emails/hour on free plan. Wait a bit and try again, or use password login instead.';
    if (msg.includes('email not confirmed'))
      return 'Please confirm your email first — check your inbox for the confirmation link.';
    if (msg.includes('invalid login credentials') || msg.includes('invalid credentials'))
      return 'Incorrect email or password. Double-check and try again.';
    if (msg.includes('user already registered') || msg.includes('already been registered'))
      return 'This email is already registered. Try logging in instead.';
    if (msg.includes('password') && msg.includes('least'))
      return 'Password must be at least 6 characters.';
    if (msg.includes('network') || msg.includes('fetch'))
      return 'Network error — check your internet connection and try again.';
    return err.message || 'Something went wrong. Please try again.';
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signUp(email, password, name);
      setPassword('');
      setName('');
      setSuccess('✅ Account created! Check your email to confirm, then sign in below.');
      setMode('login');
    } catch (err) {
      setError(parseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Magic link ─────────────────────────────────────────────────────────────
  const handleMagicLink = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signInWithMagicLink(email);
      setSuccess('✅ Magic link sent! Check your inbox (and spam folder). Link expires in 1 hour.');
    } catch (err) {
      setError(parseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Guest ──────────────────────────────────────────────────────────────────
  const handleGuest = () => {
    initGuestMode();                           // sync, sets isGuest=true in context
    window.history.pushState({}, '', '/');
    onSuccess?.();                             // tells App.jsx to leave login mode
  };

  // ── Scientia SSO ───────────────────────────────────────────────────────────
  const handleScientiaSSO = () => {
    const ret = `${import.meta.env.VITE_VIDYASTRA_URL || window.location.origin}/`;
    const sci = import.meta.env.VITE_SCIENTIA_URL || 'https://scientia-lms.vercel.app';
    window.location.href = `${sci}/login?sso_return=${encodeURIComponent(ret)}`;
  };

  const tabStyle = (active) => ({
    flex: 1, padding: '10px', background: active ? '#6366f1' : 'transparent',
    border: 'none', borderRadius: 10, color: active ? '#fff' : '#64748b',
    fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer', transition: 'all .2s',
    boxShadow: active ? '0 4px 14px rgba(99,102,241,.35)' : 'none',
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050915' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(99,102,241,.2)', borderTopColor: '#6366f1', animation: 'lp-spin .8s linear infinite' }} />
        <style>{`@keyframes lp-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes lp-cardIn  { from { opacity:0; transform:translateY(28px) scale(.97); } to { opacity:1; transform:none; } }
        @keyframes lp-spin    { to { transform: rotate(360deg); } }
        @keyframes lp-shine   { 0%,100%{left:-110%} 35%{left:150%} }
        @keyframes lp-orbFloat {
          0%,100%{transform:translate(0,0) scale(1);opacity:0}
          8%{opacity:1} 50%{transform:translate(55px,-80px) scale(1.1)} 92%{opacity:1}
        }
        @keyframes lp-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        .lp-grid {
          position:fixed;inset:0;z-index:0;pointer-events:none;
          background-image:linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px);
          background-size:64px 64px;
          mask-image:radial-gradient(ellipse 80% 60% at 50% 40%,black 20%,transparent 100%);
          -webkit-mask-image:radial-gradient(ellipse 80% 60% at 50% 40%,black 20%,transparent 100%);
        }
        .lp-orb{position:fixed;border-radius:50%;filter:blur(90px);animation:lp-orbFloat linear infinite;pointer-events:none;}
        .lp-guest:hover{background:rgba(255,255,255,.07)!important;border-color:rgba(99,102,241,.5)!important;color:#818cf8!important;}
        .lp-sso:hover{background:rgba(99,102,241,.18)!important;border-color:#6366f1!important;}
        input::placeholder{color:#475569;}
      `}</style>

      <div style={{ position:'fixed', inset:0, background:'#050915', display:'flex', alignItems:'center',
        justifyContent:'center', padding:'20px', fontFamily:'DM Sans, sans-serif', zIndex:900, overflow:'hidden' }}>

        <LoginStarfield />
        <div className="lp-grid" />

        {/* Orbs */}
        <div className="lp-orb" style={{ width:650,height:650,background:'radial-gradient(circle,rgba(99,102,241,.12) 0%,transparent 70%)',top:-220,left:-220,animationDuration:'28s',zIndex:0 }} />
        <div className="lp-orb" style={{ width:520,height:520,background:'radial-gradient(circle,rgba(245,158,11,.08) 0%,transparent 70%)',top:'15%',right:-160,animationDuration:'35s',animationDelay:'-9s',zIndex:0 }} />
        <div className="lp-orb" style={{ width:440,height:440,background:'radial-gradient(circle,rgba(16,185,129,.07) 0%,transparent 70%)',bottom:'3%',left:'12%',animationDuration:'23s',animationDelay:'-16s',zIndex:0 }} />
        <div className="lp-orb" style={{ width:360,height:360,background:'radial-gradient(circle,rgba(139,92,246,.09) 0%,transparent 70%)',top:'40%',left:'42%',animationDuration:'40s',animationDelay:'-6s',zIndex:0 }} />

        {/* Card */}
        <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:420,
          background:'rgba(13,20,37,.80)', border:'1px solid rgba(99,102,241,.22)', borderRadius:24,
          padding:'36px 32px', backdropFilter:'blur(22px)', WebkitBackdropFilter:'blur(22px)',
          boxShadow:'0 24px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.06)',
          animation:'lp-cardIn .55s cubic-bezier(.22,1,.36,1) both' }}>

          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ marginBottom:12,
              filter:'drop-shadow(0 0 20px rgba(99,102,241,.6))' }}>
              <img
                src="/favicon.ico"
                alt="Vidyastra"
                width={58}
                height={58}
                style={{ borderRadius:15, display:'block', margin:'0 auto' }}
              />
            </div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:28, fontWeight:800,
              background:'linear-gradient(135deg,#818cf8,#fbbf24)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Vidyastra
            </div>
          </div>

          {/* Scientia SSO */}
          <button className="lp-sso" onClick={handleScientiaSSO} style={{
            width:'100%', padding:'12px', marginBottom:20,
            background:'rgba(99,102,241,.1)', border:'1px solid rgba(99,102,241,.35)',
            borderRadius:12, color:'#818cf8', fontSize:14, fontWeight:600,
            fontFamily:'DM Sans,sans-serif', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .2s' }}>
            <span style={{ width:20,height:20,borderRadius:6,background:'linear-gradient(135deg,#6366f1,#a78bfa)',
              display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff' }}>S</span>
            Continue with Scientia
          </button>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,.07)' }} />
            <span style={{ fontSize:12, color:'#64748b' }}>or continue with email</span>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,.07)' }} />
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,.04)',
            border:'1px solid rgba(99,102,241,.12)', borderRadius:12, padding:4, marginBottom:24 }}>
            <button style={tabStyle(mode==='login')}    onClick={() => setMode('login')}>Login</button>
            <button style={tabStyle(mode==='register')} onClick={() => setMode('register')}>Register</button>
            <button style={tabStyle(mode==='magic')}    onClick={() => setMode('magic')}>Magic Link</button>
          </div>

          {/* Banners */}
          {error && (
            <div style={{ marginBottom:16 }}>
              <div style={{ padding:'10px 14px', borderRadius:showResend ? '10px 10px 0 0' : 10,
                background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)',
                color:'#f87171', fontSize:13, display:'flex', gap:8 }}>
                <span>⚠</span>{error}
              </div>
              {showResend && (
                <button onClick={handleResend} disabled={resending} style={{
                  width:'100%', padding:'9px', borderRadius:'0 0 10px 10px',
                  background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.25)',
                  borderTop:'none', color:'#fca5a5', fontSize:12, fontWeight:600,
                  fontFamily:'DM Sans,sans-serif', cursor:'pointer', transition:'all .2s' }}>
                  {resending ? '⏳ Sending…' : '📧 Resend confirmation email'}
                </button>
              )}
            </div>
          )}
          {success && (
            <div style={{ padding:'10px 14px', borderRadius:10, marginBottom:16,
              background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.25)',
              color:'#34d399', fontSize:13 }}>
              {success}
            </div>
          )}

          {/* Login form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <Input type="email"    placeholder="Email address" value={email}    onChange={e=>setEmail(e.target.value)}    disabled={submitting} />
              <Input type="password" placeholder="Password"      value={password} onChange={e=>setPassword(e.target.value)} disabled={submitting} />
              <SubmitBtn disabled={submitting || !email || !password}>
                {submitting ? <Spinner text="Signing in…" /> : 'Sign In →'}
              </SubmitBtn>
            </form>
          )}

          {/* Register form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <Input type="text"     placeholder="Your name"              value={name}     onChange={e=>setName(e.target.value)}     disabled={submitting} />
              <Input type="email"    placeholder="Email address"          value={email}    onChange={e=>setEmail(e.target.value)}    disabled={submitting} />
              <Input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e=>setPassword(e.target.value)} disabled={submitting} />
              <SubmitBtn disabled={submitting || !email || !password || !name}>
                {submitting ? <Spinner text="Creating account…" /> : 'Create Account →'}
              </SubmitBtn>
            </form>
          )}

          {/* Magic link form */}
          {mode === 'magic' && (
            <form onSubmit={handleMagicLink} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <p style={{ fontSize:13, color:'#64748b', margin:'0 0 4px', lineHeight:1.55 }}>
                Enter your email and we'll send a one-click sign-in link.
              </p>
              <Input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} disabled={submitting} />
              <SubmitBtn disabled={submitting || !email}>
                {submitting ? <Spinner text="Sending…" /> : '✉ Send Magic Link'}
              </SubmitBtn>
            </form>
          )}

          {/* Guest button */}
          <button className="lp-guest" onClick={handleGuest} style={{
            width:'100%', padding:'12px', marginTop:16,
            background:'transparent', border:'1px dashed rgba(99,102,241,.3)',
            borderRadius:12, color:'#64748b', fontSize:13, fontWeight:500,
            fontFamily:'DM Sans,sans-serif', cursor:'pointer', transition:'all .2s' }}>
            👤 Continue as Guest · 20 free questions
          </button>

          <p style={{ textAlign:'center', marginTop:20, marginBottom:0,
            fontSize:11, color:'rgba(100,116,139,.6)', lineHeight:1.6 }}>
            By continuing you agree to our terms.<br />
            Scientia users get unlimited access automatically.
          </p>
        </div>

      </div>
    </>
  );
}