import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const PracticeTestInterface = ({ testData, onSubmit, onBack }) => {
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(testData.time_allowed_mins * 60); // in seconds
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Auto submit
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

    const handleSubmit = async () => {
        setSubmitting(true);
        // Transform answers into required format for grading
        const submissions = [];

        testData.sections.forEach(section => {
            section.questions.forEach(q => {
                submissions.push({
                    question_id: q.id,
                    question: q.question,
                    model_answer: q.correct_option || q.model_answer || "Refer to text.",
                    student_answer: answers[q.id] || "No Answer",
                    marks: q.marks
                });
            });
        });

        await onSubmit(submissions);
        setSubmitting(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header / Timer */}
            <div className="sticky top-4 z-30 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 p-4 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{testData.title || "Practice Test"}</h2>
                    <p className="text-sm text-slate-500">Answer all questions to the best of your ability.</p>
                </div>
                <div className={`text-2xl font-mono font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            {testData.sections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">
                        {section.name}
                    </h3>

                    {section.questions.map((q, qIdx) => (
                        <div key={q.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-4">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-sm">
                                    Q{qIdx + 1}
                                </span>
                                <span className="text-sm font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                    {q.marks} Mark{q.marks > 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="prose prose-slate max-w-none mb-6">
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={{
                                        p: ({ node, ...props }) => <p className="text-lg text-slate-800 leading-relaxed" {...props} />
                                    }}
                                >
                                    {q.question}
                                </ReactMarkdown>
                            </div>

                            {/* Input Area */}
                            <div>
                                {q.type === 'MCQ' && q.options ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {q.options.map((opt, i) => (
                                            <label key={i} className={`
                                                flex items-center p-4 rounded-xl border cursor-pointer transition-all
                                                ${answers[q.id] === opt ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-500' : 'border-slate-200 hover:bg-slate-50'}
                                            `}>
                                                <input
                                                    type="radio"
                                                    name={q.id}
                                                    value={opt}
                                                    checked={answers[q.id] === opt}
                                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                    className="w-4 h-4 text-violet-600 border-slate-300 focus:ring-violet-500"
                                                />
                                                <span className="ml-3 font-medium text-slate-700">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <textarea
                                        className="w-full p-4 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all placeholder-slate-400 text-slate-700 min-h-[120px]"
                                        placeholder="Type your answer here..."
                                        value={answers[q.id] || ''}
                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    ></textarea>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            <div className="flex gap-4 pt-8 border-t border-slate-200">
                <button
                    onClick={onBack}
                    className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Submitting & Grading...' : 'Submit Test'}
                </button>
            </div>
        </div>
    );
};

export default PracticeTestInterface;
