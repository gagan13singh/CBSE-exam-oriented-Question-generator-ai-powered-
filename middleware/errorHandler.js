/**
 * middleware/errorHandler.js
 * Centralized error handling - keeps stack traces out of student-facing responses.
 */

function errorHandler(err, req, res, next) {
    const isDev = process.env.NODE_ENV !== 'production';

    console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
    if (isDev) console.error(err.stack);

    // Zod validation errors
    if (err.name === 'ZodError') {
        return res.status(400).json({
            error: 'Invalid request. Please check your input.',
            details: err.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        });
    }

    // LLM failures
    if (err.message?.includes('Groq') || err.message?.includes('Ollama') || err.message?.includes('AI')) {
        return res.status(503).json({
            error: 'AI service is temporarily unavailable. Please try again in a moment.',
            ...(isDev && { details: err.message })
        });
    }

    // Default
    res.status(err.status || 500).json({
        error: err.message || 'Something went wrong. Please try again.',
        ...(isDev && { stack: err.stack })
    });
}

module.exports = errorHandler;
