/**
 * routes/health.js
 * GET /api/health
 * Returns status of Groq, Ollama, and ChromaDB for monitoring.
 */

const express = require('express');
const router = express.Router();

const { checkHealth } = require('../services/llm');
const cache = require('../services/cache');

router.get('/', async (req, res) => {
    const start = Date.now();

    const [llmHealth] = await Promise.allSettled([checkHealth()]);

    const health = llmHealth.status === 'fulfilled' ? llmHealth.value : { groq: { status: 'error' }, ollama: { status: 'error' } };

    // Overall status: OK if at least one LLM is online
    const isGroqOk = health.groq?.status === 'online';
    const isOllamaOk = health.ollama?.status === 'online';
    const overallStatus = isGroqOk || isOllamaOk ? 'ok' : 'degraded';

    res.json({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        responseTime: `${Date.now() - start}ms`,
        services: {
            groq: health.groq,
            ollama: health.ollama
        },
        cache: cache.stats(),
        environment: process.env.NODE_ENV || 'development'
    });
});

module.exports = router;
