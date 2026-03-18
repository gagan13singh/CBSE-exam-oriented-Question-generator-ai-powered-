/**
 * src/components/PracticeConfig.jsx
 * UPDATED: Uses embedded syllabusData.js instead of fetching /api/v1/syllabus
 * — Eliminates ERR_INTERNET_DISCONNECTED on practice mode open
 * — Instant load, works offline
 * — All logic UNCHANGED
 */

import React, { useState, useEffect } from 'react';
import useProgressStore from '../store/useProgressStore';
import { getSubjects, getChapters, getTopics } from '../data/syllabusData';

const PracticeConfig = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        class: '10',
        subject: 'Science',
        chapters: 'All Chapters',
        totalQuestions: '15',
        difficulty: 'Standard',
    });

    const [adaptiveHint, setAdaptiveHint] = useState(null);

    // Adaptive difficulty from store
    const getAdaptiveDifficulty = useProgressStore(s => s.getAdaptiveDifficulty);

    // Reset subject + chapters when class changes
    useEffect(() => {
        const subjects = getSubjects(formData.class);
        const currentSubjectAvailable = subjects.includes(formData.subject);
        if (!currentSubjectAvailable) {
            setFormData(prev => ({ ...prev, subject: subjects[0] || '', chapters: 'All Chapters' }));
        } else {
            setFormData(prev => ({ ...prev, chapters: 'All Chapters' }));
        }
    }, [formData.class]);

    // Reset chapters when subject changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, chapters: '' }));
    }, [formData.subject]);

    // Adaptive difficulty: auto-set when a specific chapter is selected
    useEffect(() => {
        if (
            formData.subject &&
            formData.chapters &&
            formData.chapters !== 'All Chapters' &&
            formData.chapters !== ''
        ) {
            const suggested = getAdaptiveDifficulty(formData.subject, formData.chapters);
            setFormData(prev => ({ ...prev, difficulty: suggested }));
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

    const classOptions    = ['9', '10', '11', '12'];
    const difficultyOptions = [
        { value: 'Standard', label: 'Standard' },
        { value: 'Easy',     label: 'Easy' },
        { value: 'Hard',     label: 'Hard' },
    ];
    const qCountOptions = ['10', '15', '20', '30'];

    // Derived from local data — no network needed
    const subjectOptions = getSubjects(formData.class);
    const chapterOptions = formData.subject
        ? [
            { value: 'All Chapters', label: 'Full Syllabus (All Chapters)' },
            ...getChapters(formData.class, formData.subject).map(c => ({ value: c, label: c })),
          ]
        : [{ value: 'All Chapters', label: 'Full Syllabus (All Chapters)' }];

    // Topics for the selected chapter (shown as hints below the chapter selector)
    const topics = (formData.chapters && formData.chapters !== 'All Chapters')
        ? getTopics(formData.class, formData.subject, formData.chapters)
        : [];

    // ── Styles ──
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
        appearance: 'none', cursor: 'pointer', outline: 'none',
        transition: 'all .2s',
    };
    const fieldStyle = { marginBottom: 18 };
    const onFocus = e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.12)'; };
    const onBlur  = e => { e.target.style.borderColor = 'var(--border)';  e.target.style.boxShadow = 'none'; };

    return (
        <form onSubmit={handleSubmit}>

            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                    Configure Practice Test
                </h2>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                    AI generates a CBSE-pattern paper in real time.
                </p>
            </div>

            {/* Class + Subject row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div>
                    <label style={labelStyle}>Class</label>
                    <div style={{ position: 'relative' }}>
                        <select name="class" value={formData.class} onChange={handleChange} style={selectStyle} onFocus={onFocus} onBlur={onBlur}>
                            {classOptions.map(c => (
                                <option key={c} value={c} style={{ background: '#131c30' }}>Class {c}</option>
                            ))}
                        </select>
                        <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                    </div>
                </div>
                <div>
                    <label style={labelStyle}>Subject</label>
                    <div style={{ position: 'relative' }}>
                        <select name="subject" value={formData.subject} onChange={handleChange} style={selectStyle} onFocus={onFocus} onBlur={onBlur}>
                            {subjectOptions.map(s => (
                                <option key={s} value={s} style={{ background: '#131c30' }}>{s}</option>
                            ))}
                        </select>
                        <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                    </div>
                </div>
            </div>

            {/* Chapter */}
            <div style={fieldStyle}>
                <label style={labelStyle}>Chapter</label>
                <div style={{ position: 'relative' }}>
                    <select name="chapters" value={formData.chapters} onChange={handleChange} style={selectStyle} onFocus={onFocus} onBlur={onBlur}>
                        {chapterOptions.map(c => (
                            <option key={c.value} value={c.value} style={{ background: '#131c30' }}>{c.label}</option>
                        ))}
                    </select>
                    <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                </div>

                {/* Topics strip — show when a specific chapter is selected */}
                {topics.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--muted)', marginBottom: 6 }}>
                            Topics covered in this chapter
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {topics.map((t, i) => (
                                <span key={i} style={{
                                    padding: '3px 9px', borderRadius: 20,
                                    fontSize: 11, fontWeight: 500,
                                    background: 'rgba(99,102,241,0.08)',
                                    border: '1px solid rgba(99,102,241,0.2)',
                                    color: 'var(--accent2)',
                                }}>
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Questions + Difficulty row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div>
                    <label style={labelStyle}>Questions</label>
                    <div style={{ position: 'relative' }}>
                        <select name="totalQuestions" value={formData.totalQuestions} onChange={handleChange} style={selectStyle} onFocus={onFocus} onBlur={onBlur}>
                            {qCountOptions.map(n => (
                                <option key={n} value={n} style={{ background: '#131c30' }}>{n} questions</option>
                            ))}
                        </select>
                        <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                    </div>
                </div>
                <div>
                    <label style={labelStyle}>
                        Difficulty
                        {adaptiveHint && (
                            <span style={{
                                marginLeft: 6, padding: '1px 7px', borderRadius: 20,
                                fontSize: 10, fontWeight: 600,
                                background: 'rgba(245,158,11,0.12)',
                                border: '1px solid rgba(245,158,11,0.3)',
                                color: '#fbbf24', textTransform: 'none', letterSpacing: 0,
                            }}>
                                ⚡ Adaptive: {adaptiveHint}
                            </span>
                        )}
                    </label>
                    <div style={{ position: 'relative' }}>
                        <select name="difficulty" value={formData.difficulty} onChange={handleChange} style={selectStyle} onFocus={onFocus} onBlur={onBlur}>
                            {difficultyOptions.map(d => (
                                <option key={d.value} value={d.value} style={{ background: '#131c30' }}>{d.label}</option>
                            ))}
                        </select>
                        <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                    </div>
                </div>
            </div>

            {/* Info strip */}
            <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 13px', borderRadius: 10, marginBottom: 22,
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.15)',
            }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>🎯</span>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.55 }}>
                    Your paper will follow CBSE marking scheme with a mix of MCQ, Short Answer, and Long Answer questions.
                    {adaptiveHint && (
                        <span style={{ color: '#fbbf24', display: 'block', marginTop: 3 }}>
                            Difficulty auto-set to <strong>{adaptiveHint}</strong> based on your past performance in this chapter.
                        </span>
                    )}
                </div>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading || !formData.subject}
                className="btn-generate"
                style={{ position: 'relative' }}
            >
                <div className="btn-shine" />
                {isLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                        <span style={{
                            width: 15, height: 15, borderRadius: '50%',
                            border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff',
                            animation: 'spin .7s linear infinite', display: 'inline-block',
                        }} />
                        Generating paper…
                    </span>
                ) : `Generate ${formData.totalQuestions}-Question Practice Test →`}
            </button>
        </form>
    );
};

export default PracticeConfig;