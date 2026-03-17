/**
 * src/pages/Dashboard.jsx
 * Shows streak, stats, weak chapters, recent sessions.
 * Reads from useProgressStore (localStorage-persisted).
 */

import React from 'react';
import useProgressStore from '../store/useProgressStore';

export default function Dashboard({ onNavigate }) {
    const {
        sessions,
        streak,
        getTotalQuestions,
        getAvgAccuracy,
        getTotalTests,
        getWeakChapters,
        clearAll,
    } = useProgressStore();

    const totalQ = getTotalQuestions();
    const avgAcc = getAvgAccuracy();
    const totalT = getTotalTests();
    const weakChaps = getWeakChapters();
    const recent = sessions.slice(0, 5);

    const card = {
        background: 'var(--surface, #0d1425)',
        border: '1px solid var(--border, rgba(99,102,241,0.15))',
        borderRadius: 16,
        padding: '20px 22px',
    };

    const label = {
        fontSize: 11, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '.07em',
        color: 'var(--muted, #64748b)', marginBottom: 6,
        display: 'block',
    };

    // Empty state
    if (!sessions.length) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>📊</div>
                <div style={{
                    fontFamily: 'Syne, sans-serif', fontSize: 22,
                    fontWeight: 700, marginBottom: 10,
                    color: 'var(--text, #e2e8f0)',
                }}>
                    No data yet
                </div>
                <p style={{ color: 'var(--muted, #64748b)', fontSize: 14, marginBottom: 28 }}>
                    Complete a practice test to see your progress here.
                </p>
                <button
                    onClick={() => onNavigate('practice')}
                    className="btn-generate"
                    style={{ width: 'auto', padding: '12px 32px' }}
                >
                    <div className="btn-shine" />
                    Start Practice Test →
                </button>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: 80 }}>

            {/* Header */}
            <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, marginBottom: 4, color: 'var(--text, #e2e8f0)' }}>
                        Your Dashboard
                    </h1>
                    <p style={{ fontSize: 13.5, color: 'var(--muted, #64748b)' }}>
                        Track progress, spot weak areas, keep your streak going.
                    </p>
                </div>
                <button
                    onClick={() => { if (window.confirm('Clear all progress data?')) clearAll(); }}
                    style={{
                        background: 'none', border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: 8, padding: '6px 12px',
                        fontSize: 12, color: '#ef4444', cursor: 'pointer',
                    }}
                >
                    Reset data
                </button>
            </div>

            {/* Streak + stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
                {[
                    { label: 'Day Streak', value: `${streak} 🔥`, grad: '#fbbf24,#f59e0b' },
                    { label: 'Questions Done', value: totalQ, grad: '#818cf8,#6366f1' },
                    { label: 'Avg Accuracy', value: `${avgAcc}%`, grad: '#34d399,#10b981' },
                    { label: 'Tests Taken', value: totalT, grad: '#f472b6,#ec4899' },
                ].map(s => (
                    <div key={s.label} style={card}>
                        <span style={label}>{s.label}</span>
                        <div style={{
                            fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, lineHeight: 1,
                            background: `linear-gradient(135deg,${s.grad})`,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            {s.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Weak chapters + Recent sessions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                {/* Weak chapters */}
                <div style={card}>
                    <span style={{ ...label, marginBottom: 16 }}>Weak Chapters (focus here)</span>
                    {weakChaps.length === 0 ? (
                        <p style={{ fontSize: 13, color: 'var(--muted, #64748b)' }}>
                            Need at least 2 attempts per chapter to show weakness data.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {weakChaps.map((c, i) => (
                                <div
                                    key={i}
                                    onClick={() => onNavigate('generator')}
                                    style={{
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '10px 14px', borderRadius: 10,
                                        background: 'rgba(239,68,68,0.06)',
                                        border: '1px solid rgba(239,68,68,0.2)',
                                        cursor: 'pointer', transition: 'all .15s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'}
                                >
                                    <div>
                                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text, #e2e8f0)' }}>
                                            {c.chapter}
                                        </div>
                                        <div style={{ fontSize: 11.5, color: 'var(--muted, #64748b)' }}>
                                            {c.subject} · {c.total} questions
                                        </div>
                                    </div>
                                    <span style={{
                                        padding: '3px 10px', borderRadius: 20,
                                        fontSize: 12, fontWeight: 600,
                                        background: c.accuracy < 40
                                            ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                                        color: c.accuracy < 40 ? '#ef4444' : '#fbbf24',
                                    }}>
                                        {c.accuracy}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent sessions */}
                <div style={card}>
                    <span style={{ ...label, marginBottom: 16 }}>Recent Sessions</span>
                    {recent.length === 0 ? (
                        <p style={{ fontSize: 13, color: 'var(--muted, #64748b)' }}>No sessions yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {recent.map((s, i) => {
                                const acc = s.total > 0 ? Math.round(s.correct / s.total * 100) : 0;
                                const col = acc >= 70 ? '#10b981' : acc >= 40 ? '#fbbf24' : '#ef4444';
                                return (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '10px 14px', borderRadius: 10,
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--border, rgba(99,102,241,0.15))',
                                    }}>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text, #e2e8f0)' }}>
                                                {s.chapter}
                                            </div>
                                            <div style={{ fontSize: 11.5, color: 'var(--muted, #64748b)' }}>
                                                {s.subject} · {new Date(s.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: 20,
                                            fontSize: 12, fontWeight: 600,
                                            background: `${col}20`, color: col,
                                        }}>
                                            {s.correct}/{s.total}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button
                    onClick={() => onNavigate('practice')}
                    className="btn-generate"
                    style={{ width: 'auto', padding: '12px 40px' }}
                >
                    <div className="btn-shine" />
                    Start a New Test →
                </button>
            </div>
        </div>
    );
}