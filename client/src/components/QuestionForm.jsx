/**
 * src/components/QuestionForm.jsx
 * Dark theme rewrite — all logic and API calls UNCHANGED
 * Only the visual/JSX updated to match dark cosmic theme
 */

import React, { useState, useEffect } from 'react';
import { ENDPOINTS } from '../config';

const QuestionForm = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        class: '',
        subject: '',
        chapter: '',
        topic: '',
        difficulty: 'Medium',
        questionType: 'MCQ',
    });

    const [syllabus, setSyllabus] = useState(null);
    const [loadingSyllabus, setLoadingSyllabus] = useState(true);

    // Fetch syllabus on mount — UNCHANGED
    useEffect(() => {
        fetch(ENDPOINTS.syllabus)
            .then(res => res.json())
            .then(data => { if (data.success) setSyllabus(data.data); })
            .catch(err => console.error('Failed to load syllabus', err))
            .finally(() => setLoadingSyllabus(false));
    }, []);

    // Reset cascading dropdowns — UNCHANGED
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

    // ── Options — UNCHANGED ──
    const classOptions = ['9', '10', '11', '12'];
    const difficultyOpts = ['Easy', 'Medium', 'Exam-Oriented', 'Hard'];
    const typeOpts = ['MCQ', 'VSA', 'Subjective', 'Long Answer', 'Case-Based'];

    const getSubjectOptions = () => {
        if (!syllabus || !formData.class) return [];
        return Object.keys(syllabus[`class_${formData.class}`] || {});
    };

    const getChapterOptions = () => {
        if (!syllabus || !formData.class || !formData.subject) return [];
        return Object.keys((syllabus[`class_${formData.class}`] || {})[formData.subject] || {});
    };

    const getTopicOptions = () => {
        if (!syllabus || !formData.class || !formData.subject || !formData.chapter) return [];
        const raw = syllabus[`class_${formData.class}`]?.[formData.subject]?.[formData.chapter];
        // Could be an array of strings OR an object — handle both safely
        if (Array.isArray(raw)) return raw;
        if (raw && typeof raw === 'object') return Object.keys(raw);
        return [];
    };

    const subjectOptions = getSubjectOptions();
    const chapterOptions = getChapterOptions();
    const topicOptions = getTopicOptions();

    // ── Shared select style ──
    const selectStyle = {
        width: '100%',
        padding: '10px 32px 10px 12px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        color: 'var(--text)',
        fontSize: 13.5,
        fontFamily: 'DM Sans, sans-serif',
        fontWeight: 500,
        appearance: 'none',
        cursor: 'pointer',
        outline: 'none',
        transition: 'all .2s',
    };

    const labelStyle = {
        display: 'block',
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '.07em',
        color: 'var(--muted)',
        marginBottom: 6,
    };

    const fieldStyle = { marginBottom: 16 };

    if (loadingSyllabus) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 0' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(99,102,241,.15)', borderTopColor: 'var(--accent)', animation: 'spin .8s linear infinite' }} />
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>Loading syllabus…</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>

            {/* Class & Subject */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                    <label style={labelStyle}>Class</label>
                    <div style={{ position: 'relative' }}>
                        <select
                            name="class"
                            value={formData.class}
                            onChange={handleChange}
                            required
                            style={selectStyle}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.14)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                        >
                            <option value="" style={{ background: '#131c30' }}>Select…</option>
                            {classOptions.map(c => (
                                <option key={c} value={c} style={{ background: '#131c30' }}>Class {c}</option>
                            ))}
                        </select>
                        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>Subject</label>
                    <div style={{ position: 'relative' }}>
                        <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            disabled={!formData.class}
                            style={{ ...selectStyle, opacity: !formData.class ? 0.4 : 1, cursor: !formData.class ? 'not-allowed' : 'pointer' }}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.14)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                        >
                            <option value="" style={{ background: '#131c30' }}>Select…</option>
                            {subjectOptions.map(s => (
                                <option key={s} value={s} style={{ background: '#131c30' }}>{s}</option>
                            ))}
                        </select>
                        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                    </div>
                </div>
            </div>

            {/* Chapter */}
            <div style={fieldStyle}>
                <label style={labelStyle}>Chapter</label>
                <div style={{ position: 'relative' }}>
                    {chapterOptions.length > 0 ? (
                        <>
                            <select
                                name="chapter"
                                value={formData.chapter}
                                onChange={handleChange}
                                required
                                style={selectStyle}
                                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.14)'; }}
                                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                            >
                                <option value="" style={{ background: '#131c30' }}>Select chapter…</option>
                                {chapterOptions.map(c => (
                                    <option key={c} value={c} style={{ background: '#131c30' }}>{c}</option>
                                ))}
                            </select>
                            <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                        </>
                    ) : (
                        <input
                            type="text"
                            name="chapter"
                            value={formData.chapter}
                            onChange={handleChange}
                            placeholder={formData.subject ? 'Type chapter name…' : 'Select subject first'}
                            required
                            style={{ ...selectStyle, padding: '10px 12px' }}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.14)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                        />
                    )}
                </div>
            </div>

            {/* Topic */}
            <div style={fieldStyle}>
                <label style={labelStyle}>Topic</label>
                <div style={{ position: 'relative' }}>
                    {topicOptions.length > 0 ? (
                        <>
                            <select
                                name="topic"
                                value={formData.topic}
                                onChange={handleChange}
                                style={selectStyle}
                                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.14)'; }}
                                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                            >
                                <option value="" style={{ background: '#131c30' }}>All topics</option>
                                {topicOptions.map(t => (
                                    <option key={t} value={t} style={{ background: '#131c30' }}>{t}</option>
                                ))}
                            </select>
                            <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                        </>
                    ) : (
                        <input
                            type="text"
                            name="topic"
                            value={formData.topic}
                            onChange={handleChange}
                            placeholder={formData.chapter ? 'Type topic manually…' : 'Select chapter first'}
                            disabled={!formData.chapter}
                            style={{ ...selectStyle, padding: '10px 12px', opacity: !formData.chapter ? 0.4 : 1 }}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.14)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                        />
                    )}
                </div>
            </div>

            {/* Difficulty & Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                    <label style={labelStyle}>Difficulty</label>
                    <div style={{ position: 'relative' }}>
                        <select
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleChange}
                            style={selectStyle}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.14)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                        >
                            {difficultyOpts.map(d => (
                                <option key={d} value={d} style={{ background: '#131c30' }}>{d}</option>
                            ))}
                        </select>
                        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>Type</label>
                    <div style={{ position: 'relative' }}>
                        <select
                            name="questionType"
                            value={formData.questionType}
                            onChange={handleChange}
                            style={selectStyle}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.14)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                        >
                            {typeOpts.map(t => (
                                <option key={t} value={t} style={{ background: '#131c30' }}>{t}</option>
                            ))}
                        </select>
                        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                    </div>
                </div>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading || !formData.class || !formData.subject || !formData.chapter}
                className="btn-generate"
                style={{ marginTop: 8 }}
            >
                <div className="btn-shine" />
                {isLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                        <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                        Generating…
                    </span>
                ) : 'Generate Questions →'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--muted)', marginTop: 10 }}>
                Powered by Groq + NCERT RAG
            </p>
        </form>
    );
};

export default QuestionForm;