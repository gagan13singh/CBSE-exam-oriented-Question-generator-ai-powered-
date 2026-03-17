/**
 * client/src/pages/Analytics.jsx
 * Run: npm install recharts  (inside client/)
 */
import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts';
import useProgressStore from '../store/useProgressStore';

export default function Analytics() {
    const { sessions, streak, getTotalQuestions, getAvgAccuracy, getTotalTests } = useProgressStore();

    // Build per-chapter accuracy data
    const map = {};
    sessions.forEach(s => {
        const k = `${s.subject}__${s.chapter}`;
        if (!map[k]) map[k] = { name: s.chapter, correct: 0, total: 0, subject: s.subject };
        map[k].correct += s.correct || 0;
        map[k].total += s.total || 0;
    });
    const chartData = Object.values(map)
        .map(c => ({ ...c, pct: c.total ? Math.round(c.correct / c.total * 100) : 0 }))
        .sort((a, b) => a.pct - b.pct);

    if (!sessions.length) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>📈</div>
                <div style={{
                    fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700,
                    color: 'var(--text, #e2e8f0)', marginBottom: 10,
                }}>
                    No data yet
                </div>
                <p style={{ color: 'var(--muted, #64748b)', fontSize: 14 }}>
                    Complete practice tests to see your chapter analytics here.
                </p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 2rem 80px' }}>

            {/* Header */}
            <h1 style={{
                fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800,
                marginBottom: 6, color: 'var(--text, #e2e8f0)',
            }}>
                Analytics
            </h1>
            <p style={{ color: 'var(--muted, #64748b)', fontSize: 13.5, marginBottom: 28 }}>
                Chapter-wise accuracy, trends, and performance overview.
            </p>

            {/* Stat row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
                {[
                    { label: 'Day Streak', value: `${streak} 🔥`, grad: '#fbbf24,#f59e0b' },
                    { label: 'Total Questions', value: getTotalQuestions(), grad: '#818cf8,#6366f1' },
                    { label: 'Avg Accuracy', value: `${getAvgAccuracy()}%`, grad: '#34d399,#10b981' },
                    { label: 'Tests Taken', value: getTotalTests?.() ?? sessions.length, grad: '#f472b6,#ec4899' },
                ].map(s => (
                    <div key={s.label} className="p-card" style={{ padding: 20 }}>
                        <div style={{
                            fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase',
                            letterSpacing: '.08em', color: 'var(--muted, #64748b)', marginBottom: 8,
                        }}>{s.label}</div>
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

            {/* Bar chart */}
            <div className="p-card" style={{ padding: 28 }}>
                <h2 style={{
                    fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700,
                    color: 'var(--text, #e2e8f0)', marginBottom: 20,
                }}>
                    Accuracy by Chapter
                </h2>

                {chartData.length > 0 ? (
                    <>
                        {/* Legend */}
                        <div style={{ display: 'flex', gap: 18, marginBottom: 16 }}>
                            {[
                                { color: '#10b981', label: '≥70% Strong' },
                                { color: '#f59e0b', label: '50–69% Needs work' },
                                { color: '#ef4444', label: '<50% Weak' },
                            ].map(l => (
                                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted, #64748b)' }}>
                                    <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color, display: 'inline-block' }} />
                                    {l.label}
                                </div>
                            ))}
                        </div>

                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 50 }}>
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
                                    angle={-35} textAnchor="end" interval={0}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tickFormatter={v => `${v}%`}
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                />
                                <Tooltip
                                    formatter={(v, name, props) => [`${v}% (${props.payload.correct}/${props.payload.total})`, 'Accuracy']}
                                    contentStyle={{
                                        background: 'var(--surface, #0d1425)',
                                        border: '1px solid var(--border, rgba(99,102,241,0.2))',
                                        borderRadius: 10, color: 'var(--text, #e2e8f0)',
                                        fontSize: 13,
                                    }}
                                    cursor={{ fill: 'rgba(99,102,241,0.06)' }}
                                />
                                <Bar dataKey="pct" radius={[6, 6, 0, 0]} maxBarSize={48}>
                                    {chartData.map((e, i) => (
                                        <Cell
                                            key={i}
                                            fill={e.pct >= 70 ? '#10b981' : e.pct >= 50 ? '#f59e0b' : '#ef4444'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted, #64748b)', fontSize: 14 }}>
                        Complete at least one test to see chapter accuracy.
                    </div>
                )}
            </div>

            {/* Per-subject breakdown table */}
            {chartData.length > 0 && (
                <div className="p-card" style={{ padding: 24, marginTop: 20 }}>
                    <h2 style={{
                        fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700,
                        color: 'var(--text, #e2e8f0)', marginBottom: 16,
                    }}>
                        Chapter Breakdown
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {/* Table header */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 120px 80px 80px',
                            padding: '8px 12px', fontSize: 11, fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: '.06em',
                            color: 'var(--muted, #64748b)',
                            borderBottom: '1px solid var(--border, rgba(99,102,241,0.12))',
                        }}>
                            <span>Chapter</span>
                            <span>Subject</span>
                            <span>Score</span>
                            <span>Accuracy</span>
                        </div>
                        {/* Rows — sorted worst first */}
                        {chartData.map((c, i) => {
                            const col = c.pct >= 70 ? '#10b981' : c.pct >= 50 ? '#f59e0b' : '#ef4444';
                            return (
                                <div key={i} style={{
                                    display: 'grid', gridTemplateColumns: '1fr 120px 80px 80px',
                                    padding: '11px 12px', fontSize: 13.5,
                                    borderBottom: i < chartData.length - 1
                                        ? '1px solid var(--border, rgba(99,102,241,0.08))' : 'none',
                                    transition: 'background .15s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <span style={{ fontWeight: 500, color: 'var(--text, #e2e8f0)' }}>{c.name}</span>
                                    <span style={{ color: 'var(--muted, #64748b)', fontSize: 12.5 }}>{c.subject}</span>
                                    <span style={{ color: 'var(--muted, #64748b)' }}>{c.correct}/{c.total}</span>
                                    <span style={{
                                        display: 'inline-block', padding: '2px 10px',
                                        borderRadius: 20, fontSize: 12, fontWeight: 600,
                                        background: `${col}18`, color: col,
                                        width: 'fit-content',
                                    }}>{c.pct}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}