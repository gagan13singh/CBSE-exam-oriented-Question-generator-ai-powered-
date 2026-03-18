/**
 * src/components/QuestionForm.jsx
 * UPDATED: Uses embedded syllabusData.js instead of fetching /api/v1/syllabus
 * — Instant load, works offline, no cold-start delay
 * — All logic UNCHANGED
 */

import React, { useState, useEffect } from 'react';
import { getSubjects, getChapters, getTopics } from '../data/syllabusData';

const QuestionForm = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        class: '',
        subject: '',
        chapter: '',
        topic: '',
        difficulty: 'Medium',
        questionType: 'MCQ',
        count: 1,
    });

    // Reset cascading dropdowns
    useEffect(() => {
        setFormData(prev => ({ ...prev, subject: '', chapter: '', topic: '' }));
    }, [formData.class]);

    useEffect(() => {
        setFormData(prev => ({ ...prev, chapter: '', topic: '' }));
    }, [formData.subject]);

    useEffect(() => {
        setFormData(prev => ({ ...prev, topic: '' }));
    }, [formData.chapter]);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        onSubmit(formData);
    };

    // ── Options from local data ──
    const classOptions    = ['9', '10', '11', '12'];
    const difficultyOpts  = ['Easy', 'Medium', 'Exam-Oriented', 'Hard'];
    const typeOpts        = ['MCQ', 'VSA', 'Subjective', 'Long Answer', 'Case-Based'];
    const countOpts       = [1, 3, 5, 10];

    const subjectOptions  = formData.class ? getSubjects(formData.class) : [];
    const chapterOptions  = (formData.class && formData.subject) ? getChapters(formData.class, formData.subject) : [];
    const topicOptions    = (formData.class && formData.subject && formData.chapter) ? getTopics(formData.class, formData.subject, formData.chapter) : [];

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
    const disabledSelectStyle = {
        ...selectStyle,
        opacity: 0.45,
        cursor: 'not-allowed',
    };
    const fieldStyle = { marginBottom: 16 };
    const onFocus = e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.12)'; };
    const onBlur  = e => { e.target.style.borderColor = 'var(--border)';  e.target.style.boxShadow = 'none'; };

    return (
        <form onSubmit={handleSubmit}>

            {/* Class */}
            <div style={fieldStyle}>
                <label style={labelStyle}>Class</label>
                <div style={{ position: 'relative' }}>
                    <select name="class" value={formData.class} onChange={handleChange} style={selectStyle} onFocus={onFocus} onBlur={onBlur}>
                        <option value="" style={{ background: '#131c30' }}>Select class</option>
                        {classOptions.map(c => (
                            <option key={c} value={c} style={{ background: '#131c30' }}>Class {c}</option>
                        ))}
                    </select>
                    <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                </div>
            </div>

            {/* Subject */}
            <div style={fieldStyle}>
                <label style={labelStyle}>Subject</label>
                <div style={{ position: 'relative' }}>
                    <select
                        name="subject" value={formData.subject} onChange={handleChange}
                        style={formData.class ? selectStyle : disabledSelectStyle}
                        disabled={!formData.class}
                        onFocus={onFocus} onBlur={onBlur}
                    >
                        <option value="" style={{ background: '#131c30' }}>Select subject</option>
                        {subjectOptions.map(s => (
                            <option key={s} value={s} style={{ background: '#131c30' }}>{s}</option>
                        ))}
                    </select>
                    <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                </div>
            </div>

            {/* Chapter */}
            <div style={fieldStyle}>
                <label style={labelStyle}>Chapter</label>
                <div style={{ position: 'relative' }}>
                    <select
                        name="chapter" value={formData.chapter} onChange={handleChange}
                        style={formData.subject ? selectStyle : disabledSelectStyle}
                        disabled={!formData.subject}
                        onFocus={onFocus} onBlur={onBlur}
                    >
                        <option value="" style={{ background: '#131c30' }}>Select chapter</option>
                        {chapterOptions.map(c => (
                            <option key={c} value={c} style={{ background: '#131c30' }}>{c}</option>
                        ))}
                    </select>
                    <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                </div>
            </div>

            {/* Topic */}
            <div style={fieldStyle}>
                <label style={labelStyle}>
                    Topic
                    <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 400, color: 'var(--muted)', textTransform: 'none', letterSpacing: 0 }}>
                        (optional — leave blank for full chapter)
                    </span>
                </label>
                <div style={{ position: 'relative' }}>
                    <select
                        name="topic" value={formData.topic} onChange={handleChange}
                        style={formData.chapter ? selectStyle : disabledSelectStyle}
                        disabled={!formData.chapter}
                        onFocus={onFocus} onBlur={onBlur}
                    >
                        <option value="" style={{ background: '#131c30' }}>Full chapter</option>
                        {topicOptions.map(t => (
                            <option key={t} value={t} style={{ background: '#131c30' }}>{t}</option>
                        ))}
                    </select>
                    <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                </div>

                {/* Topic pills — show available topics as a quick reference */}
                {topicOptions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                        {topicOptions.map((t, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, topic: prev.topic === t ? '' : t }))}
                                style={{
                                    padding: '2px 8px', borderRadius: 20, border: 'none', cursor: 'pointer',
                                    fontSize: 10.5, fontWeight: 500,
                                    background: formData.topic === t ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${formData.topic === t ? 'rgba(99,102,241,0.5)' : 'var(--border)'}`,
                                    color: formData.topic === t ? 'var(--accent2)' : 'var(--muted)',
                                    transition: 'all .15s',
                                    fontFamily: 'DM Sans, sans-serif',
                                }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Difficulty + Type row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                    <label style={labelStyle}>Difficulty</label>
                    <div style={{ position: 'relative' }}>
                        <select name="difficulty" value={formData.difficulty} onChange={handleChange} style={selectStyle} onFocus={onFocus} onBlur={onBlur}>
                            {difficultyOpts.map(d => (
                                <option key={d} value={d} style={{ background: '#131c30' }}>{d}</option>
                            ))}
                        </select>
                        <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                    </div>
                </div>
                <div>
                    <label style={labelStyle}>Type</label>
                    <div style={{ position: 'relative' }}>
                        <select name="questionType" value={formData.questionType} onChange={handleChange} style={selectStyle} onFocus={onFocus} onBlur={onBlur}>
                            {typeOpts.map(t => (
                                <option key={t} value={t} style={{ background: '#131c30' }}>{t}</option>
                            ))}
                        </select>
                        <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                    </div>
                </div>
            </div>

            {/* Count */}
            <div style={fieldStyle}>
                <label style={labelStyle}>Number of Questions</label>
                <div style={{ display: 'flex', gap: 8 }}>
                    {countOpts.map(n => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, count: n }))}
                            style={{
                                flex: 1, padding: '9px 6px', borderRadius: 10,
                                border: `1px solid ${formData.count === n ? 'var(--accent)' : 'var(--border)'}`,
                                background: formData.count === n ? 'rgba(99,102,241,0.15)' : 'transparent',
                                color: formData.count === n ? 'var(--accent2)' : 'var(--muted)',
                                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                fontFamily: 'DM Sans, sans-serif', transition: 'all .15s',
                            }}
                        >{n}</button>
                    ))}
                </div>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading || !formData.class || !formData.subject || !formData.chapter}
                className="btn-generate"
                style={{ marginTop: 8, position: 'relative' }}
            >
                <div className="btn-shine" />
                {isLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                        <span style={{
                            width: 15, height: 15, borderRadius: '50%',
                            border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff',
                            animation: 'spin .7s linear infinite', display: 'inline-block',
                        }} />
                        Generating…
                    </span>
                ) : `⚡ Generate ${formData.count > 1 ? `${formData.count} Questions` : 'Question'}`}
            </button>
        </form>
    );
};

export default QuestionForm;