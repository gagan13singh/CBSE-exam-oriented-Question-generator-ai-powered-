/**
 * src/components/PracticeResult.jsx
 * Mobile responsive update — all logic UNCHANGED
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const MD = ({ children }) => (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {String(children || '')}
    </ReactMarkdown>
);

const PracticeResult = ({ resultData, onRetry }) => {
    const { total_score, max_total_score, overall_feedback, results } = resultData;
    const percentage = Math.round((total_score / max_total_score) * 100) || 0;

    let gradeColor = '#ef4444';
    let gradeBg = 'rgba(239,68,68,.12)';
    let gradeBorder = 'rgba(239,68,68,.3)';
    let gradeBadge = 'Needs Work';
    let gradeLetter = 'D';

    if (percentage >= 90) {
        gradeColor = '#10b981'; gradeBg = 'rgba(16,185,129,.12)'; gradeBorder = 'rgba(16,185,129,.3)';
        gradeBadge = 'Excellent'; gradeLetter = 'A+';
    } else if (percentage >= 80) {
        gradeColor = '#34d399'; gradeBg = 'rgba(52,211,153,.12)'; gradeBorder = 'rgba(52,211,153,.3)';
        gradeBadge = 'Very Good'; gradeLetter = 'A';
    } else if (percentage >= 60) {
        gradeColor = '#60a5fa'; gradeBg = 'rgba(96,165,250,.12)'; gradeBorder = 'rgba(96,165,250,.3)';
        gradeBadge = 'Good'; gradeLetter = 'B';
    } else if (percentage >= 40) {
        gradeColor = '#fbbf24'; gradeBg = 'rgba(251,191,36,.12)'; gradeBorder = 'rgba(251,191,36,.3)';
        gradeBadge = 'Fair'; gradeLetter = 'C';
    }

    const circumference = 2 * Math.PI * 52;
    const dashOffset = circumference - (percentage / 100) * circumference;

    return (
        <div style={{ animation: 'revealUp .5s cubic-bezier(.22,1,.36,1) both', paddingBottom: 80 }}>

            {/* ══ Score Card ══ */}
            <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '28px 20px',
                marginBottom: 24,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: `linear-gradient(90deg, var(--accent), ${gradeColor})`,
                }} />

                <h2 style={{
                    fontFamily: 'Syne, sans-serif',
                    fontSize: 22, fontWeight: 700,
                    color: 'var(--text)', marginBottom: 6,
                }}>
                    Test Results
                </h2>

                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    background: 'rgba(245,158,11,.08)',
                    border: '1px solid rgba(245,158,11,.2)',
                    borderRadius: 10, padding: '6px 12px',
                    fontSize: 12, color: '#d4a017',
                    marginBottom: 24,
                }}>
                    ⚠ Results are AI-generated and strictly estimated
                </div>

                {/* Score ring */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                    <div style={{ position: 'relative', width: 130, height: 130 }}>
                        <svg width="130" height="130" viewBox="0 0 140 140">
                            <circle cx="70" cy="70" r="52" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="8" />
                            <circle
                                cx="70" cy="70" r="52"
                                fill="none"
                                stroke={gradeColor}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={dashOffset}
                                transform="rotate(-90 70 70)"
                                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)', filter: `drop-shadow(0 0 6px ${gradeColor}60)` }}
                            />
                        </svg>
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <span style={{
                                fontFamily: 'Syne, sans-serif',
                                fontSize: 32, fontWeight: 800, lineHeight: 1,
                                color: gradeColor,
                            }}>
                                {total_score}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, marginTop: 2 }}>
                                / {max_total_score} marks
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <span style={{
                        display: 'inline-block',
                        padding: '5px 18px',
                        borderRadius: 20,
                        fontWeight: 600, fontSize: 13,
                        background: gradeBg,
                        border: `1px solid ${gradeBorder}`,
                        color: gradeColor,
                    }}>
                        {gradeLetter} — {percentage}% ({gradeBadge})
                    </span>
                </div>

                {overall_feedback && (
                    <p style={{
                        fontSize: 13.5, color: 'var(--muted)',
                        fontStyle: 'italic', lineHeight: 1.65,
                        maxWidth: 500, margin: '0 auto 22px',
                    }}>
                        "{overall_feedback}"
                    </p>
                )}

                <button onClick={onRetry} className="btn-generate" style={{ width: 'auto', padding: '12px 32px' }}>
                    <div className="btn-shine" />
                    Try Another Test
                </button>
            </div>

            {/* ══ Detailed Analysis ══ */}
            <div>
                <h3 style={{
                    fontFamily: 'Syne, sans-serif',
                    fontSize: 18, fontWeight: 700,
                    color: 'var(--text)', marginBottom: 16,
                }}>
                    Detailed Analysis
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {results?.map((item, idx) => {
                        const full = item.marks_awarded === item.max_marks;
                        const partial = item.marks_awarded > 0 && !full;
                        const zero = item.marks_awarded === 0;

                        const statusColor = full ? '#10b981' : partial ? '#fbbf24' : '#ef4444';
                        const statusBg = full ? 'rgba(16,185,129,.1)' : partial ? 'rgba(245,158,11,.1)' : 'rgba(239,68,68,.1)';
                        const statusBorder = full ? 'rgba(16,185,129,.25)' : partial ? 'rgba(245,158,11,.25)' : 'rgba(239,68,68,.25)';
                        const statusLabel = full ? '✓ Full marks' : partial ? '~ Partial' : '✗ Incorrect';

                        return (
                            <div key={idx} style={{
                                background: 'var(--surface)',
                                border: `1px solid ${statusBorder}`,
                                borderRadius: 16,
                                overflow: 'hidden',
                            }}>
                                {/* Question header */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 16px',
                                    borderBottom: '1px solid var(--border)',
                                    flexWrap: 'wrap',
                                    gap: 8,
                                }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                        Question {idx + 1}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{
                                            padding: '2px 9px',
                                            borderRadius: 20,
                                            fontSize: 11, fontWeight: 600,
                                            background: statusBg,
                                            border: `1px solid ${statusBorder}`,
                                            color: statusColor,
                                        }}>
                                            {statusLabel}
                                        </span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: statusColor }}>
                                            {item.marks_awarded} / {item.max_marks}
                                        </span>
                                    </div>
                                </div>

                                {/* Answer comparison — stacks on mobile */}
                                <div className="result-answer-grid">
                                    {/* Student answer */}
                                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{
                                            fontSize: 10.5, fontWeight: 600,
                                            textTransform: 'uppercase', letterSpacing: '.07em',
                                            color: 'var(--muted)', marginBottom: 8,
                                        }}>
                                            Your answer
                                        </div>
                                        <div style={{
                                            fontSize: 13, lineHeight: 1.65,
                                            color: zero ? 'rgba(239,68,68,.7)' : '#94a3b8',
                                            fontStyle: !item.student_answer ? 'italic' : 'normal',
                                        }}>
                                            {item.student_answer || 'No answer provided'}
                                        </div>
                                    </div>

                                    {/* Model answer */}
                                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{
                                            fontSize: 10.5, fontWeight: 600,
                                            textTransform: 'uppercase', letterSpacing: '.07em',
                                            color: '#10b981', marginBottom: 8,
                                        }}>
                                            Model answer
                                        </div>
                                        <div style={{ fontSize: 13, lineHeight: 1.65, color: '#a7f3d0' }}>
                                            <MD>{item.model_answer || 'See textbook.'}</MD>
                                        </div>
                                    </div>
                                </div>

                                {/* Feedback strip */}
                                {item.feedback && (
                                    <div style={{
                                        padding: '10px 16px',
                                        background: 'rgba(99,102,241,.04)',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 8,
                                    }}>
                                        <span style={{ color: 'var(--accent2)', fontSize: 14, flexShrink: 0, marginTop: 1 }}>💡</span>
                                        <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                                            {item.feedback}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PracticeResult;