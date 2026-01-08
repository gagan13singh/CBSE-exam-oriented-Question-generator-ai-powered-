import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const StreamingText = ({ text, speed = 10, className }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        setIsComplete(false);
        setDisplayedText('');

        if (!text) return;

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
    }, [text, speed]);

    return (
        <span className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    p: ({ children }) => <span className="inline">{children}</span> // Render paragraphs as spans to maintain inline flow where needed
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
