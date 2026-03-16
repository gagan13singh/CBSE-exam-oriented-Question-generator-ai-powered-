import React, { useState, useEffect } from 'react';
import CustomDropdown from './CustomDropdown';

const QuestionForm = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        class: '',
        subject: '',
        chapter: '',
        topic: '',
        difficulty: '',
        questionType: ''
    });

    const [syllabus, setSyllabus] = useState(null);
    const [loadingSyllabus, setLoadingSyllabus] = useState(true);

    // Fetch Syllabus on mount
    useEffect(() => {
        fetch('http://localhost:3000/api/v1/syllabus')
            .then(res => res.json())
            .then(data => {
                if (data.success) setSyllabus(data.data);
                setLoadingSyllabus(false);
            })
            .catch(err => {
                console.error("Failed to load syllabus", err);
                setLoadingSyllabus(false);
            });
    }, []);

    // Update subject when class changes
    useEffect(() => {
        if (!syllabus || !formData.class) return;
        const classData = syllabus[`class_${formData.class}`] || {};
        const availableSubjects = Object.keys(classData);

        if (!availableSubjects.includes(formData.subject)) {
            setFormData(prev => ({
                ...prev,
                subject: '',
                chapter: '',
                topic: ''
            }));
        } else {
            setFormData(prev => ({ ...prev, chapter: '', topic: '' }));
        }
    }, [formData.class, syllabus]);

    // Update chapter when subject changes
    useEffect(() => {
        // Reset downstream
        setFormData(prev => ({ ...prev, chapter: '', topic: '' }));
    }, [formData.subject]);

    // Update topic when chapter changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, topic: '' }));
    }, [formData.chapter]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    // Options for dropdowns
    const classOptions = [
        { value: '9', label: 'Class 9' },
        { value: '10', label: 'Class 10' },
        { value: '11', label: 'Class 11' },
        { value: '12', label: 'Class 12' }
    ];

    const difficultyOptions = [
        { value: 'Easy', label: 'Easy' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Exam-Oriented', label: 'Exam Standard' },
        { value: 'Hard', label: 'HOTS / Hard' }
    ];

    const typeOptions = [
        { value: 'MCQ', label: 'Multiple Choice (MCQ)' },
        { value: 'VSA', label: 'Very Short Answer' },
        { value: 'Subjective', label: 'Short Answer' },
        { value: 'Long Answer', label: 'Long Answer' },
        { value: 'Case-Based', label: 'Case Study' }
    ];

    // Get subject options based on selected class
    const getSubjectOptions = () => {
        if (!syllabus || !formData.class) return [];
        const classData = syllabus[`class_${formData.class}`];
        if (!classData) return [];
        return Object.keys(classData).map(sub => ({ value: sub, label: sub }));
    };
    const subjectOptions = getSubjectOptions();

    // Get chapter options based on Class & Subject
    const getChapterOptions = () => {
        if (!syllabus || !formData.class || !formData.subject) return [];
        const classData = syllabus[`class_${formData.class}`] || {};
        const subjectData = classData[formData.subject] || {};

        return Object.keys(subjectData).map(chapter => ({
            value: chapter,
            label: chapter
        }));
    };
    const chapterOptions = getChapterOptions();

    // Get topic options based on Chapter
    const getTopicOptions = () => {
        if (!syllabus || !formData.class || !formData.subject || !formData.chapter) return [];
        const classData = syllabus[`class_${formData.class}`] || {};
        const subjectData = classData[formData.subject] || {};
        const topics = subjectData[formData.chapter] || [];
        
        return topics.map(topic => ({
            value: topic,
            label: topic
        }));
    };
    const topicOptions = getTopicOptions();

    if (loadingSyllabus) {
        return (
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 p-8 w-full flex justify-center items-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Loading syllabus...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 p-8 w-full transition-all hover:shadow-violet-500/10 hover:border-violet-200">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20 text-white animate-bounce-slow">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Configure</h2>
                    <p className="text-sm text-slate-500 font-medium">Set your parameters</p>
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
                        color="violet"
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
                        color="blue"
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        }
                    />
                </div>

                {/* Chapter & Topic (Cascading) */}
                <div className="space-y-4">
                    {chapterOptions.length > 0 ? (
                        <CustomDropdown
                            label="Chapter"
                            name="chapter"
                            value={formData.chapter}
                            options={chapterOptions}
                            onChange={handleSelectChange}
                            placeholder="Select Chapter"
                            color="cyan"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            }
                        />
                    ) : (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Chapter</label>
                            <input
                                type="text"
                                name="chapter"
                                value={formData.chapter}
                                onChange={handleChange}
                                placeholder="Type manually (Subject data unavailable)"
                                required
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none text-slate-700 font-semibold placeholder-slate-400"
                            />
                        </div>
                    )}

                    {topicOptions.length > 0 ? (
                        <CustomDropdown
                            label="Topic"
                            name="topic"
                            value={formData.topic}
                            options={topicOptions}
                            onChange={handleSelectChange}
                            placeholder="Select Topic"
                            color="teal"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            }
                        />
                    ) : (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Specific Topic</label>
                            <input
                                type="text"
                                name="topic"
                                value={formData.topic}
                                onChange={handleChange}
                                placeholder={formData.chapter ? "Type topic manually" : "Select a chapter first"}
                                disabled={!formData.chapter}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none text-slate-700 font-semibold placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    )}
                </div>

                {/* Difficulty & Type */}
                <div className="grid grid-cols-2 gap-4">
                    <CustomDropdown
                        label="Difficulty"
                        name="difficulty"
                        value={formData.difficulty}
                        options={difficultyOptions}
                        onChange={handleSelectChange}
                        placeholder="Select Difficulty"
                        color="emerald"
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        }
                    />

                    <CustomDropdown
                        label="Type"
                        name="questionType"
                        value={formData.questionType}
                        options={typeOptions}
                        onChange={handleSelectChange}
                        placeholder="Select Type"
                        color="pink"
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        }
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xl shadow-slate-900/20 transform hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 overflow-hidden relative"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <span className="relative flex items-center gap-2">
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <span>Generate Question</span>
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuestionForm;
