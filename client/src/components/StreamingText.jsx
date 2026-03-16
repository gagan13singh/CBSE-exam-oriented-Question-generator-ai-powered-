import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

/**
 * animate=true  → typewriter effect (only on fresh question generation)
 * animate=false → instant full render (when navigating Next/Previous)
 */
const StreamingText = ({ text, speed = 10, className, animate = true }) => {
    const [displayedText, setDisplayedText] = useState(animate ? '' : (text || ''));
    const [isComplete, setIsComplete] = useState(!animate);

    useEffect(() => {
        if (!text) return;

        // No animation — just show text instantly
        if (!animate) {
            setDisplayedText(text);
            setIsComplete(true);
            return;
        }

        // Typewriter animation
        setIsComplete(false);
        setDisplayedText('');
        let index = 0;
        const intervalId = setInterval(() => {
            setDisplayedText((prev) => prev + text.charAt(index));
            index++;
            if (index === text.length) {
                clearInterval(intervalId);
                setIsComplete(true);
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [text, speed, animate]);

    return (
        <span className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    p: ({ children }) => <span className="inline">{children}</span>
                }}
            >
                {displayedText}
            </ReactMarkdown>
            {!isComplete && (
                <span className="animate-pulse inline-block w-1.5 h-4 ml-1 align-middle bg-violet-500 rounded-full" />
            )}
        </span>
    );
};

export default StreamingText;

