/**
 * src/components/StreamingText.jsx
 * 
 * FIXED: Typewriter plays ONCE on first mount when animate=true.
 * Uses hasRun ref so it NEVER replays on re-renders or prop changes.
 */
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const StreamingText = ({ text, speed = 14, className, animate = false }) => {
    const [displayed, setDisplayed] = useState(animate ? '' : (text || ''));
    const [complete, setComplete] = useState(!animate);
    const hasRun = useRef(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        // No animation — show full text immediately
        if (!animate) {
            setDisplayed(text || '');
            setComplete(true);
            return;
        }

        // Already played once this mount — do nothing
        if (hasRun.current) return;
        hasRun.current = true;

        if (!text) return;

        setComplete(false);
        setDisplayed('');
        let i = 0;

        intervalRef.current = setInterval(() => {
            i++;
            setDisplayed(text.slice(0, i));
            if (i >= text.length) {
                clearInterval(intervalRef.current);
                setComplete(true);
            }
        }, speed);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps = runs once on mount only

    return (
        <span className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{ p: ({ children }) => <span className="inline">{children}</span> }}
            >
                {displayed}
            </ReactMarkdown>
            {!complete && (
                <span style={{
                    display: 'inline-block', width: 2, height: '1em',
                    marginLeft: 3, verticalAlign: 'middle',
                    background: 'var(--accent2, #818cf8)', borderRadius: 1,
                    animation: 'pulseDot .7s ease-in-out infinite',
                }} />
            )}
        </span>
    );
};

export default StreamingText;