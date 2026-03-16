/**
 * routes/questions.js
 * POST /api/v1/questions/generate
 */

const express = require('express');
const router = express.Router();

const { callLLM } = require('../services/llm');
const cache = require('../services/cache');
const { buildQuestionPrompt } = require('../services/prompt-builder');
const { retrieveNCERTContext } = require('../rag/retriever');
const { validateTopic } = require('../agents/syllabus-validator');
const { validate, questionSchema } = require('../middleware/validate');
const { generateLimiter } = require('../middleware/rateLimiter');

router.post('/generate', generateLimiter, validate(questionSchema), async (req, res, next) => {
    try {
        const { class: studentClass, subject, chapter, topic, difficulty } = req.body;

        // Step 1: Syllabus validation (< 5ms, no LLM)
        const validation = validateTopic(studentClass, subject, chapter, topic);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.reason });
        }

        // Step 2: Build prompt
        const ncertContext = await retrieveNCERTContext({ subject, studentClass, chapter, topic });
        const prompt = buildQuestionPrompt({ studentClass, subject, chapter, topic, difficulty, ncertContext });

        // Step 3: Check cache
        const cached = cache.get('question', prompt);
        if (cached) {
            return res.json({ success: true, data: cached.questions, meta: { ...cached.meta, cache: true } });
        }

        // Step 4: Call LLM (Groq → Ollama fallback)
        const { result: aiResponse, model, provider } = await callLLM(prompt);

        // Step 5: Validate AI response shape
        if (aiResponse.valid_topic === false) {
            return res.status(400).json({ error: aiResponse.error || 'Topic not recognized by AI.' });
        }

        let questions = [];
        if (Array.isArray(aiResponse.questions)) {
            questions = aiResponse.questions;
        } else if (typeof aiResponse.questions === 'object' && aiResponse.questions !== null) {
            questions = [aiResponse.questions];
        } else if (Array.isArray(aiResponse)) {
            questions = aiResponse;
        } else {
            questions = [aiResponse];
        }

        const meta = {
            generated_at: new Date().toISOString(),
            model,
            provider,
            rag_source: ncertContext ? 'NCERT' : 'Internal Knowledge',
            count: questions.length,
            cache: false
        };

        // Step 6: Cache and respond
        cache.set('question', prompt, { questions, meta });

        res.json({ success: true, data: questions, meta });

    } catch (err) {
        next(err);
    }
});

module.exports = router;
