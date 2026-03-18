/**
 * client/src/App.jsx — MOBILE RESPONSIVE UPDATE
 * Added mobile bottom nav, responsive layouts, mobile-first approach
 * All logic and features UNCHANGED
 */
import React, { useState } from 'react';
import QuestionForm from './components/QuestionForm';
import QuestionCard from './components/QuestionCard';
import LoadingFact from './components/LoadingFact';
import PracticeConfig from './components/PracticeConfig';
import PracticeTestInterface from './components/PracticeTestInterface';
import PracticeResult from './components/PracticeResult';
import ModelBadge from './components/ModelBadge';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import SyllabusSection from './components/SyllabusSection';
import UploadPanel from './components/UploadPanel';
import { useHealth } from './hooks/useHealth';
import { ENDPOINTS } from './config';
import useProgressStore from './store/useProgressStore';

function App() {
  const health = useHealth();
  const addSession = useProgressStore(s => s.addSession);

  const [appMode, setAppMode] = useState('generator');

  // Generator State
  const [questionData, setQuestionData] = useState(null);
  const [questionMeta, setQuestionMeta] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingContext, setLoadingContext] = useState({ class: null, subject: null });
  const [animateQ1, setAnimateQ1] = useState(false);

  // Upload panel toggle (shown inside generator page)
  const [showUpload, setShowUpload] = useState(false);

  // Practice State
  const [practiceState, setPracticeState] = useState('config');
  const [practiceData, setPracticeData] = useState(null);
  const [practiceResult, setPracticeResult] = useState(null);
  const [lastPracticeConfig, setLastPracticeConfig] = useState(null);

  const generateQuestion = async (formData) => {
    setLoading(true);
    setLoadingContext({ class: formData.class, subject: formData.subject });
    setError('');
    setQuestionData(null);
    setQuestionMeta(null);
    setCurrentQuestionIndex(0);
    setAnimateQ1(false);

    try {
      const res = await fetch(ENDPOINTS.generateQuestions, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, topic: formData.topic || '' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to generate questions');
      setQuestionData(data.data);
      setQuestionMeta(data.meta);
      setAnimateQ1(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setLoadingContext({ class: null, subject: null });
    }
  };

  const generatePracticePaper = async (configData) => {
    setLoading(true);
    setLoadingContext({ class: configData.class, subject: configData.subject });
    setError('');
    setLastPracticeConfig(configData);
    try {
      const res = await fetch(ENDPOINTS.generatePaper, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to generate paper');
      setPracticeData(data.data);
      setPracticeState('test');
    } catch (err) {
      setError(err.message || 'Failed to create practice test.');
    } finally {
      setLoading(false);
      setLoadingContext({ class: null, subject: null });
    }
  };

  const submitPracticePaper = async (submissions) => {
    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.gradePaper, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissions }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to grade paper');
      setPracticeResult(data.data);
      setPracticeState('result');

      if (data.data?.results && lastPracticeConfig) {
        const results = data.data.results;
        const correct = results.filter(r => r.marks_awarded === r.max_marks).length;
        addSession({
          subject: lastPracticeConfig.subject || 'Unknown',
          chapter: Array.isArray(lastPracticeConfig.chapters)
            ? lastPracticeConfig.chapters[0]
            : lastPracticeConfig.chapters || 'Mixed',
          correct,
          total: results.length,
        });
      }
    } catch (err) {
      setError(err.message || 'Error submitting test.');
    } finally {
      setLoading(false);
    }
  };

  const resetPractice = () => {
    setPracticeState('config');
    setPracticeData(null);
    setPracticeResult(null);
    setError('');
  };

  const goTo = (idx) => {
    setAnimateQ1(false);
    setCurrentQuestionIndex(idx);
  };

  const questions = Array.isArray(questionData)
    ? questionData
    : questionData ? [questionData] : [];
  const currentQ = questions[currentQuestionIndex];

  const navItems = [
    { mode: 'generator', label: '⚡ Generator', icon: '⚡', shortLabel: 'Gen' },
    { mode: 'practice',  label: '📝 Practice',  icon: '📝', shortLabel: 'Test' },
    { mode: 'syllabus',  label: '📚 Syllabus',  icon: '📚', shortLabel: 'Syllabus' },
    { mode: 'dashboard', label: '📊 Dashboard', icon: '📊', shortLabel: 'Stats' },
    { mode: 'analytics', label: '📈 Analytics', icon: '📈', shortLabel: 'Charts' },
  ];

  const isFullWidth = appMode === 'dashboard' || appMode === 'analytics' || appMode === 'syllabus';

  return (
    <div className="app-wrapper">

      {/* ── DESKTOP NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.25rem', height: 64,
        background: 'rgba(5,9,21,0.85)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border, rgba(99,102,241,0.15))',
      }}>
        <span className="app-logo" style={{
          fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800,
          background: 'linear-gradient(135deg,#818cf8,#fbbf24)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          flexShrink: 0,
        }}>Vidyastra</span>

        {/* Desktop nav pills */}
        <div className="nav-pills-container desktop-nav-pills">
          {navItems.map(({ mode, label }) => (
            <button key={mode} onClick={() => setAppMode(mode)} style={{
              padding: '7px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 500, fontFamily: 'DM Sans, sans-serif',
              background: appMode === mode ? 'var(--accent, #6366f1)' : 'transparent',
              color: appMode === mode ? '#fff' : 'var(--muted, #64748b)',
              boxShadow: appMode === mode ? '0 4px 16px rgba(99,102,241,0.35)' : 'none',
              transition: 'all .2s',
              whiteSpace: 'nowrap',
            }}>{label}</button>
          ))}
        </div>

        <div style={{ flexShrink: 0 }}>
          <ModelBadge health={health} />
        </div>
      </nav>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mobile-bottom-nav">
        {navItems.map(({ mode, icon, shortLabel }) => (
          <button
            key={mode}
            className={`mobile-bottom-nav-item${appMode === mode ? ' active' : ''}`}
            onClick={() => setAppMode(mode)}
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{shortLabel}</span>
          </button>
        ))}
      </nav>

      {/* ── HERO (generator + practice only) ── */}
      {appMode !== 'dashboard' && appMode !== 'analytics' && appMode !== 'syllabus' && (
        <div className="hero-section">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px', borderRadius: 24, marginBottom: 16,
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.25)',
            fontSize: 11, fontWeight: 500, color: 'var(--accent2, #818cf8)',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fbbf24', display: 'inline-block' }} />
            CBSE Class 9–12 · AI-Powered · NCERT Aligned
          </div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 'clamp(26px,5vw,56px)',
            fontWeight: 800, lineHeight: 1.1,
            letterSpacing: '-0.04em', marginBottom: 12,
            color: 'var(--text, #e2e8f0)',
          }}>
            Master every chapter.<br />
            <span style={{
              background: 'linear-gradient(135deg,#6366f1 0%,#a78bfa 50%,#fbbf24 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Ace every exam.</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted, #64748b)' }}>
            Questions generated from NCERT textbooks by Groq AI.
          </p>
        </div>
      )}

      {/* ── MAIN ── */}
      <main style={{
        maxWidth: isFullWidth ? 960 : 1080,
        margin: '0 auto',
        padding: isFullWidth ? '20px 1.25rem 80px' : '0 1.25rem 80px',
        width: '100%',
      }}>

        {/* Error banner */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 12, padding: '13px 16px', marginBottom: 24,
          }}>
            <span style={{ color: '#ef4444', fontSize: 17, flexShrink: 0 }}>⚠</span>
            <p style={{ flex: 1, fontSize: 13.5, color: '#fca5a5', margin: 0 }}>{error}</p>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'var(--muted,#64748b)', cursor: 'pointer', fontSize: 18, flexShrink: 0 }}>✕</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              margin: '0 auto 20px',
              border: '2px solid rgba(99,102,241,0.15)',
              borderTopColor: 'var(--accent, #6366f1)',
              animation: 'spin .8s linear infinite',
            }} />
            <p style={{ color: 'var(--muted, #64748b)', fontSize: 14.5 }}>
              {appMode === 'practice' && practiceState === 'test'
                ? 'Grading your answers…'
                : 'AI is generating questions…'}
            </p>
            <div style={{ marginTop: 24 }}>
              <LoadingFact context={loadingContext} />
            </div>
          </div>
        )}

        {/* ── GENERATOR ── */}
        {!loading && appMode === 'generator' && (
          <div style={{ animation: 'revealUp .5s cubic-bezier(.22,1,.36,1) both' }}>

            {/* Upload toggle button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button
                onClick={() => setShowUpload(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 16px', borderRadius: 10,
                  border: `1px solid ${showUpload ? 'rgba(99,102,241,0.5)' : 'var(--border)'}`,
                  background: showUpload ? 'rgba(99,102,241,0.1)' : 'transparent',
                  color: showUpload ? 'var(--accent2)' : 'var(--muted)',
                  fontSize: 13, fontWeight: 500, fontFamily: 'DM Sans, sans-serif',
                  cursor: 'pointer', transition: 'all .2s',
                }}
              >
                <span>⬆️</span>
                <span className="hide-mobile">{showUpload ? 'Hide Upload Panel' : 'Upload PDF / Question'}</span>
                <span style={{ display: 'none' }} className="show-mobile">{showUpload ? 'Hide' : 'Upload'}</span>
              </button>
            </div>

            {/* Upload panel */}
            {showUpload && (
              <div style={{ marginBottom: 24, animation: 'revealUp .3s cubic-bezier(.22,1,.36,1) both' }}>
                <UploadPanel />
              </div>
            )}

            {/* Main generator layout */}
            <div className="generator-layout">

              {/* Form */}
              <div className="generator-form-sticky" style={{ position: 'sticky', top: 80 }}>
                <div className="p-card" style={{ padding: 24 }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 4, color: 'var(--text,#e2e8f0)' }}>
                    Configure question
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted,#64748b)', marginBottom: 20 }}>
                    Select subject and topic
                  </div>
                  <QuestionForm onSubmit={generateQuestion} isLoading={loading} />
                </div>
              </div>

              {/* Results */}
              <div>
                {!questionData && !error && (
                  <div style={{
                    border: '1.5px dashed rgba(99,102,241,0.2)',
                    borderRadius: 20, padding: '48px 28px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 44, marginBottom: 14 }}>🚀</div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text,#e2e8f0)' }}>
                      Ready when you are
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--muted,#64748b)' }}>
                      Configure parameters above and hit Generate.
                    </div>
                  </div>
                )}

                {questionData && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text,#e2e8f0)' }}>
                        Generated Questions
                      </div>
                      {questionMeta && (
                        <span style={{
                          padding: '3px 11px', borderRadius: 20, fontSize: 11.5, fontWeight: 500,
                          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                          color: 'var(--accent2,#818cf8)',
                        }}>
                          {currentQuestionIndex + 1}/{questions.length} · {questionMeta.provider === 'groq' ? '⚡' : '🐢'} {questionMeta.model}
                        </span>
                      )}
                    </div>

                    {currentQ && (
                      <QuestionCard
                        key={`${questionMeta?.generated_at}-${currentQuestionIndex}`}
                        data={currentQ}
                        index={currentQuestionIndex + 1}
                        animate={animateQ1 && currentQuestionIndex === 0}
                      />
                    )}

                    {questions.length > 1 && (
                      <div className="pagination-controls" style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', marginTop: 20, gap: 12,
                      }}>
                        <button className="btn-secondary" onClick={() => goTo(Math.max(0, currentQuestionIndex - 1))} disabled={currentQuestionIndex === 0}>← Prev</button>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                          {questions.map((_, i) => (
                            <div key={i} className={`page-dot${i === currentQuestionIndex ? ' active' : ''}`} onClick={() => goTo(i)} />
                          ))}
                        </div>
                        <button className="btn-secondary" onClick={() => goTo(Math.min(questions.length - 1, currentQuestionIndex + 1))} disabled={currentQuestionIndex === questions.length - 1}>Next →</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PRACTICE ── */}
        {!loading && appMode === 'practice' && (
          <div className="practice-config-wrapper" style={{ maxWidth: practiceState === 'test' ? '100%' : 680, margin: '0 auto' }}>
            {practiceState === 'config' && (
              <div className="p-card" style={{ padding: '28px 20px' }}>
                <PracticeConfig onSubmit={generatePracticePaper} isLoading={loading} />
              </div>
            )}
            {practiceState === 'test' && practiceData && (
              <PracticeTestInterface testData={practiceData} onSubmit={submitPracticePaper} onBack={resetPractice} />
            )}
            {practiceState === 'result' && practiceResult && (
              <PracticeResult resultData={practiceResult} onRetry={resetPractice} />
            )}
          </div>
        )}

        {/* ── SYLLABUS ── */}
        {!loading && appMode === 'syllabus' && (
          <div style={{ animation: 'revealUp .5s cubic-bezier(.22,1,.36,1) both' }}>
            <SyllabusSection />
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {!loading && appMode === 'analytics' && (
          <Analytics onNavigate={setAppMode} />
        )}

        {/* ── DASHBOARD ── */}
        {!loading && appMode === 'dashboard' && (
          <Dashboard onNavigate={setAppMode} />
        )}

      </main>

      {/* Footer */}
      <footer style={{
        padding: '14px 1.25rem',
        borderTop: '1px solid var(--border, rgba(99,102,241,0.15))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 11, color: 'var(--muted, #64748b)',
        flexWrap: 'wrap', gap: 6,
        marginBottom: '56px', // above mobile nav
      }}>
        <span>Vidyastra · AI PLATFORM</span>
        <span className="hide-mobile">Groq + NCERT RAG · Built by Gagandeep Singh</span>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:.35} }

        /* Show mobile text helpers */
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: inline !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default App;