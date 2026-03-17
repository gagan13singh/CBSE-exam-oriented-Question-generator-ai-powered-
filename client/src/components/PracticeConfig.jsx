/**
 * src/components/PracticeConfig.jsx
 * Added: adaptive difficulty — auto-sets difficulty based on chapter history
 */

import React, { useState, useEffect } from 'react';
import useProgressStore from '../store/useProgressStore';

const PracticeConfig = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        class: '10',
        subject: 'Science',
        chapters: 'All Chapters',
        totalQuestions: '15',
        difficulty: 'Standard',
    });

    const [syllabus, setSyllabus] = useState(null);
    const [loadingSyllabus, setLoadingSyllabus] = useState(true);
    const [adaptiveHint, setAdaptiveHint] = useState(null);

    // Adaptive difficulty from store
    const getAdaptiveDifficulty = useProgressStore(s => s.getAdaptiveDifficulty);

    // Fetch syllabus on mount
    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/v1/syllabus`)
            .then(res => res.json())
            .then(data => { if (data.success) setSyllabus(data.data); })
            .catch(err => console.error('Failed to load syllabus', err))
            .finally(() => setLoadingSyllabus(false));
    }, []);

    // Reset subject + chapters when class changes
    useEffect(() => {
        if (!syllabus || !formData.class) return;
        const classData = syllabus[`class_${formData.class}`] || {};
        const availableSubjects = Object.keys(classData);
        if (!availableSubjects.includes(formData.subject)) {
            setFormData(prev => ({ ...prev, subject: availableSubjects[0] || '', chapters: 'All Chapters' }));
        } else {
            setFormData(prev => ({ ...prev, chapters: 'All Chapters' }));
        }
    }, [formData.class, syllabus]);

    // Reset chapters when subject changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, chapters: '' }));
    }, [formData.subject]);

    // ── Adaptive difficulty: auto-set when a specific chapter is selected ──
    useEffect(() => {
        if (
            formData.subject &&
            formData.chapters &&
            formData.chapters !== 'All Chapters' &&
            formData.chapters !== ''
        ) {
            const suggested = getAdaptiveDifficulty(formData.subject, formData.chapters);
            setFormData(prev => ({ ...prev, difficulty: suggested }));
            // Show hint only when not Standard (Standard is the default)
            setAdaptiveHint(suggested !== 'Standard' ? suggested : null);
        } else {
            setAdaptiveHint(null);
        }
    }, [formData.chapters]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        const chaptersArray =
            formData.chapters === 'All Chapters' || !formData.chapters
                ? ['All Chapters']
                : [formData.chapters];
        onSubmit({ ...formData, chapters: chaptersArray, totalQuestions: parseInt(formData.totalQuestions) });
    };

    const classOptions = ['9', '10', '11', '12'];
    const difficultyOptions = [
        { value: 'Standard', label: 'Standard' },
        { value: 'Easy', label: 'Easy' },
        { value: 'Hard', label: 'Hard' },
    ];
    const qCountOptions = ['10', '15', '20', '30'];

    const getSubjectOptions = () => {
        if (!syllabus || !formData.class) return [];
        return Object.keys(syllabus[`class_${formData.class}`] || {});
    };

    const getChapterOptions = () => {
        if (!syllabus || !formData.class || !formData.subject) return [];
        const chapters = Object.keys(
            (syllabus[`class_${formData.class}`] || {})[formData.subject] || {}
        ).map(c => ({ value: c, label: c }));
        return [{ value: 'All Chapters', label: 'Full Syllabus (All Chapters)' }, ...chapters];
    };

    const subjectOptions = getSubjectOptions();
    const chapterOptions = getChapterOptions();

    const labelStyle = {
        display: 'block', fontSize: 11, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '.07em',
        color: 'var(--muted)', marginBottom: 7,
    };
    const selectStyle = {
        width: '100%', padding: '11px 34px 11px 13px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border)', borderRadius: 11,
        color: 'var(--text)', fontSize: 14,
        fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
        appearance: 'none', cursor: 'pointer', outline: 'none', transition: 'all .2s',
    };
    const fieldStyle = { marginBottom: 18 };
    const onFocus = e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.14)'; };
    const onBlur = e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };

    if (loadingSyllabus) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 0' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(99,102,241,.15)', borderTopColor: 'var(--accent)', animation: 'spin .8s linear infinite' }} />
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>Loading syllabus…</span>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                    Practice Test
                </h2>
                <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>CBSE exam-pattern mock paper</p>
            </div>

            <form onSubmit={handleSubmit}>

                {/* Class & Subject */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                    <div>
                        <label style={labelStyle}>Class</label>
                        <div style={{ position: 'relative' }}>
                            <select name="class" value={formData.class} onChange={handleChange} style={selectStyle} onFocus={onFocus} onBlur={onBlur}>
                                {classOptions.map(c => <option key={c} value={c} style={{ background: '#131c30' }}>Class {c}</option>)}
                            </select>
                            <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Subject</label>
                        <div style={{ position: 'relative' }}>
                            <select name="subject" value={formData.subject} onChange={handleChange} style={selectStyle} onFocus={onFocus} onBlur={onBlur}>
                                {subjectOptions.map(s => <option key={s} value={s} style={{ background: '#131c30' }}>{s}</option>)}
                            </select>
                            <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                        </div>
                    </div>
                </div>

                {/* Chapters */}
                <div style={fieldStyle}>
                    <label style={labelStyle}>Chapters</label>
                    <div style={{ position: 'relative' }}>
                        {chapterOptions.length > 0 ? (
                            <>
                                <select name="chapters" value={formData.chapters} onChange={handleChange} style={selectStyle} onFocus={onFocus} onBlur={onBlur}>
                                    {chapterOptions.map(c => <option key={c.value} value={c.value} style={{ background: '#131c30' }}>{c.label}</option>)}
                                </select>
                                <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                            </>
                        ) : (
                            <input type="text" name="chapters" value={formData.chapters} onChange={handleChange}
                                placeholder="e.g. Light, Electricity" required
                                style={{ ...selectStyle, padding: '11px 13px' }} onFocus={onFocus} onBlur={onBlur}
                            />
                        )}
                    </div>
                </div>

                {/* Adaptive difficulty hint */}
                {adaptiveHint && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '9px 13px', borderRadius: 9, marginBottom: 14,
                        background: adaptiveHint === 'Hard'
                            ? 'rgba(239,68,68,.08)' : 'rgba(16,185,129,.08)',
                        border: `1px solid ${adaptiveHint === 'Hard'
                            ? 'rgba(239,68,68,.25)' : 'rgba(16,185,129,.25)'}`,
                        fontSize: 12.5,
                        color: adaptiveHint === 'Hard' ? '#ef4444' : '#10b981',
                    }}>
                        <span>{adaptiveHint === 'Hard' ? '🔥' : '💡'}</span>
                        <span>
                            Adaptive: set to <strong>{adaptiveHint}</strong> based on your past performance in this chapter.
                        </span>
                    </div>
                )}

                {/* Total Questions */}
                <div style={fieldStyle}>
                    <label style={labelStyle}>Total Questions</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {qCountOptions.map(n => {
                            const active = formData.totalQuestions === n;
                            return (
                                <button key={n} type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, totalQuestions: n }))}
                                    style={{
                                        flex: 1, padding: '10px 8px', borderRadius: 10,
                                        border: `1px solid ${active ? 'rgba(99,102,241,.5)' : 'var(--border)'}`,
                                        background: active ? 'rgba(99,102,241,.14)' : 'transparent',
                                        color: active ? 'var(--accent2)' : 'var(--muted)',
                                        fontFamily: 'DM Sans, sans-serif', fontSize: 13.5,
                                        fontWeight: active ? 600 : 500, cursor: 'pointer', transition: 'all .18s',
                                    }}
                                >{n}</button>
                            );
                        })}
                    </div>
                </div>

                {/* Difficulty */}
                <div style={fieldStyle}>
                    <label style={labelStyle}>
                        Difficulty
                        {adaptiveHint && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--accent2)', fontWeight: 500 }}>(auto-set)</span>}
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {difficultyOptions.map(({ value, label }) => {
                            const active = formData.difficulty === value;
                            const colors = {
                                Easy: { bg: 'rgba(16,185,129,.12)', border: 'rgba(16,185,129,.4)', color: '#10b981' },
                                Standard: { bg: 'rgba(99,102,241,.12)', border: 'rgba(99,102,241,.4)', color: 'var(--accent2)' },
                                Hard: { bg: 'rgba(239,68,68,.12)', border: 'rgba(239,68,68,.4)', color: '#ef4444' },
                            };
                            const c = colors[value] || colors.Standard;
                            return (
                                <button key={value} type="button"
                                    onClick={() => { setFormData(prev => ({ ...prev, difficulty: value })); setAdaptiveHint(null); }}
                                    style={{
                                        flex: 1, padding: '10px 6px', borderRadius: 10,
                                        border: `1px solid ${active ? c.border : 'var(--border)'}`,
                                        background: active ? c.bg : 'transparent',
                                        color: active ? c.color : 'var(--muted)',
                                        fontFamily: 'DM Sans, sans-serif', fontSize: 12.5,
                                        fontWeight: 500, cursor: 'pointer', transition: 'all .18s', textAlign: 'center',
                                    }}
                                >{label}</button>
                            );
                        })}
                    </div>
                </div>

                {/* Info strip */}
                <div style={{
                    background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.15)',
                    borderRadius: 11, padding: '12px 14px', fontSize: 13,
                    color: 'var(--muted)', marginBottom: 20,
                }}>
                    Estimated time: <strong style={{ color: 'var(--text)' }}>
                        {Math.max(20, parseInt(formData.totalQuestions) * 2)} minutes
                    </strong> · CBSE Section A + B + C pattern
                </div>

                <button type="submit" disabled={isLoading} className="btn-generate">
                    <div className="btn-shine" />
                    {isLoading ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                            <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                            Creating Paper…
                        </span>
                    ) : 'Start Practice Test →'}
                </button>

                <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--muted)', marginTop: 10 }}>
                    Powered by Groq. Generation takes ~3–5 seconds.
                </p>
            </form>
        </div>
    );
};

export default PracticeConfig;