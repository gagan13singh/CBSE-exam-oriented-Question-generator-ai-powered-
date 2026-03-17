/**
 * src/components/PracticeTestInterface.jsx
 * FIXES:
 *  1. Wider question column (flex:1), sidebar 260px fixed, timer right-aligned
 *  2. Navigator scrolls to question via refs
 *  3. Anti-cheat: tab switch / visibility change / blur auto-submits silently
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const MD = ({ children }) => (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {String(children || '')}
    </ReactMarkdown>
);

const PracticeTestInterface = ({ testData, onSubmit, onBack }) => {
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState((testData.time_allowed_mins || 30) * 60);
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [cheatWarning, setCheatWarning] = useState(null); // null | 'tab' | 'blur'
    const questionRefs = useRef({});
    const submitCalledRef = useRef(false); // prevent double-submit
    const answersRef = useRef({});    // always-fresh ref for async callbacks

    // Keep answersRef in sync
    useEffect(() => { answersRef.current = answers; }, [answers]);

    // ── Body scroll lock ──
    useEffect(() => {
        document.body.style.overflow = (showConfirmModal || submitting) ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showConfirmModal, submitting]);

    // ── Countdown ──
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { clearInterval(interval); silentSubmit('time'); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // ══════════════════════════════════════════════
    //  ANTI-CHEAT: visibility + blur detection
    // ══════════════════════════════════════════════
    useEffect(() => {
        let cheatTimeout = null;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Give 1.5s grace (could be a quick accidental switch)
                // then auto-submit
                cheatTimeout = setTimeout(() => {
                    silentSubmit('tab');
                }, 1500);
            } else {
                // Came back within grace — cancel
                if (cheatTimeout) clearTimeout(cheatTimeout);
            }
        };

        const handleBlur = () => {
            // Window lost focus (alt-tab, another app, screen share dialog)
            cheatTimeout = setTimeout(() => {
                silentSubmit('blur');
            }, 2000);
        };

        const handleFocus = () => {
            if (cheatTimeout) clearTimeout(cheatTimeout);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            if (cheatTimeout) clearTimeout(cheatTimeout);
        };
    }, []);

    // ── Build submissions from current answers ──
    const buildSubmissions = (currentAnswers) => {
        const subs = [];
        testData.sections.forEach(section => {
            section.questions.forEach(q => {
                const raw = currentAnswers[q.id] || '';
                subs.push({
                    question_id: q.id,
                    question: q.question,
                    question_type: q.type,
                    model_answer: q.model_answer || q.correct_option || q.explanation || 'N/A',
                    student_answer: raw.trim() || 'No answer provided.',
                    marks: q.marks,
                });
            });
        });
        return subs;
    };

    // ── Silent auto-submit (no modal, no warning) ──
    const silentSubmit = async (reason) => {
        if (submitCalledRef.current) return;
        submitCalledRef.current = true;
        setSubmitting(true);
        setShowConfirmModal(false);
        await onSubmit(buildSubmissions(answersRef.current));
        setSubmitting(false);
    };

    // ── Normal submit (user clicked button) ──
    const executeSubmit = async () => {
        if (submitCalledRef.current) return;
        submitCalledRef.current = true;
        setSubmitting(true);
        setShowConfirmModal(false);
        await onSubmit(buildSubmissions(answersRef.current));
        setSubmitting(false);
    };

    const formatTime = s => {
        const m = Math.floor(s / 60);
        return `${m}:${(s % 60 < 10 ? '0' : '') + (s % 60)}`;
    };

    const handleAnswerChange = (qId, val) =>
        setAnswers(prev => ({ ...prev, [qId]: val }));

    const scrollToQuestion = qId => {
        const el = questionRefs.current[qId];
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    let totalQ = 0;
    testData.sections.forEach(s => { totalQ += s.questions.length; });
    const answeredCount = Object.keys(answers).filter(k => answers[k]?.trim()).length;
    const progressPct = Math.round((answeredCount / totalQ) * 100) || 0;
    const timerDanger = timeLeft < 300;
    const timerColor = timeLeft < 120 ? '#ef4444' : timerDanger ? '#fbbf24' : 'var(--accent2)';

    const textareaBase = {
        width: '100%',
        padding: '12px 14px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid var(--border)',
        borderRadius: 11,
        color: '#e2e8f0',
        fontSize: 14,
        fontFamily: 'DM Sans, sans-serif',
        lineHeight: 1.65,
        resize: 'vertical',
        outline: 'none',
        transition: 'all .2s',
    };

    return (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', paddingBottom: 60, width: '100%' }}>

            {/* ══ LEFT: Questions (flex-1) ══ */}
            <div style={{ flex: 1, minWidth: 0 }}>

                {/* Paper header */}
                <div style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 16, padding: '16px 20px', marginBottom: 20,
                }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>
                        {testData.title || 'Practice Test'}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {totalQ} questions · {testData.time_allowed_mins || 30} min · CBSE pattern
                        <span style={{
                            padding: '1px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                            background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: '#ef4444',
                        }}>
                            🔒 Anti-cheat active
                        </span>
                    </div>
                </div>

                {/* Sections + Questions */}
                {testData.sections.map((section, sIdx) => (
                    <div key={sIdx} style={{ marginBottom: 28 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                            <div style={{
                                width: 30, height: 30, borderRadius: 8,
                                background: 'var(--accent)', color: '#fff',
                                fontSize: 12, fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                {section.name?.charAt(section.name.length - 1) || String.fromCharCode(65 + sIdx)}
                            </div>
                            <div>
                                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                                    {section.name}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                                    {section.questions.length} question{section.questions.length !== 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {section.questions.map((q, qIdx) => {
                                let gNum = qIdx + 1;
                                for (let si = 0; si < sIdx; si++) gNum += testData.sections[si].questions.length;
                                const answered = !!answers[q.id]?.trim();

                                return (
                                    <div
                                        key={q.id}
                                        ref={el => { questionRefs.current[q.id] = el; }}
                                        style={{
                                            background: 'var(--surface)',
                                            border: `1px solid ${answered ? 'rgba(99,102,241,.4)' : 'var(--border)'}`,
                                            borderRadius: 16, overflow: 'hidden',
                                            transition: 'border-color .2s',
                                            scrollMarginTop: 90,
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '12px 18px', borderBottom: '1px solid var(--border)',
                                            background: 'rgba(255,255,255,.02)',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{
                                                    width: 24, height: 24, borderRadius: '50%',
                                                    background: answered ? 'var(--accent)' : 'rgba(255,255,255,.08)',
                                                    color: answered ? '#fff' : 'var(--muted)',
                                                    fontSize: 11, fontWeight: 700,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>{gNum}</span>
                                                <span style={{
                                                    padding: '2px 9px', borderRadius: 20,
                                                    fontSize: 10.5, fontWeight: 600,
                                                    textTransform: 'uppercase', letterSpacing: '.06em',
                                                    background: q.type === 'MCQ' ? 'rgba(99,102,241,.14)' : 'rgba(16,185,129,.1)',
                                                    border: q.type === 'MCQ' ? '1px solid rgba(99,102,241,.3)' : '1px solid rgba(16,185,129,.25)',
                                                    color: q.type === 'MCQ' ? 'var(--accent2)' : '#34d399',
                                                }}>{q.type}</span>
                                            </div>
                                            <span style={{ fontSize: 12.5, color: 'var(--gold2)', fontWeight: 500 }}>
                                                {q.marks} mark{q.marks !== 1 ? 's' : ''}
                                            </span>
                                        </div>

                                        <div style={{ padding: '16px 18px', fontSize: 15, fontWeight: 500, lineHeight: 1.7, color: '#e2e8f0' }}>
                                            <MD>{q.question}</MD>
                                        </div>

                                        <div style={{ padding: '0 18px 18px' }}>
                                            {q.type === 'MCQ' && q.options ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    {q.options.map((opt, oi) => {
                                                        const sel = answers[q.id] === opt;
                                                        return (
                                                            <label key={oi} style={{
                                                                display: 'flex', alignItems: 'flex-start', gap: 11,
                                                                padding: '11px 14px', borderRadius: 11,
                                                                border: `1px solid ${sel ? 'rgba(99,102,241,.5)' : 'var(--border)'}`,
                                                                background: sel ? 'rgba(99,102,241,.1)' : 'rgba(255,255,255,.02)',
                                                                cursor: 'pointer', transition: 'all .18s',
                                                            }}>
                                                                <input
                                                                    type="radio" name={q.id} value={opt} checked={sel}
                                                                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                                                                    style={{ marginTop: 2, accentColor: 'var(--accent)', flexShrink: 0 }}
                                                                />
                                                                <span style={{ fontSize: 13.5, lineHeight: 1.55, color: sel ? '#c7d2fe' : '#94a3b8', fontWeight: sel ? 500 : 400 }}>
                                                                    <MD>{opt}</MD>
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <textarea
                                                    value={answers[q.id] || ''}
                                                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                                                    placeholder="Type your answer here…"
                                                    rows={q.marks >= 4 ? 5 : 3}
                                                    style={textareaBase}
                                                    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.14)'; e.target.style.background = 'rgba(255,255,255,.08)'; }}
                                                    onBlur={e => { e.target.style.borderColor = answered ? 'rgba(99,102,241,.4)' : 'var(--border)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,.06)'; }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* ══ RIGHT: Sidebar (260px sticky) ══ */}
            <div style={{
                width: 260, flexShrink: 0,
                position: 'sticky', top: 80,
                display: 'flex', flexDirection: 'column', gap: 12,
                maxHeight: 'calc(100vh - 100px)', overflowY: 'auto',
            }}>

                {/* Timer — right-aligned */}
                <div style={{
                    background: 'var(--surface)',
                    border: `1px solid ${timerDanger ? 'rgba(239,68,68,.4)' : 'var(--border)'}`,
                    borderRadius: 14, padding: '14px 18px',
                }}>
                    <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--muted)', marginBottom: 4, textAlign: 'right' }}>
                        Time Remaining
                    </div>
                    <div style={{
                        fontFamily: 'Syne,sans-serif', fontSize: 40, fontWeight: 800,
                        color: timerColor, lineHeight: 1, textAlign: 'right', letterSpacing: '-0.02em',
                        ...(timerDanger ? { animation: 'pulseDot 1s ease-in-out infinite' } : {}),
                    }}>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Progress */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>Progress</span>
                        <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{answeredCount}/{totalQ}</span>
                    </div>
                    <div className="prog-bar"><div className="prog-fill" style={{ width: `${progressPct}%` }} /></div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>{totalQ - answeredCount} remaining</div>
                </div>

                {/* Navigator */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Navigator</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
                        {(() => {
                            const btns = []; let n = 0;
                            testData.sections.forEach(section => {
                                section.questions.forEach(q => {
                                    n++;
                                    const done = !!answers[q.id]?.trim();
                                    btns.push(
                                        <button key={q.id} title={`Jump to Q${n}`} onClick={() => scrollToQuestion(q.id)} style={{
                                            width: '100%', aspectRatio: '1', borderRadius: 8,
                                            border: `1px solid ${done ? 'rgba(16,185,129,.45)' : 'var(--border)'}`,
                                            background: done ? 'rgba(16,185,129,.15)' : 'rgba(255,255,255,.04)',
                                            color: done ? '#10b981' : 'var(--muted)',
                                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                            transition: 'all .15s',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontFamily: 'DM Sans,sans-serif',
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent2)'; e.currentTarget.style.background = 'rgba(99,102,241,.18)'; e.currentTarget.style.color = 'var(--accent2)'; e.currentTarget.style.transform = 'scale(1.12)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = done ? 'rgba(16,185,129,.45)' : 'var(--border)'; e.currentTarget.style.background = done ? 'rgba(16,185,129,.15)' : 'rgba(255,255,255,.04)'; e.currentTarget.style.color = done ? '#10b981' : 'var(--muted)'; e.currentTarget.style.transform = ''; }}
                                        >{n}</button>
                                    );
                                });
                            });
                            return btns;
                        })()}
                    </div>
                    <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}>
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(16,185,129,.5)', display: 'inline-block' }} />Answered
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}>
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,.1)', display: 'inline-block' }} />Pending
                        </div>
                    </div>
                </div>

                <button onClick={() => setShowConfirmModal(true)} disabled={submitting} className="btn-generate">
                    <div className="btn-shine" />
                    {submitting ? 'Grading…' : `Submit (${answeredCount}/${totalQ})`}
                </button>
                <button onClick={onBack} className="btn-secondary" style={{ textAlign: 'center' }}>Cancel Test</button>
            </div>

            {/* ══ Confirm Modal ══ */}
            {showConfirmModal && createPortal(
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,9,21,0.85)', backdropFilter: 'blur(8px)', padding: 20 }}>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '32px 28px', maxWidth: 400, width: '100%', textAlign: 'center', animation: 'revealUp .35s cubic-bezier(.22,1,.36,1) both' }}>
                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 22 }}>⚠</div>
                        <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Submit Test?</h3>
                        {answeredCount < totalQ
                            ? <p style={{ fontSize: 13.5, color: '#fca5a5', marginBottom: 24 }}><strong>{totalQ - answeredCount} unanswered</strong> questions will get 0 marks.</p>
                            : <p style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 24 }}>All {totalQ} questions answered. Ready?</p>
                        }
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setShowConfirmModal(false)} className="btn-secondary" style={{ flex: 1 }}>Keep going</button>
                            <button onClick={executeSubmit} className="btn-generate" style={{ flex: 1 }}><div className="btn-shine" />Submit now</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ══ Grading overlay ══ */}
            {submitting && !showConfirmModal && createPortal(
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,9,21,0.92)', backdropFilter: 'blur(16px)' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', border: '3px solid rgba(99,102,241,.2)', borderTopColor: 'var(--accent)', animation: 'spin .8s linear infinite', marginBottom: 24 }} />
                    <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Grading your test…</h2>
                    <p style={{ fontSize: 14, color: 'var(--muted)' }}>AI examiner is reviewing your answers</p>
                </div>,
                document.body
            )}
        </div>
    );
};

export default PracticeTestInterface;