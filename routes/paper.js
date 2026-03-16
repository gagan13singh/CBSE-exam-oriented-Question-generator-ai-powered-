/**
 * routes/paper.js
 * POST /api/v1/paper/generate
 */

const express = require('express');
const router = express.Router();

const { callLLM } = require('../services/llm');
const cache = require('../services/cache');
const { buildPaperPrompt } = require('../services/prompt-builder');
const { retrieveNCERTContext } = require('../rag/retriever');
const { validate, paperSchema } = require('../middleware/validate');
const { generateLimiter } = require('../middleware/rateLimiter');

router.post('/generate', generateLimiter, validate(paperSchema), async (req, res, next) => {
    try {
        const { class: studentClass, subject, chapters, totalQuestions, difficulty, questionTypes } = req.body;

        // Retrieve NCERT context for the first chapter
        const ncertContext = await retrieveNCERTContext({
            subject,
            studentClass,
            chapter: chapters[0],
            topic: chapters[0]
        });

        const prompt = buildPaperPrompt({ studentClass, subject, chapters, totalQuestions, difficulty, questionTypes, ncertContext });

        // Cache check
        const cached = cache.get('paper', prompt);
        if (cached) {
            return res.json({ success: true, data: cached.paper, meta: { ...cached.meta, cache: true } });
        }

        // LLM call
        const { result: aiResponse, model, provider } = await callLLM(prompt);

        if (aiResponse.error) {
            return res.status(400).json({ error: aiResponse.error });
        }

        const meta = {
            generated_at: new Date().toISOString(),
            model,
            provider,
            rag_source: ncertContext ? 'NCERT' : 'Internal Knowledge',
            cache: false
        };

        cache.set('paper', prompt, { paper: aiResponse, meta });
        res.json({ success: true, data: aiResponse, meta });

    } catch (err) {
        next(err);
    }
});

module.exports = router;
