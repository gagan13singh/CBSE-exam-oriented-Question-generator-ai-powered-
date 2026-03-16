/**
 * routes/grader.js
 * POST /api/v1/grade
 * Note: Grading is NEVER cached — student answers are unique every time.
 */

const express = require('express');
const router = express.Router();

const { callLLM } = require('../services/llm');
const { buildGradePrompt } = require('../services/prompt-builder');
const { validate, gradeSchema } = require('../middleware/validate');
const { gradeLimiter } = require('../middleware/rateLimiter');

router.post('/', gradeLimiter, validate(gradeSchema), async (req, res, next) => {
    try {
        const { submissions } = req.body;

        const prompt = buildGradePrompt({ submissions });
        const { result: aiResponse, model, provider } = await callLLM(prompt);

        if (aiResponse.error) {
            return res.status(400).json({ error: aiResponse.error });
        }

        res.json({
            success: true,
            data: aiResponse,
            meta: {
                graded_at: new Date().toISOString(),
                model,
                provider,
                questions_graded: submissions.length
            }
        });

    } catch (err) {
        next(err);
    }
});

module.exports = router;
