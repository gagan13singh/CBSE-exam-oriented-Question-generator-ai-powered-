import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const PracticeResult = ({ resultData, onRetry }) => {
    const { total_score, max_total_score, overall_feedback, results } = resultData;
    const percentage = Math.round((total_score / max_total_score) * 100);

    let gradeColor = 'text-red-500';
    if (percentage >= 80) gradeColor = 'text-emerald-500';
    else if (percentage >= 60) gradeColor = 'text-blue-500';
    else if (percentage >= 40) gradeColor = 'text-yellow-500';

    return (
        <div className="animate-slide-up space-y-8 pb-20">
            {/* Score Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500"></div>

                <h2 className="text-3xl font-bold text-slate-800 mb-2">Test Results</h2>

                {/* Disclaimer */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-lg mx-auto mb-8 text-sm text-yellow-800 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span><strong>Note:</strong> Results are AI-generated & strictly estimated.</span>
                </div>

                <div className="flex justify-center items-center mb-6">
                    <div className="relative w-40 h-40">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#e2e8f0"
                                strokeWidth="3"
                            />
                            <path
                                d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={percentage >= 80 ? '#10b981' : percentage >= 60 ? '#3b82f6' : percentage >= 40 ? '#eab308' : '#ef4444'}
                                strokeWidth="3"
                                strokeDasharray={`${percentage}, 100`}
                                className="animate-[dash_1s_ease-out_forwards]"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-4xl font-black ${gradeColor}`}>{total_score}</span>
                            <span className="text-slate-400 text-sm font-semibold">/ {max_total_score}</span>
                        </div>
                    </div>
                </div>

                <div className="text-slate-600 italic mb-6">"{overall_feedback}"</div>

                <button
                    onClick={onRetry}
                    className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                    Try Another Test
                </button>
            </div>

            {/* Detailed Analysis */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 px-2">Detailed Analysis</h3>
                {results.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <span className="font-bold text-slate-700">Question {idx + 1}</span>
                            <div className="flex items-center gap-2">
                                <span className={`font-bold ${item.marks_awarded === item.max_marks ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {item.marks_awarded} / {item.max_marks} Marks
                                </span>
                            </div>
                        </div>

                        {/* Model vs Student Answer */}
                        <div className="grid md:grid-cols-2 gap-6 mb-4">
                            <div className="bg-slate-50 p-4 rounded-xl">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Student Answer</h4>
                                <p className="text-slate-700">{item.student_answer || "No answer provided."}</p>
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Model Answer / Key Points</h4>
                                <div className="prose prose-sm prose-emerald">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                    >
                                        {item.model_answer || "Refer to standard text."}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>

                        {/* Feedback */}
                        {item.feedback && (
                            <div className="mt-4 flex items-start gap-3 text-slate-600 bg-blue-50/50 p-3 rounded-lg">
                                <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-sm">{item.feedback}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PracticeResult;
