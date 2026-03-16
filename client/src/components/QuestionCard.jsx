import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import StreamingText from './StreamingText';

const QuestionCard = ({ data, index, animate = false }) => {
    const cardRef = useRef();

    const handleDownload = async () => {
        const element = cardRef.current;
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`CBSE_Question_${index || 1}.pdf`);
    };

    return (
        <div className="w-full animate-fade-in group">
            <div ref={cardRef} className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/60 p-10 md:p-12 relative overflow-hidden transition-all hover:shadow-violet-500/10">

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-100/50 to-fuchsia-100/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-100/50 to-blue-100/50 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

                {/* Header Tags */}
                <div className="relative flex flex-wrap items-center gap-3 mb-8">
                    {index && (
                        <span className="px-4 py-1.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-full">
                            Q{index}
                        </span>
                    )}
                    <span className="px-4 py-1.5 bg-violet-100 text-violet-700 font-bold text-xs uppercase tracking-wider rounded-full border border-violet-200">
                        {data.question_type}
                    </span>
                    <span className="px-4 py-1.5 bg-amber-100 text-amber-700 font-bold text-xs uppercase tracking-wider rounded-full border border-amber-200">
                        {data.marks} Mark{data.marks > 1 ? 's' : ''}
                    </span>
                </div>

                {/* Question Body with LaTeX Support & Streaming */}
                <div className="relative mb-10 prose prose-lg prose-slate max-w-none font-bold text-slate-900">
                    {/* 
                         Note: We only apply streaming to plain string questions for now to avoid parsing issues 
                         with complex markdown structures during the typing effect. 
                         For simply displaying content, ReactMarkdown handles the final output.
                     */}
                    {typeof data.question === 'string' ? (
                        <StreamingText
                            text={data.question}
                            speed={15}
                            className="block"
                            animate={animate}
                        />
                    ) : (
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {String(data.question || '')}
                        </ReactMarkdown>
                    )}
                </div>

                {/* MCQ Options Grid */}
                {data.options && typeof data.options === 'object' && (
                    <div className="relative grid md:grid-cols-2 gap-4 mb-10">
                        {Object.entries(data.options).map(([key, value]) => {
                            const isCorrect = String(data.correct_option).toLowerCase() === key.toLowerCase();
                            return (
                                <div
                                    key={key}
                                    className={`relative flex items-center p-4 rounded-xl border-2 transition-all duration-300 ${isCorrect
                                        ? 'bg-emerald-50/80 border-emerald-400 shadow-sm'
                                        : 'bg-white/50 border-slate-200 hover:border-violet-300'
                                        }`}
                                >
                                    <span className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg font-bold text-sm mr-4 ${isCorrect
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                        : 'bg-slate-200 text-slate-600'
                                        }`}>
                                        {key.toUpperCase()}
                                    </span>
                                    <div className={`font-semibold ${isCorrect ? 'text-emerald-900' : 'text-slate-700'}`}>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkMath]}
                                            rehypePlugins={[rehypeKatex]}
                                        >
                                            {String(value)}
                                        </ReactMarkdown>
                                    </div>
                                    {isCorrect && (
                                        <div className="absolute right-4 text-emerald-500">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Related Formulas (New Feature) */}
                {data.related_formulas && Array.isArray(data.related_formulas) && data.related_formulas.length > 0 && (
                    <div className="mb-8 animate-fade-in delay-100">
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 shadow-sm">
                            <h4 className="flex items-center gap-2 text-amber-800 font-bold mb-3 text-sm uppercase tracking-wider">
                                <span className="text-lg">📐</span> Core Formulas Used
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                {data.related_formulas.map((formula, idx) => (
                                    <div key={idx} className="bg-white px-4 py-2 rounded-lg border border-amber-100 shadow-sm text-slate-800 font-medium font-mono">
                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                            {String(formula)}
                                        </ReactMarkdown>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Visualization Hint (New Feature) */}
                {data.visualization_hint && (
                    <div className="mb-8 animate-fade-in delay-150">
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 shadow-inner relative overflow-hidden group/visual">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/visual:opacity-10 transition-opacity">
                                <svg className="w-24 h-24 text-indigo-900" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                            </div>
                            <h4 className="flex items-center gap-2 text-indigo-800 font-bold mb-2 text-sm uppercase tracking-wider relative z-10">
                                <span className="text-lg">👁️</span> Visual Aid
                            </h4>
                            <div className="text-indigo-900/80 italic relative z-10 border-l-4 border-indigo-300 pl-4">
                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                    {String(data.visualization_hint)}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}

                {/* Answer Section */}
                <div className="relative border-t border-slate-100 pt-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-lg">Expert Solution</h4>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Detailed Explanation</p>
                        </div>
                    </div>

                    <div className="cursor-text prose prose-slate max-w-none mb-8">
                        <div className="text-slate-700 leading-relaxed text-lg bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                            {/* Stream answer text if plain string, else render directly */}
                            {typeof data.answer === 'string' ? (
                                <StreamingText text={data.answer} speed={5} className="block" animate={animate} />
                            ) : (
                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                    {String(data.answer || '')}
                                </ReactMarkdown>
                            )}
                        </div>
                    </div>

                    {/* Key Points */}
                    {data.key_points && Array.isArray(data.key_points) && data.key_points.length > 0 && (
                        <div className="bg-slate-50/80 rounded-2xl p-6 md:p-8 border border-slate-100">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="w-2 h-6 bg-violet-500 rounded-full"></span>
                                Marking Scheme Key Points
                            </h4>
                            <ul className="space-y-3">
                                {data.key_points.map((point, idx) => (
                                    <li key={idx} className="flex gap-4 items-start">
                                        <div className="w-6 h-6 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-violet-700 font-bold text-xs">{idx + 1}</span>
                                        </div>
                                        <div className="text-slate-700 font-medium">
                                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                {String(point)}
                                            </ReactMarkdown>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Watermark */}
                <div className="absolute bottom-4 right-8 opacity-20">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">AI</span>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-center">
                <button
                    onClick={handleDownload}
                    className="group bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 flex items-center gap-3"
                >
                    Download PDF
                    <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </button>
            </div>
        </div>
    );
};


export default QuestionCard;
