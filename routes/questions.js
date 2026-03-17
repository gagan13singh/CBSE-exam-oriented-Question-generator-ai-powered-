/**
 * routes/questions.js
 * POST /api/v1/questions/generate
 *
 * CHANGE: cache.get/set now receives the params object, not the full prompt.
 * This ensures cache keys are stable and topic-specific.
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
const { quotaCheck } = require('../middleware/quota');

router.post(
    '/generate',
    generateLimiter,
    quotaCheck(10),
    validate(questionSchema),
    async (req, res, next) => {
        try {
            const { class: studentClass, subject, chapter, topic, difficulty, questionType } = req.body;

            // ── Step 1: Syllabus validation (< 5ms, no LLM) ──────────────────────
            const validation = validateTopic(studentClass, subject, chapter, topic);
            if (!validation.valid) {
                return res.status(400).json({ error: validation.reason });
            }

            // ── Step 2: Cache key from params (not prompt) ────────────────────────
            // Using params object ensures same topic always hits same cache slot
            const cacheParams = { class: studentClass, subject, chapter, topic, difficulty, questionType };

            const cached = cache.get('question', cacheParams);
            if (cached) {
                return res.json({
                    success: true,
                    data: cached.questions,
                    meta: { ...cached.meta, cache: true },
                });
            }

            // ── Step 3: RAG retrieval ─────────────────────────────────────────────
            const ncertContext = await retrieveNCERTContext({ subject, studentClass, chapter, topic });

            // ── Step 4: Build prompt with topic-locked context ────────────────────
            const prompt = buildQuestionPrompt({ studentClass, subject, chapter, topic, difficulty, ncertContext });

            // ── Step 5: Call LLM ──────────────────────────────────────────────────
            const { result: aiResponse, model, provider } = await callLLM(prompt);

            if (aiResponse.valid_topic === false) {
                return res.status(400).json({
                    error: aiResponse.error || 'Topic not recognized. Try a different chapter or topic.',
                });
            }

            // ── Step 6: Normalise response shape ──────────────────────────────────
            let questions = [];
            if (Array.isArray(aiResponse.questions)) {
                questions = aiResponse.questions;
            } else if (aiResponse.questions && typeof aiResponse.questions === 'object') {
                questions = [aiResponse.questions];
            } else if (Array.isArray(aiResponse)) {
                questions = aiResponse;
            } else {
                questions = [aiResponse];
            }

            // Safety check: if questions are empty after all that, fail gracefully
            if (!questions.length) {
                return res.status(500).json({ error: 'AI returned no questions. Please try again.' });
            }

            const meta = {
                generated_at: new Date().toISOString(),
                model,
                provider,
                rag_source: ncertContext ? 'NCERT' : 'Internal Knowledge',
                count: questions.length,
                cache: false,
            };

            // ── Step 7: Cache by params (not by prompt) ────────────────────────────
            cache.set('question', cacheParams, { questions, meta });

            res.json({ success: true, data: questions, meta });

        } catch (err) {
            next(err);
        }
    });

module.exports = router;