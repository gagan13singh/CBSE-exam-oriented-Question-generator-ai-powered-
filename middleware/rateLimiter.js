/**
 * middleware/rateLimiter.js
 */

const rateLimit = require('express-rate-limit');

// For AI generation endpoints (heavy compute)
const generateLimiter = rateLimit({
    windowMs: 60 * 1000,       // 1 minute window
    max: 20,                   // 20 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests. Please wait a moment before generating more questions.',
        retryAfter: 60
    },
    skip: (req) => {
        // Skip rate limiting in development
        return process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true';
    }
});

// For grading endpoint (lighter, but still protect it)
const gradeLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many grading requests. Please wait a moment.',
        retryAfter: 60
    }
});

module.exports = { generateLimiter, gradeLimiter };
