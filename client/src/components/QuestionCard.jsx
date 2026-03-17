/**
 * src/components/QuestionCard.jsx
 * Dark theme rewrite — all logic UNCHANGED
 */

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import StreamingText from './StreamingText';

const MD = ({ children }) => (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {String(children || '')}
    </ReactMarkdown>
);

const QuestionCard = ({ data, index, animate = false }) => {
    const cardRef = useRef();

    const handleDownload = async () => {
        const element = cardRef.current;
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#0d1425' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const w = pdf.internal.pageSize.getWidth();
        pdf.addImage(imgData, 'PNG', 0, 0, w, (canvas.height * w) / canvas.width);
        pdf.save(`CBSE_Q${index || 1}.pdf`);
    };

    // ── Colour helpers ──
    const typeColor = {
        'MCQ': { bg: 'rgba(99,102,241,.15)', border: 'rgba(99,102,241,.35)', text: '#818cf8' },
        'Numerical': { bg: 'rgba(16,185,129,.12)', border: 'rgba(16,185,129,.35)', text: '#34d399' },
        'HOTS': { bg: 'rgba(239,68,68,.12)', border: 'rgba(239,68,68,.35)', text: '#f87171' },
        'Case-Based': { bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.35)', text: '#fbbf24' },
        'Short Answer': { bg: 'rgba(59,130,246,.12)', border: 'rgba(59,130,246,.35)', text: '#60a5fa' },
        'Long Answer': { bg: 'rgba(139,92,246,.12)', border: 'rgba(139,92,246,.35)', text: '#a78bfa' },
        'Theoretical': { bg: 'rgba(20,184,166,.12)', border: 'rgba(20,184,166,.35)', text: '#2dd4bf' },
        'Graphical': { bg: 'rgba(236,72,153,.12)', border: 'rgba(236,72,153,.35)', text: '#f472b6' },
    };
    const tc = typeColor[data?.question_type] || typeColor['MCQ'];

    return (
        <div ref={cardRef} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            overflow: 'hidden',
            animation: animate ? 'revealUp .5s cubic-bezier(.22,1,.36,1) both' : 'none',
        }}>

            {/* ── Header ── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 24px',
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {index && (
                        <span style={{
                            width: 28, height: 28,
                            borderRadius: '50%',
                            background: 'var(--accent)',
                            color: '#fff',
                            fontSize: 12, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>Q{index}</span>
                    )}
                    <span style={{
                        padding: '3px 11px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '.07em',
                        background: tc.bg,
                        border: `1px solid ${tc.border}`,
                        color: tc.text,
                    }}>
                        {data?.question_type || 'Question'}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: 'var(--gold2)', fontWeight: 500 }}>
                        ★ {data?.marks || 1} mark{data?.marks !== 1 ? 's' : ''}
                    </span>
                    <button onClick={handleDownload} style={{
                        padding: '5px 12px',
                        background: 'rgba(255,255,255,.05)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        color: 'var(--muted)',
                        fontSize: 12, fontWeight: 500,
                        fontFamily: 'DM Sans, sans-serif',
                        cursor: 'pointer',
                        transition: 'all .2s',
                    }}
                        onMouseEnter={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.color = 'var(--text)'; }}
                        onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted)'; }}
                    >
                        ⬇ PDF
                    </button>
                </div>
            </div>

            {/* ── Question body ── */}
            <div style={{
                padding: '22px 24px',
                fontSize: 15.5,
                lineHeight: 1.75,
                color: '#e2e8f0',
                fontWeight: 500,
                borderBottom: '1px solid var(--border)',
            }}>
                {typeof data?.question === 'string' ? (
                    <StreamingText text={data.question} speed={14} animate={animate} />
                ) : (
                    <MD>{data?.question}</MD>
                )}
            </div>

            {/* ── MCQ Options ── */}
            {data?.options && typeof data.options === 'object' && (
                <div style={{
                    padding: '18px 24px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                    borderBottom: '1px solid var(--border)',
                }}>
                    {Object.entries(data.options).map(([key, value]) => {
                        const correct = String(data.correct_option).toLowerCase() === key.toLowerCase();
                        return (
                            <div key={key} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 10,
                                padding: '12px 14px',
                                borderRadius: 12,
                                border: `1px solid ${correct ? 'rgba(16,185,129,.4)' : 'var(--border)'}`,
                                background: correct ? 'rgba(16,185,129,.08)' : 'rgba(255,255,255,.02)',
                                transition: 'all .2s',
                            }}>
                                <span style={{
                                    width: 26, height: 26,
                                    borderRadius: 7,
                                    background: correct ? 'rgba(16,185,129,.25)' : 'rgba(255,255,255,.08)',
                                    color: correct ? '#10b981' : 'var(--muted)',
                                    fontSize: 12, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    {key.toUpperCase()}
                                </span>
                                <div style={{
                                    fontSize: 13.5,
                                    lineHeight: 1.55,
                                    color: correct ? '#a7f3d0' : '#94a3b8',
                                    paddingTop: 2,
                                }}>
                                    <MD>{value}</MD>
                                </div>
                                {correct && (
                                    <span style={{ marginLeft: 'auto', color: '#10b981', fontSize: 16, flexShrink: 0 }}>✓</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Related Formulas ── */}
            {data?.related_formulas?.length > 0 && (
                <div style={{
                    margin: '0 24px',
                    marginTop: 18,
                    padding: '14px 16px',
                    background: 'rgba(245,158,11,.06)',
                    border: '1px solid rgba(245,158,11,.18)',
                    borderRadius: 12,
                }}>
                    <div style={{
                        fontSize: 11, fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '.07em',
                        color: 'var(--gold2)', marginBottom: 10,
                    }}>
                        📐 Core Formulas Used
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {data.related_formulas.map((f, i) => (
                            <span key={i} style={{
                                padding: '4px 12px',
                                background: 'rgba(245,158,11,.1)',
                                border: '1px solid rgba(245,158,11,.2)',
                                borderRadius: 8,
                                fontSize: 13,
                                color: '#fbbf24',
                            }}>
                                <MD>{f}</MD>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Expert Solution ── */}
            {data?.answer && (
                <div style={{ padding: '18px 24px', paddingTop: data?.related_formulas?.length > 0 ? 14 : 18 }}>
                    <div style={{
                        fontSize: 11, fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '.07em',
                        color: 'var(--accent2)', marginBottom: 10,
                        display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        <span style={{ width: 3, height: 14, background: 'var(--accent)', borderRadius: 2, display: 'inline-block' }} />
                        Expert Solution
                    </div>
                    <div style={{
                        background: 'rgba(99,102,241,.06)',
                        border: '1px solid rgba(99,102,241,.15)',
                        borderRadius: 12,
                        padding: '16px',
                        fontSize: 14,
                        lineHeight: 1.7,
                        color: '#c4ccdd',
                    }}>
                        {typeof data.answer === 'string' ? (
                            <StreamingText text={data.answer} speed={4} animate={false} />
                        ) : (
                            <MD>{data.answer}</MD>
                        )}
                    </div>
                </div>
            )}

            {/* ── Marking Scheme Key Points ── */}
            {data?.key_points?.length > 0 && (
                <div style={{ padding: '0 24px 22px' }}>
                    <div style={{
                        fontSize: 11, fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '.07em',
                        color: 'var(--muted)', marginBottom: 12,
                        display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        <span style={{ width: 3, height: 14, background: 'var(--success)', borderRadius: 2, display: 'inline-block' }} />
                        Marking Scheme Key Points
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {data.key_points.map((pt, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 10,
                            }}>
                                <span style={{
                                    width: 22, height: 22,
                                    borderRadius: '50%',
                                    background: 'rgba(16,185,129,.15)',
                                    border: '1px solid rgba(16,185,129,.3)',
                                    color: '#10b981',
                                    fontSize: 11, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0, marginTop: 2,
                                }}>
                                    {i + 1}
                                </span>
                                <div style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6 }}>
                                    <MD>{pt}</MD>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Visualization hint ── */}
            {data?.visualization_hint && (
                <div style={{
                    margin: '0 24px 22px',
                    padding: '12px 14px',
                    background: 'rgba(139,92,246,.07)',
                    border: '1px solid rgba(139,92,246,.2)',
                    borderRadius: 11,
                    fontSize: 13,
                    color: '#c4b5fd',
                }}>
                    <span style={{ fontWeight: 600 }}>📊 Diagram hint: </span>
                    <MD>{data.visualization_hint}</MD>
                </div>
            )}

        </div>
    );
};

export default QuestionCard;