/**
 * services/llm.js
 * Smart LLM Router: Groq (free cloud) → Ollama (local fallback)
 *
 * Groq Free Tier:
 *  - llama-3.3-70b-versatile: 6,000 req/day, 500K tokens/day
 *  - Response time: ~2-4 seconds (vs 30-60s on local Ollama CPU)
 *  - Cost: $0 — no credit card needed
 */

const Groq = require('groq-sdk');

const OLLAMA_API_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';
const USE_GROQ = process.env.USE_GROQ !== 'false'; // default: true

let groqClient = null;

function getGroqClient() {
    if (!groqClient && process.env.GROQ_API_KEY) {
        groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groqClient;
}

/**
 * Call Groq API (free, fast)
 */
async function callGroq(prompt) {
    const client = getGroqClient();
    if (!client) throw new Error('GROQ_API_KEY not configured');

    const completion = await client.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
            {
                role: 'system',
                content: 'You are an expert CBSE exam paper setter. Always respond with valid JSON only. No markdown, no explanation. Just the JSON object.'
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.7,
        max_tokens: 4096,
        response_format: { type: 'json_object' }
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) throw new Error('Groq returned empty response');

    return parseAndRepairJSON(text);
}

/**
 * Call Ollama API (local fallback)
 */
async function callOllama(prompt) {
    const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt: prompt,
            stream: false,
            format: 'json'
        })
    });

    if (!response.ok) {
        throw new Error(`Ollama returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return parseAndRepairJSON(data.response);
}

/**
 * Parse JSON with LaTeX backslash repair
 */
function parseAndRepairJSON(text) {
    if (!text) throw new Error('Empty response from LLM');

    // Strip markdown code fences if present
    let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        // Repair common LaTeX escape issues in JSON strings
        cleaned = cleaned
            .replace(/\\frac/g, '\\\\frac')
            .replace(/\\boldsymbol/g, '\\\\boldsymbol')
            .replace(/\\tau/g, '\\\\tau')
            .replace(/\\rho/g, '\\\\rho')
            .replace(/\\nu/g, '\\\\nu')
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
            .replace(/\\psi/g, '\\\\psi')
            .replace(/\\vec/g, '\\\\vec')
            .replace(/\\hat/g, '\\\\hat')
            .replace(/\\cdot/g, '\\\\cdot')
            .replace(/\\times/g, '\\\\times')
            .replace(/\\sqrt/g, '\\\\sqrt')
            .replace(/\\int/g, '\\\\int')
            .replace(/\\sum/g, '\\\\sum')
            .replace(/\\lim/g, '\\\\lim')
            .replace(/\\infty/g, '\\\\infty')
            .replace(/\\partial/g, '\\\\partial')
            .replace(/\\sin/g, '\\\\sin')
            .replace(/\\cos/g, '\\\\cos')
            .replace(/\\tan/g, '\\\\tan')
            .replace(/\\log/g, '\\\\log')
            .replace(/\\ln/g, '\\\\ln');

        try {
            return JSON.parse(cleaned);
        } catch (e2) {
            // Last resort: escape all unescaped backslashes
            cleaned = cleaned.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
            return JSON.parse(cleaned);
        }
    }
}

/**
 * Main router: Groq → Ollama fallback
 * Returns { result, model, provider }
 */
async function callLLM(prompt) {
    if (USE_GROQ && process.env.GROQ_API_KEY) {
        try {
            console.log(`--> 🚀 Calling Groq (${GROQ_MODEL})...`);
            const result = await callGroq(prompt);
            console.log('--> ✅ Groq responded successfully');
            return { result, model: GROQ_MODEL, provider: 'groq' };
        } catch (err) {
            console.warn(`--> ⚠️  Groq failed (${err.message}). Falling back to Ollama...`);
        }
    }

    // Ollama fallback
    console.log(`--> 🐢 Calling Ollama (${OLLAMA_MODEL})...`);
    const result = await callOllama(prompt);
    console.log('--> ✅ Ollama responded successfully');
    return { result, model: OLLAMA_MODEL, provider: 'ollama' };
}

/**
 * Health check for both providers
 */
async function checkHealth() {
    const health = {
        groq: { status: 'unconfigured', model: GROQ_MODEL },
        ollama: { status: 'unknown', model: OLLAMA_MODEL }
    };

    // Check Groq
    if (process.env.GROQ_API_KEY) {
        try {
            const client = getGroqClient();
            await client.models.list(); // lightweight API call
            health.groq = { status: 'online', model: GROQ_MODEL };
        } catch (e) {
            health.groq = { status: 'error', error: e.message, model: GROQ_MODEL };
        }
    }

    // Check Ollama
    try {
        const resp = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(3000) });
        if (resp.ok) {
            const data = await resp.json();
            const models = data.models?.map(m => m.name) || [];
            health.ollama = { status: 'online', models, model: OLLAMA_MODEL };
        }
    } catch (e) {
        health.ollama = { status: 'offline', error: e.message, model: OLLAMA_MODEL };
    }

    return health;
}

module.exports = { callLLM, checkHealth, parseAndRepairJSON };
