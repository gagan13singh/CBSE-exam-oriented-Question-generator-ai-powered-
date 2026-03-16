/**
 * src/components/ModelBadge.jsx
 * Shows which AI is serving requests: Groq ⚡ or Ollama 🐢
 */

import React from 'react';

export default function ModelBadge({ health }) {
    if (!health) {
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-400 border border-slate-200 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block"></span>
                Connecting...
            </div>
        );
    }

    const groqOnline = health.services?.groq?.status === 'online';
    const ollamaOnline = health.services?.ollama?.status === 'online';

    if (groqOnline) {
        return (
            <div
                title="Powered by Groq — ultra-fast free cloud inference"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 cursor-default select-none"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block animate-pulse"></span>
                ⚡ Groq · {health.services.groq.model || 'llama-3.3-70b'}
            </div>
        );
    }

    if (ollamaOnline) {
        return (
            <div
                title="Using local Ollama — slower but fully offline"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 cursor-default select-none"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                🐢 Ollama · {health.services.ollama.model || 'llama3'}
            </div>
        );
    }

    return (
        <div
            title="AI service unavailable"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 cursor-default select-none"
        >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
            ⚠ AI Offline
        </div>
    );
}
