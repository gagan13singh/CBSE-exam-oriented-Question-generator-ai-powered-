/**
 * services/llm.js
 * Smart LLM Router: Groq (free cloud) → Ollama (local fallback)
 * UPDATED: Added callLLMText() for plain-text responses (Doubt Engine)
 */

const Groq = require('groq-sdk');

const OLLAMA_API_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const GROQ_MODEL     = process.env.GROQ_MODEL  || 'llama-3.3-70b-versatile';
const OLLAMA_MODEL   = process.env.OLLAMA_MODEL || 'llama3';
const USE_GROQ       = process.env.USE_GROQ !== 'false';

let groqClient = null;

function getGroqClient() {
    if (!groqClient && process.env.GROQ_API_KEY) {
        groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groqClient;
}

/**
 * Call Groq with automatic retry on rate limit (429)
 * Retries: attempt 1 waits 1s, attempt 2 waits 2s, then gives up → Ollama
 */
async function callGroqWithRetry(prompt, retries = 2) {
    const client = getGroqClient();
    if (!client) throw new Error('GROQ_API_KEY not configured');

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const completion = await client.chat.completions.create({
                model: GROQ_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert CBSE exam paper setter. Always respond with valid JSON only. No markdown, no explanation. Just the JSON object.',
                    },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.7,
                max_tokens: 2000,
                response_format: { type: 'json_object' },
            });

            const text = completion.choices[0]?.message?.content;
            if (!text) throw new Error('Groq returned empty response');
            return parseAndRepairJSON(text);

        } catch (err) {
            const isRateLimit = err?.status === 429 || err?.message?.includes('rate limit');
            const isLastTry   = attempt === retries;

            if (isLastTry || !isRateLimit) throw err;

            const delay = 1000 * Math.pow(2, attempt);
            console.warn(`[Groq] Rate limited. Retrying in ${delay}ms (attempt ${attempt + 1}/${retries})...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

/**
 * ── NEW: Call Groq for PLAIN TEXT (no JSON format enforcement)
 * Used by the Doubt Engine.
 */
async function callGroqText(systemPrompt, userPrompt, retries = 2) {
    const client = getGroqClient();
    if (!client) throw new Error('GROQ_API_KEY not configured');

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const completion = await client.chat.completions.create({
                model: GROQ_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user',   content: userPrompt },
                ],
                temperature: 0.6,
                max_tokens: 800,
                // No response_format — plain text
            });

            const text = completion.choices[0]?.message?.content;
            if (!text) throw new Error('Groq returned empty response');
            return text.trim();

        } catch (err) {
            const isRateLimit = err?.status === 429 || err?.message?.includes('rate limit');
            const isLastTry   = attempt === retries;
            if (isLastTry || !isRateLimit) throw err;
            const delay = 1000 * Math.pow(2, attempt);
            console.warn(`[Groq/Text] Rate limited. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

/**
 * Call Ollama (local fallback) — JSON mode
 */
async function callOllama(prompt) {
    const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt,
            stream: false,
            format: 'json',
        }),
    });

    if (!response.ok) {
        throw new Error(`Ollama returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return parseAndRepairJSON(data.response);
}

/**
 * ── NEW: Call Ollama for PLAIN TEXT (no JSON format)
 */
async function callOllamaText(prompt) {
    const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt,
            stream: false,
            // No format: 'json'
        }),
    });

    if (!response.ok) {
        throw new Error(`Ollama returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return (data.response || '').trim();
}

/**
 * Parse JSON — repairs common LaTeX escape issues
 */
function parseAndRepairJSON(text) {
    if (!text) throw new Error('Empty response from LLM');

    let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        // Fix unescaped LaTeX backslashes
        cleaned = cleaned
            .replace(/\\frac/g, '\\\\frac')
            .replace(/\\sqrt/g, '\\\\sqrt')
            .replace(/\\theta/g, '\\\\theta')
            .replace(/\\alpha/g, '\\\\alpha')
            .replace(/\\beta/g, '\\\\beta')
            .replace(/\\gamma/g, '\\\\gamma')
            .replace(/\\delta/g, '\\\\delta')
            .replace(/\\lambda/g, '\\\\lambda')
            .replace(/\\sigma/g, '\\\\sigma')
            .replace(/\\omega/g, '\\\\omega')
            .replace(/\\pi/g, '\\\\pi')
            .replace(/\\mu/g, '\\\\mu')
            .replace(/\\epsilon/g, '\\\\epsilon')
            .replace(/\\phi/g, '\\\\phi')
            .replace(/\\vec/g, '\\\\vec')
            .replace(/\\hat/g, '\\\\hat')
            .replace(/\\cdot/g, '\\\\cdot')
            .replace(/\\times/g, '\\\\times')
            .replace(/\\int/g, '\\\\int')
            .replace(/\\sum/g, '\\\\sum')
            .replace(/\\lim/g, '\\\\lim')
            .replace(/\\infty/g, '\\\\infty')
            .replace(/\\partial/g, '\\\\partial')
            .replace(/\\sin/g, '\\\\sin')
            .replace(/\\cos/g, '\\\\cos')
            .replace(/\\tan/g, '\\\\tan')
            .replace(/\\log/g, '\\\\log')
            .replace(/\\ln/g, '\\\\ln')
            .replace(/\\boldsymbol/g, '\\\\boldsymbol')
            .replace(/\\rho/g, '\\\\rho')
            .replace(/\\nu/g, '\\\\nu')
            .replace(/\\tau/g, '\\\\tau');

        try {
            return JSON.parse(cleaned);
        } catch (e2) {
            // Last resort
            cleaned = cleaned.replace(/\\(?!["\\\/bfnrtu])/g, '\\\\');
            return JSON.parse(cleaned);
        }
    }
}

/**
 * Main router: Groq (with retry) → Ollama fallback — JSON mode
 */
async function callLLM(prompt) {
    if (USE_GROQ && process.env.GROQ_API_KEY) {
        try {
            console.log(`--> 🚀 Calling Groq (${GROQ_MODEL})...`);
            const result = await callGroqWithRetry(prompt);
            console.log('--> ✅ Groq responded successfully');
            return { result, model: GROQ_MODEL, provider: 'groq' };
        } catch (err) {
            console.warn(`--> ⚠️  Groq failed (${err.message}). Falling back to Ollama...`);
        }
    }

    console.log(`--> 🐢 Calling Ollama (${OLLAMA_MODEL})...`);
    const result = await callOllama(prompt);
    console.log('--> ✅ Ollama responded successfully');
    return { result, model: OLLAMA_MODEL, provider: 'ollama' };
}

/**
 * ── NEW: Plain-text router for Doubt Engine
 * Groq (text) → Ollama text fallback
 */
async function callLLMText(systemPrompt, userPrompt) {
    if (USE_GROQ && process.env.GROQ_API_KEY) {
        try {
            console.log(`--> 🚀 [Text] Calling Groq (${GROQ_MODEL})...`);
            const result = await callGroqText(systemPrompt, userPrompt);
            console.log('--> ✅ [Text] Groq responded successfully');
            return { result, model: GROQ_MODEL, provider: 'groq' };
        } catch (err) {
            console.warn(`--> ⚠️  [Text] Groq failed (${err.message}). Falling back to Ollama...`);
        }
    }

    // Ollama text fallback — combine prompts
    const combined = `${systemPrompt}\n\n${userPrompt}`;
    console.log(`--> 🐢 [Text] Calling Ollama (${OLLAMA_MODEL})...`);
    const result = await callOllamaText(combined);
    console.log('--> ✅ [Text] Ollama responded successfully');
    return { result, model: OLLAMA_MODEL, provider: 'ollama' };
}

/**
 * Health check for both providers
 */
async function checkHealth() {
    const health = {
        groq:   { status: 'unconfigured', model: GROQ_MODEL },
        ollama: { status: 'unknown',      model: OLLAMA_MODEL },
    };

    if (process.env.GROQ_API_KEY) {
        try {
            const client = getGroqClient();
            await client.models.list();
            health.groq = { status: 'online', model: GROQ_MODEL };
        } catch (e) {
            health.groq = { status: 'error', error: e.message, model: GROQ_MODEL };
        }
    }

    try {
        const resp = await fetch('http://localhost:11434/api/tags', {
            signal: AbortSignal.timeout(3000),
        });
        if (resp.ok) {
            const data   = await resp.json();
            const models = data.models?.map(m => m.name) || [];
            health.ollama = { status: 'online', models, model: OLLAMA_MODEL };
        }
    } catch (e) {
        health.ollama = { status: 'offline', error: e.message, model: OLLAMA_MODEL };
    }

    return health;
}

module.exports = { callLLM, callLLMText, checkHealth, parseAndRepairJSON };