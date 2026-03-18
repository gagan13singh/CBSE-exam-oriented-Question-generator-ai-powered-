const express = require('express');
const router = express.Router();
const cache = require('../services/cache');

// Cache the health result for 60 seconds
// so 100 users hitting the page don't each trigger a Groq API call
let cachedHealth = null;
let lastChecked = 0;
const CACHE_TTL = 60_000; // 1 minute

async function getLiveHealth() {
    const now = Date.now();
    if (cachedHealth && (now - lastChecked) < CACHE_TTL) {
        return cachedHealth; // serve from cache
    }

    // Just check if the key exists — don't call Groq API
    const groqConfigured = !!process.env.GROQ_API_KEY;

    cachedHealth = {
        status: groqConfigured ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        services: {
            groq: {
                status: groqConfigured ? 'online' : 'unconfigured',
                model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            },
            ollama: { status: 'offline' }, // not available in production
        },
        cache: cache.stats(),
        environment: process.env.NODE_ENV || 'development',
    };
    lastChecked = now;
    return cachedHealth;
}

router.get('/', async (req, res) => {
    // Respond immediately — don't await slow external calls
    res.set('Cache-Control', 'public, max-age=30'); // CDN/browser can cache too
    const health = await getLiveHealth();
    res.json(health);
});

module.exports = router;