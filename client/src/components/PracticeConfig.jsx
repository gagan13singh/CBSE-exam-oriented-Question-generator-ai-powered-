import React, { useState, useEffect } from 'react';
import CustomDropdown from './CustomDropdown';
import { SUBJECTS_BY_CLASS } from '../data/subjectData';
import { NCERT_SYLLABUS } from '../data/ncertData';

const PracticeConfig = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        class: '10',
        subject: 'Science',
        chapters: 'All Chapters', // Default to Full Syllabus
        totalQuestions: '10',
        difficulty: 'Standard'
    });

    // Update subject when class changes to default to first available subject
    useEffect(() => {
        const availableSubjects = SUBJECTS_BY_CLASS[formData.class] || [];
        if (!availableSubjects.includes(formData.subject)) {
            setFormData(prev => ({
                ...prev,
                subject: availableSubjects[0] || '',
                chapters: 'All Chapters'
            }));
        } else {
            // Reset chapters on class change
            setFormData(prev => ({ ...prev, chapters: 'All Chapters' }));
        }
    }, [formData.class]);

    // Reset chapters when subject changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, chapters: '' }));
    }, [formData.subject]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle "All Chapters" or specific chapter
        const chaptersArray = formData.chapters === 'All Chapters' || !formData.chapters
            ? ['All Chapters']
            : [formData.chapters];

        onSubmit({
            ...formData,
            chapters: chaptersArray,
            totalQuestions: parseInt(formData.totalQuestions)
        });
    };

    // Options for dropdowns
    const classOptions = [
        { value: '9', label: 'Class 9' },
        { value: '10', label: 'Class 10' },
        { value: '11', label: 'Class 11' },
        { value: '12', label: 'Class 12' }
    ];

    const difficultyOptions = [
        { value: 'Standard', label: 'Standard (Balanced)' },
        { value: 'Easy', label: 'Easy (Concept Check)' },
        { value: 'Hard', label: 'Hard (HOTS Focused)' }
    ];

    // Get subject options based on selected class
    const subjectOptions = (SUBJECTS_BY_CLASS[formData.class] || []).map(sub => ({
        value: sub,
        label: sub
    }));

    // Get chapter options based on Class & Subject
    const getChapterOptions = () => {
        const classData = NCERT_SYLLABUS[formData.class];
        if (!classData) return [];
        const subjectData = classData[formData.subject];
        if (!subjectData) return [];

        const chapters = Object.keys(subjectData).map(chapter => ({
            value: chapter,
            label: chapter
        }));

        return [
            { value: 'All Chapters', label: 'Full Syllabus (All Chapters)' },
            ...chapters
        ];
    };
    const chapterOptions = getChapterOptions();

    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 p-8 w-full transition-all hover:shadow-violet-500/10 hover:border-violet-200">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-fuchsia-500/20 text-white animate-pulse-slow">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Practice Test</h2>
                    <p className="text-sm text-slate-500 font-medium">Configure your mock exam</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Class & Subject */}
                <div className="grid grid-cols-2 gap-4">
                    <CustomDropdown
                        label="Class"
                        name="class"
                        value={formData.class}
                        options={classOptions}
                        onChange={handleSelectChange}
                        placeholder="Select Class"
                        color="fuchsia"
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        }
                    />

                    <CustomDropdown
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        options={subjectOptions}
                        onChange={handleSelectChange}
                        placeholder="Select Subject"
                        color="fuchsia"
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        }
                    />
                </div>

                {/* Chapters */}
                <div className="space-y-2">
                    {chapterOptions.length > 0 ? (
                        <CustomDropdown
                            label="Chapter Focus"
                            name="chapters"
                            value={formData.chapters}
                            options={chapterOptions}
                            onChange={handleSelectChange}
                            placeholder="Select Chapter Focus"
                            color="purple"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            }
                        />
                    ) : (
                        <div className="relative group">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Chapters</label>
                            <input
                                type="text"
                                name="chapters"
                                value={formData.chapters}
                                onChange={handleChange}
                                placeholder="e.g. Light, Electricity"
                                required
                                className="w-full px-4 py-3 pl-12 bg-white border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-slate-700 font-semibold placeholder-slate-400 group-hover:border-purple-300"
                            />
                            <div className="absolute left-3 top-9 text-purple-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            </div>
                        </div>
                    )}
                </div>

                {/* Questions & Difficulty */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Total Questions</label>
                        <div className="relative group">
                            <input
                                type="number"
                                name="totalQuestions"
                                value={formData.totalQuestions}
                                onChange={handleChange}
                                min="5"
                                max="30"
                                className="w-full px-4 py-3 pl-12 bg-white border border-slate-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none text-slate-700 font-semibold placeholder-slate-400 group-hover:border-pink-300"
                            />
                            <div className="absolute left-3 top-3.5 text-pink-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                            </div>
                        </div>
                    </div>

                    <CustomDropdown
                        label="Difficulty"
                        name="difficulty"
                        value={formData.difficulty}
                        options={difficultyOptions}
                        onChange={handleSelectChange}
                        placeholder="Select Difficulty"
                        color="pink"
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        }
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xl shadow-slate-900/20 transform hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 overflow-hidden relative"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-fuchsia-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <span className="relative flex items-center gap-2">
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Creating Paper...</span>
                                </>
                            ) : (
                                <>
                                    <span>Start Practice Test</span>
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </>
                            )}
                        </span>
                    </button>
                    <p className="text-xs text-center text-slate-400 mt-3">
                        *AI generation might take 30-60s. Results are estimated.
                    </p>
                </div>
            </form>
        </div>
    );
};

export default PracticeConfig;
