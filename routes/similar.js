/**
 * routes/similar.js
 * POST /api/v1/questions/similar            — from pasted text
 * POST /api/v1/questions/similar-from-image — from uploaded image
 */

const express = require('express');
const fs      = require('fs');
const path    = require('path');
const router  = express.Router();

const { callLLM } = require('../services/llm');
const { generateLimiter } = require('../middleware/rateLimiter');

// ── Safe multer load (won't crash server if not installed) ────────────────────
let multer = null;
let imageUpload = null;

try {
    multer = require('multer');
    imageUpload = multer({
        dest: path.join(__dirname, '..', 'uploads', 'tmp'),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) cb(null, true);
            else cb(new Error('Only image files accepted.'));
        },
    });
    console.log('[similar.js] multer loaded ✅');
} catch (e) {
    console.warn('[similar.js] multer not installed — image upload disabled. Run: npm install multer');
}

// ── Prompt builder ────────────────────────────────────────────────────────────
function buildSimilarPrompt(question, count, difficulty) {
    const diffInstruction = {
        Easier: 'Generate EASIER questions — simpler numbers, fewer steps.',
        Same:   'Generate questions of the SAME difficulty as the original.',
        Harder: 'Generate HARDER questions — more complex, multi-step.',
    }[difficulty] || 'Generate questions of the SAME difficulty.';

    return `You are a CBSE expert question setter.

A student provided this question:
--- STUDENT QUESTION ---
${question}
--- END ---

TASK: Generate exactly ${count} SIMILAR practice questions that:
1. Test the same concept as the student's question
2. Use different numbers, scenarios, or angles (NOT a copy)
3. ${diffInstruction}
4. Follow CBSE exam pattern

RULES:
- All math in LaTeX single dollar signs: $F = ma$
- Double-escape backslashes in JSON strings: $\\\\frac{1}{2}$
- Do NOT repeat the original question

OUTPUT: Valid JSON only. No markdown. No explanation.

{
  "original_concept": "Brief concept name",
  "questions": [
    {
      "question_type": "Numerical",
      "marks": 3,
      "question": "Question text...",
      "answer": "Step-by-step solution...",
      "key_points": ["Point 1", "Point 2"],
      "related_formulas": ["$F = ma$"],
      "visualization_hint": null
    }
  ]
}`;
}

// ── POST /similar (text) ──────────────────────────────────────────────────────
router.post('/similar', generateLimiter, async (req, res, next) => {
    try {
        const { question, count = 3, difficulty = 'Same' } = req.body;

        if (!question || String(question).trim().length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid question (at least 10 characters).',
            });
        }

        const countNum = Math.min(Math.max(parseInt(count) || 3, 1), 10);
        const prompt   = buildSimilarPrompt(String(question).trim(), countNum, difficulty);

        const { result, model, provider } = await callLLM(prompt);

        if (!result.questions || !Array.isArray(result.questions)) {
            throw new Error('AI returned unexpected format. Please try again.');
        }

        return res.json({
            success: true,
            data: result.questions,
            meta: {
                original_concept: result.original_concept || 'Unknown',
                count: result.questions.length,
                difficulty,
                model,
                provider,
                generated_at: new Date().toISOString(),
            },
        });

    } catch (err) {
        next(err);
    }
});

// ── POST /similar-from-image ──────────────────────────────────────────────────
router.post('/similar-from-image', generateLimiter, (req, res, next) => {
    // If multer not installed, return friendly error
    if (!imageUpload) {
        return res.status(503).json({
            success: false,
            error: 'Image upload requires multer. Run: npm install multer, then restart the server.',
        });
    }

    imageUpload.single('image')(req, res, async (uploadErr) => {
        if (uploadErr) return next(uploadErr);

        const tmpPath = req.file?.path;

        try {
            if (!req.file) {
                return res.status(400).json({ success: false, error: 'No image uploaded.' });
            }

            const { count = 3, difficulty = 'Same' } = req.body;
            const countNum = Math.min(Math.max(parseInt(count) || 3, 1), 10);

            const GROQ_API_KEY = process.env.GROQ_API_KEY;
            if (!GROQ_API_KEY) {
                throw new Error('Groq API key not set. Image upload requires Groq vision model.');
            }

            // Convert image to base64
            const imageBuffer = fs.readFileSync(tmpPath);
            const base64Image = imageBuffer.toString('base64');
            const mimeType    = req.file.mimetype || 'image/jpeg';

            // Extract question text via Groq vision
            const visionRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.2-11b-vision-preview',
                    messages: [{
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: { url: `data:${mimeType};base64,${base64Image}` },
                            },
                            {
                                type: 'text',
                                text: 'Extract the exact question text from this image. Return ONLY the question text, nothing else.',
                            },
                        ],
                    }],
                    max_tokens: 500,
                }),
                signal: AbortSignal.timeout(20000),
            });

            if (!visionRes.ok) {
                const errData = await visionRes.json();
                throw new Error(`Vision model error: ${errData.error?.message || visionRes.status}`);
            }

            const visionData    = await visionRes.json();
            const extractedText = visionData.choices?.[0]?.message?.content?.trim();

            if (!extractedText || extractedText.length < 10) {
                throw new Error('Could not extract question from the image. Please type it instead.');
            }

            // Generate similar questions
            const prompt = buildSimilarPrompt(extractedText, countNum, difficulty);
            const { result, model, provider } = await callLLM(prompt);

            if (!result.questions || !Array.isArray(result.questions)) {
                throw new Error('AI returned unexpected format. Please try again.');
            }

            fs.unlinkSync(tmpPath);

            return res.json({
                success: true,
                data: result.questions,
                meta: {
                    original_concept: result.original_concept || 'Unknown',
                    extracted_question: extractedText,
                    count: result.questions.length,
                    difficulty,
                    model,
                    provider,
                    generated_at: new Date().toISOString(),
                },
            });

        } catch (err) {
            if (tmpPath && fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
            next(err);
        }
    });
});

module.exports = router;