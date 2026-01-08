
import React, { useState, useEffect } from 'react';
import factsData from '../data/facts.json';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const LoadingFact = ({ context }) => {
    const [currentFact, setCurrentFact] = useState(null);

    useEffect(() => {
        // Filter facts based on context if available
        let pool = factsData;
        if (context) {
            if (context.class) pool = pool.filter(f => f.class.toString() === context.class.toString() || f.class === "General");
            // Optional: Filter by subject too if strictly needed, but broad subject facts are often better 'trivia'
            // if (context.subject) pool = pool.filter(f => f.subject.toLowerCase() === context.subject.toLowerCase());
        }

        // Fallback to all facts if filter result is empty
        if (pool.length === 0) pool = factsData;

        const getRandomFact = () => pool[Math.floor(Math.random() * pool.length)];

        // Pick a random fact on mount
        setCurrentFact(getRandomFact());

        // Rotate facts every 5s if loading takes long
        const interval = setInterval(() => {
            setCurrentFact(getRandomFact());
        }, 5000);

        return () => clearInterval(interval);
    }, [context]);

    if (!currentFact) return null;

    return (
        <div className="mt-8 mx-auto max-w-lg animate-fade-in px-4">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 shadow-sm relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <span className="text-6xl">💡</span>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${currentFact.class ? 'bg-slate-200 text-slate-600' : 'hidden'
                            }`}>
                            Class {currentFact.class}
                        </span>
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${currentFact.type === 'PYQ' ? 'bg-red-100 text-red-600' :
                            currentFact.type === 'Formula' ? 'bg-blue-100 text-blue-600' :
                                'bg-amber-100 text-amber-700'
                            }`}>
                            {currentFact.subject} • {currentFact.type}
                        </span>
                    </div>

                    <div className="text-slate-800 text-sm font-medium leading-relaxed">
                        <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                                p: ({ node, ...props }) => <p {...props} className="inline" />
                            }}
                        >
                            {currentFact.fact}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingFact;
