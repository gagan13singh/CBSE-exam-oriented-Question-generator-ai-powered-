/**
 * routes/doubt.js
 * POST /api/v1/doubt
 *
 * Contextual doubt engine — student asks a question about a generated
 * question. The LLM receives full context (subject, chapter, topic,
 * the question text + conversation history) so it answers like a real
 * CBSE tutor without the student needing to re-explain anything.
 */

const express = require('express');
const router  = express.Router();

const { callLLMText } = require('../services/llm');
const { gradeLimiter } = require('../middleware/rateLimiter'); // reuse — same weight class

// ─────────────────────────────────────────────────────────────────────────────
//  System prompt (static — sent as Groq's system role)
// ─────────────────────────────────────────────────────────────────────────────
const TUTOR_SYSTEM = `You are an expert, patient CBSE tutor for classes 9–12.
Your job is to resolve a student's specific doubt about a question they are looking at.

Rules:
- Answer ONLY the student's doubt. Do not re-explain things already covered.
- Be concise but complete — 3 to 8 sentences unless a step-by-step solution is needed.
- For math/physics formulas always use LaTeX in single dollar signs: $F = ma$
- Double-escape backslashes in LaTeX: $\\frac{1}{2}mv^2$
- Match the student's class level — not too advanced, not too simple.
- Never say "Great question!" or filler phrases.
- End with one short follow-up to check understanding, e.g. "Does that help?" or "Want me to show a worked example?"
- Output plain text only. No JSON. No markdown headers or bullet points unless listing steps.`;

// ─────────────────────────────────────────────────────────────────────────────
//  User prompt builder
// ─────────────────────────────────────────────────────────────────────────────
function buildUserPrompt({ subject, chapter, topic, studentClass, questionText, history, doubt }) {
    const contextLines = [
        `Subject: ${subject || 'General'} | Class: ${studentClass || '9-12'}`,
        chapter ? `Chapter: ${chapter}${topic ? ` → ${topic}` : ''}` : '',
        '',
        'The student is looking at this question:',
        '--- QUESTION ---',
        questionText || '(no question provided)',
        '--- END ---',
    ].filter(Boolean).join('\n');

    const historyBlock = history && history.length
        ? '\nConversation so far:\n' +
          history.map(m => `${m.role === 'student' ? 'Student' : 'Tutor'}: ${m.text}`).join('\n')
        : '';

    return `${contextLines}${historyBlock}\n\nStudent's doubt: "${doubt}"`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/v1/doubt
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', gradeLimiter, async (req, res, next) => {
    try {
        const {
            doubt,
            questionText = '',
            subject      = '',
            chapter      = '',
            topic        = '',
            studentClass = '',
            history      = [],   // [{ role: 'student'|'tutor', text: string }]
        } = req.body;

        // ── Validation ────────────────────────────────────────────────────────
        if (!doubt || String(doubt).trim().length < 3) {
            return res.status(400).json({
                success: false,
                error: 'Please type your doubt (at least 3 characters).',
            });
        }
        if (history.length > 20) {
            return res.status(400).json({
                success: false,
                error: 'Conversation too long. Please start a new doubt session.',
            });
        }

        // ── Build prompts ─────────────────────────────────────────────────────
        const userPrompt = buildUserPrompt({
            subject,
            chapter,
            topic,
            studentClass,
            questionText : String(questionText).substring(0, 800),
            history,
            doubt        : String(doubt).trim().substring(0, 500),
        });

        // ── Call LLM (plain text mode) ────────────────────────────────────────
        const { result: reply, model, provider } = await callLLMText(TUTOR_SYSTEM, userPrompt);

        return res.json({
            success : true,
            reply,
            meta    : { model, provider, ts: new Date().toISOString() },
        });

    } catch (err) {
        next(err);
    }
});

module.exports = router;