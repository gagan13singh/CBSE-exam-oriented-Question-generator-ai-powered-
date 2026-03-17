/**
 * src/components/ModelBadge.jsx
 * Shows only the active connected AI agent — green dot + name only
 * Shows nothing (invisible) if offline or loading
 */

export default function ModelBadge({ health }) {
    // Still connecting — show nothing
    if (!health) return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 500,
            background: 'rgba(100,116,139,.08)', border: '1px solid rgba(100,116,139,.15)',
            color: 'var(--muted)', opacity: 0.6,
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--muted)', display: 'inline-block' }} />
            Connecting…
        </div>
    );

    const groqOnline = health.services?.groq?.status === 'online';
    const ollamaOnline = health.services?.ollama?.status === 'online';

    // ── Groq online — show in green ──
    if (groqOnline) {
        const model = health.services.groq.model || 'llama-3.3-70b-versatile';
        // Shorten model name for display
        const short = model.replace('llama-', 'Llama ').replace('-versatile', '').replace('-8192', '');
        return (
            <div title={`Groq: ${model}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)',
                color: '#10b981',
            }}>
                <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 6px #10b981',
                    display: 'inline-block',
                    animation: 'pulseDot 2s ease-in-out infinite',
                }} />
                ⚡ Groq · {short}
            </div>
        );
    }

    // ── Ollama fallback — show in amber ──
    if (ollamaOnline) {
        return (
            <div title="Ollama — local fallback" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.2)',
                color: 'var(--gold2)',
            }}>
                <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--gold2)', display: 'inline-block',
                    animation: 'pulseDot 2s ease-in-out infinite',
                }} />
                🐢 Ollama · {health.services.ollama.model || 'llama3'}
            </div>
        );
    }

    // ── Both offline — small red indicator ──
    return (
        <div title="AI service offline" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 500,
            background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)',
            color: '#ef4444',
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            AI Offline
        </div>
    );
}