/**
 * client/src/components/DoubtPanel.jsx
 *
 * Contextual doubt engine panel — rendered below QuestionCard.
 * Receives question context as props (subject, chapter, topic,
 * studentClass, questionText) and maintains a local chat history.
 *
 * Usage in App.jsx (below <QuestionCard .../>):
 *   <DoubtPanel
 *     questionText={currentQ?.question}
 *     subject={lastGenMeta?.subject}
 *     chapter={lastGenMeta?.chapter}
 *     topic={currentQ?.topic}
 *     studentClass={formData?.class}
 *   />
 */

import React, { useState, useRef, useEffect } from 'react';
import { ENDPOINTS } from '../config';

// ── Minimal inline markdown renderer (no extra deps) ──────────────────────────
// Handles **bold**, `code`, and line breaks. LaTeX left as-is for KaTeX upstream.
function InlineMarkdown({ text }) {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i}>{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                    return (
                        <code key={i} style={{
                            background: 'rgba(99,102,241,0.15)',
                            padding: '1px 5px', borderRadius: 4,
                            fontFamily: 'monospace', fontSize: '0.92em',
                        }}>{part.slice(1, -1)}</code>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </>
    );
}

// ── Bubble component ──────────────────────────────────────────────────────────
function Bubble({ role, text }) {
    const isStudent = role === 'student';
    return (
        <div style={{
            display: 'flex',
            justifyContent: isStudent ? 'flex-end' : 'flex-start',
            marginBottom: 10,
        }}>
            {!isStudent && (
                <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#6366f1,#a78bfa)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, flexShrink: 0, marginRight: 8, marginTop: 2,
                }}>🎓</div>
            )}
            <div style={{
                maxWidth: '78%',
                padding: '10px 14px',
                borderRadius: isStudent ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: isStudent
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2))'
                    : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isStudent ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`,
                fontSize: 13.5,
                lineHeight: 1.65,
                color: isStudent ? '#c7d2fe' : '#e2e8f0',
                fontFamily: 'DM Sans, sans-serif',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
            }}>
                <InlineMarkdown text={text} />
            </div>
        </div>
    );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg,#6366f1,#a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, flexShrink: 0,
            }}>🎓</div>
            <div style={{
                display: 'flex', gap: 4, alignItems: 'center',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px 16px 16px 4px',
            }}>
                {[0, 1, 2].map(i => (
                    <div key={i} style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: 'var(--accent2, #a78bfa)',
                        animation: `doubtDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                ))}
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DoubtPanel({ questionText, subject, chapter, topic, studentClass }) {
    const [open,    setOpen]    = useState(false);
    const [input,   setInput]   = useState('');
    const [history, setHistory] = useState([]);   // [{ role, text }]
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState('');
    const bottomRef = useRef(null);
    const inputRef  = useRef(null);

    // Auto-scroll to bottom when new message arrives
    useEffect(() => {
        if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, loading, open]);

    // Focus input when panel opens
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 150);
    }, [open]);

    // Reset when the question changes (new generation)
    useEffect(() => {
        setHistory([]);
        setError('');
        setInput('');
    }, [questionText]);

    const sendDoubt = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const studentMsg = { role: 'student', text: trimmed };
        setHistory(h => [...h, studentMsg]);
        setInput('');
        setLoading(true);
        setError('');

        try {
            const res = await fetch(ENDPOINTS.askDoubt, {
                method : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body   : JSON.stringify({
                    doubt       : trimmed,
                    questionText: questionText || '',
                    subject     : subject      || '',
                    chapter     : chapter      || '',
                    topic       : topic        || '',
                    studentClass: studentClass || '',
                    history     : history,         // send existing history for context
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Tutor could not answer. Please try again.');

            setHistory(h => [...h, { role: 'tutor', text: data.reply }]);
        } catch (err) {
            setError(err.message || 'Something went wrong.');
            // Remove the student message on error so they can retry
            setHistory(h => h.slice(0, -1));
            setInput(trimmed);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendDoubt();
        }
    };

    const clearChat = () => {
        setHistory([]);
        setError('');
        setInput('');
    };

    return (
        <>
            {/* ── Keyframe for typing dots ── */}
            <style>{`
                @keyframes doubtDot {
                    0%, 60%, 100% { transform: translateY(0); opacity: .4; }
                    30%           { transform: translateY(-5px); opacity: 1; }
                }
                .doubt-send-btn:hover { background: rgba(99,102,241,0.25) !important; }
                .doubt-send-btn:disabled { opacity: .4; cursor: not-allowed; }
                .doubt-toggle:hover { border-color: rgba(99,102,241,0.5) !important; }
            `}</style>

            {/* ── Toggle button ── */}
            {!open && (
                <button
                    className="doubt-toggle"
                    onClick={() => setOpen(true)}
                    style={{
                        width: '100%', marginTop: 12,
                        padding: '11px 16px',
                        background: 'rgba(99,102,241,0.07)',
                        border: '1px dashed rgba(99,102,241,0.3)',
                        borderRadius: 12,
                        color: 'var(--accent2, #a78bfa)',
                        fontSize: 13.5, fontWeight: 500,
                        fontFamily: 'DM Sans, sans-serif',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'all .2s',
                    }}
                >
                    🤔 Ask a Doubt about this Question
                </button>
            )}

            {/* ── Expanded panel ── */}
            {open && (
                <div style={{
                    marginTop: 12,
                    borderRadius: 14,
                    border: '1px solid rgba(99,102,241,0.25)',
                    background: 'rgba(5,9,21,0.6)',
                    overflow: 'hidden',
                    animation: 'revealUp .3s cubic-bezier(.22,1,.36,1) both',
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(99,102,241,0.15)',
                        background: 'rgba(99,102,241,0.06)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 16 }}>🎓</span>
                            <span style={{
                                fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700,
                                color: 'var(--text)',
                            }}>Doubt Engine</span>
                            {(subject || chapter) && (
                                <span style={{
                                    fontSize: 11, fontWeight: 500,
                                    padding: '2px 9px', borderRadius: 20,
                                    background: 'rgba(99,102,241,0.12)',
                                    border: '1px solid rgba(99,102,241,0.2)',
                                    color: 'var(--accent2)',
                                }}>
                                    {subject}{chapter ? ` · ${chapter}` : ''}
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {history.length > 0 && (
                                <button onClick={clearChat} style={{
                                    padding: '4px 10px', borderRadius: 7,
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'var(--muted)', fontSize: 11, cursor: 'pointer',
                                    fontFamily: 'DM Sans, sans-serif',
                                }}>Clear</button>
                            )}
                            <button onClick={() => setOpen(false)} style={{
                                padding: '4px 10px', borderRadius: 7,
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'var(--muted)', fontSize: 11, cursor: 'pointer',
                                fontFamily: 'DM Sans, sans-serif',
                            }}>✕ Close</button>
                        </div>
                    </div>

                    {/* Chat area */}
                    <div style={{
                        height: 280,
                        overflowY: 'auto',
                        padding: '16px 16px 8px',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(99,102,241,0.3) transparent',
                    }}>
                        {history.length === 0 && !loading && (
                            <div style={{
                                textAlign: 'center', paddingTop: 60,
                                color: 'var(--muted)', fontSize: 13,
                                fontFamily: 'DM Sans, sans-serif',
                            }}>
                                <div style={{ fontSize: 28, marginBottom: 10 }}>🤔</div>
                                <div>Ask anything about this question —</div>
                                <div style={{ marginTop: 4, color: 'rgba(148,163,184,0.6)', fontSize: 12 }}>
                                    concept, formula, step-by-step, or why the answer is correct
                                </div>
                            </div>
                        )}

                        {history.map((msg, i) => (
                            <Bubble key={i} role={msg.role} text={msg.text} />
                        ))}

                        {loading && <TypingDots />}

                        {error && (
                            <div style={{
                                padding: '8px 12px', borderRadius: 10, marginBottom: 8,
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                color: '#f87171', fontSize: 12.5,
                                fontFamily: 'DM Sans, sans-serif',
                            }}>
                                ⚠ {error}
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* Input row */}
                    <div style={{
                        display: 'flex', gap: 8,
                        padding: '10px 12px',
                        borderTop: '1px solid rgba(99,102,241,0.15)',
                        background: 'rgba(0,0,0,0.2)',
                    }}>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Type your doubt… (Enter to send, Shift+Enter for new line)"
                            rows={1}
                            style={{
                                flex: 1,
                                resize: 'none',
                                padding: '9px 12px',
                                borderRadius: 10,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(99,102,241,0.2)',
                                color: 'var(--text)',
                                fontSize: 13.5,
                                fontFamily: 'DM Sans, sans-serif',
                                outline: 'none',
                                lineHeight: 1.5,
                                minHeight: 40, maxHeight: 100,
                                overflowY: 'auto',
                            }}
                            onInput={e => {
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                            }}
                        />
                        <button
                            className="doubt-send-btn"
                            onClick={sendDoubt}
                            disabled={!input.trim() || loading}
                            style={{
                                padding: '9px 16px',
                                borderRadius: 10,
                                background: 'rgba(99,102,241,0.15)',
                                border: '1px solid rgba(99,102,241,0.3)',
                                color: 'var(--accent2)',
                                fontSize: 18,
                                cursor: 'pointer',
                                transition: 'all .18s',
                                flexShrink: 0,
                                alignSelf: 'flex-end',
                            }}
                            title="Send (Enter)"
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}