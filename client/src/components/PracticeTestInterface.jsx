import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const PracticeTestInterface = ({ testData, onSubmit, onBack }) => {
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(testData.time_allowed_mins * 60); // in seconds
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const questionRefs = useRef({});

    // Prevent background scrolling when modal or grading overlay is open
    useEffect(() => {
        if (showConfirmModal || submitting) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showConfirmModal, submitting]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    executeSubmit(); // Auto submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const scrollToQuestion = (questionId) => {
        questionRefs.current[questionId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const executeSubmit = async () => {
        setSubmitting(true);
        setShowConfirmModal(false);
        const submissions = [];

        testData.sections.forEach(section => {
            section.questions.forEach(q => {
                const rawAnswer = answers[q.id];
                const cleanAnswer = (!rawAnswer || rawAnswer.trim() === '') ? "[NO ANSWER PROVIDED]" : rawAnswer;

                submissions.push({
                    question_id: q.id,
                    question: q.question,
                    model_answer: q.correct_option || q.model_answer || "Refer to text.",
                    student_answer: cleanAnswer,
                    marks: q.marks
                });
            });
        });

        await onSubmit(submissions);
        setSubmitting(false);
    };

    const handleModalSubmit = () => setShowConfirmModal(true);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Calculate answers
    let totalQuestions = 0;
    testData.sections.forEach(s => totalQuestions += s.questions.length);
    const answeredCount = Object.keys(answers).filter(k => answers[k] && answers[k].trim() !== '').length;
    const progressPercent = Math.round((answeredCount / totalQuestions) * 100) || 0;

    let globalQIdx = 1; // Running offset for side panel Q numbers

    return (
        <div className="animate-fade-in pb-20 max-w-7xl mx-auto w-full">
            
            {/* Split Layout Container */}
            <div className="grid lg:grid-cols-12 gap-8 items-start relative">
                
                {/* 1. Main Content Area (Questions) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Mobile Header (Hidden on Desktop) */}
                    <div className="lg:hidden sticky top-4 z-30 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 p-4 flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 line-clamp-1">{testData.title || "Practice Test"}</h2>
                        </div>
                        <div className={`text-2xl font-mono font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    {testData.sections.map((section, sIdx) => (
                        <div key={sIdx} className="space-y-6">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest border-b-2 border-slate-200 pb-3 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                                    {String.fromCharCode(65 + sIdx)}
                                </span>
                                Section {section.name}
                            </h3>

                            {section.questions.map((q, localQIdx) => {
                                const currentNumber = globalQIdx++;
                                const isAnswered = answers[q.id] && answers[q.id].trim() !== '';

                                return (
                                    <div 
                                        key={q.id} 
                                        ref={el => questionRefs.current[q.id] = el}
                                        className={`bg-white rounded-[2rem] p-8 shadow-sm border-2 transition-all duration-300 ${isAnswered ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100'}`}
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-bold text-lg shadow-sm ${isAnswered ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                                    Q{currentNumber}
                                                </span>
                                                {isAnswered && <span className="text-xs font-bold text-emerald-500 uppercase tracking-wide flex items-center gap-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg> Saved</span>}
                                            </div>
                                            <span className="text-sm font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200">
                                                {q.marks} Mark{q.marks > 1 ? 's' : ''}
                                            </span>
                                        </div>

                                        <div className="prose prose-slate prose-lg max-w-none mb-8 font-medium text-slate-800">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkMath]}
                                                rehypePlugins={[rehypeKatex]}
                                            >
                                                {q.question}
                                            </ReactMarkdown>
                                        </div>

                                        {/* Input Area */}
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                                            {q.type === 'MCQ' && q.options ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {q.options.map((opt, i) => (
                                                        <label key={i} className={`
                                                            flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                                                            ${answers[q.id] === opt ? 'border-violet-500 bg-violet-50 text-violet-900 shadow-sm' : 'border-slate-200 hover:border-violet-300 hover:bg-white'}
                                                        `}>
                                                            <input
                                                                type="radio"
                                                                name={q.id}
                                                                value={opt}
                                                                checked={answers[q.id] === opt}
                                                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                                className="w-5 h-5 text-violet-600 border-slate-300 focus:ring-violet-500"
                                                            />
                                                            <span className={`ml-3 font-semibold ${answers[q.id] === opt ? 'text-violet-900' : 'text-slate-700'}`}>{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : (
                                                <textarea
                                                    className={`w-full p-5 rounded-xl border-2 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all placeholder-slate-400 text-slate-700 min-h-[160px] text-lg leading-relaxed shadow-sm ${answers[q.id] && answers[q.id].trim() !== '' ? 'border-emerald-300 bg-white' : 'border-slate-200 bg-white'}`}
                                                    placeholder="Type your detailed answer here..."
                                                    value={answers[q.id] || ''}
                                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                ></textarea>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* 2. Sticky Sidebar (Navigator & Timer) */}
                <div className="lg:col-span-4 sticky top-6 z-20 hidden lg:flex lg:flex-col lg:gap-6 max-h-[calc(100vh-3rem)] overflow-y-auto pb-6 pr-2 custom-scrollbar">
                    {/* Timer Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 text-center relative overflow-hidden group">
                        <div className={`absolute top-0 left-0 w-full h-1.5 ${timeLeft < 300 ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-violet-500 to-indigo-500'}`}></div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Time Remaining</h4>
                        <div className={`text-5xl font-mono font-black tracking-tight ${timeLeft < 300 ? 'text-red-600' : 'text-slate-800'}`}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    {/* Navigator Matrix */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
                        <div className="flex justify-between items-end mb-4">
                            <h4 className="font-bold text-slate-800">Navigator</h4>
                            <span className="text-sm font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-lg">
                                {answeredCount} / {totalQuestions}
                            </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
                            <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
                        </div>

                        <div className="grid grid-cols-5 gap-2.5 mb-8">
                            {(() => {
                                let btnGlobalIdx = 1;
                                return testData.sections.flatMap(s => 
                                    s.questions.map(q => {
                                        const currentNum = btnGlobalIdx++;
                                        const isAns = answers[q.id] && answers[q.id].trim() !== '';
                                        return (
                                            <button
                                                key={`nav-${q.id}`}
                                                onClick={() => scrollToQuestion(q.id)}
                                                title={`Jump to Question ${currentNum}`}
                                                className={`
                                                    w-full aspect-square rounded-xl font-bold text-sm flex items-center justify-center transition-all border-2
                                                    ${isAns 
                                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' 
                                                        : 'bg-white border-slate-200 text-slate-500 hover:border-violet-400 hover:text-violet-600'
                                                    }
                                                `}
                                            >
                                                {currentNum}
                                            </button>
                                        );
                                    })
                                );
                            })()}
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={handleModalSubmit}
                                disabled={submitting}
                                className="w-full py-4 text-center rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative">
                                    {submitting ? 'Grading Test...' : 'Submit Test'}
                                </span>
                            </button>
                            <button
                                onClick={onBack}
                                className="w-full py-3 text-center rounded-xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
                            >
                                Cancel Practice
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile specific floating actions */}
                <div className="lg:hidden fixed bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] z-40">
                    <div className="flex gap-4">
                        <button onClick={onBack} className="px-6 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleModalSubmit}
                            disabled={submitting}
                            className="flex-1 px-6 py-4 rounded-xl font-bold text-white bg-slate-900 shadow-lg transition-all"
                        >
                            {submitting ? 'Grading...' : `Submit (${answeredCount}/${totalQuestions})`}
                        </button>
                    </div>
                </div>
            </div>

            {/* Full-screen Grading Overlay */}
            {submitting && !showConfirmModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-white/95 backdrop-blur-md animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div className="w-20 h-20 border-4 border-slate-100 border-t-violet-600 rounded-full animate-spin mb-8 shadow-xl shadow-violet-600/20"></div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-3">Grading Test...</h2>
                    <p className="text-slate-500 font-medium text-lg animate-pulse max-w-sm text-center">
                        Our AI examiner is thoroughly analyzing your responses. Just a few seconds!
                    </p>
                </div>,
                document.body
            )}

            {/* Submission Confirmation Modal */}
            {showConfirmModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden animate-slide-up border border-slate-100">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto text-red-500">
                           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg> 
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 text-center mb-2">Submit Test?</h3>
                        
                        {answeredCount < totalQuestions ? (
                            <p className="text-center text-red-600 font-medium mb-8">
                                You have <span className="font-bold underline">{totalQuestions - answeredCount} unanswered</span> questions. Are you sure you want to finish early?
                            </p>
                        ) : (
                            <p className="text-center text-slate-500 mb-8">
                                You've answered everything! Ready to see your score?
                            </p>
                        )}
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                            >
                                Keep Reviewing
                            </button>
                            <button 
                                onClick={executeSubmit}
                                className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95"
                            >
                                Yes, Submit
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default PracticeTestInterface;
