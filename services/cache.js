/**
 * services/cache.js
 *
 * FIXES applied:
 *  OLD: Cache key = SHA-256 of the full prompt (includes NCERT context).
 *       Problem: Two requests for the same topic but different RAG results
 *       get different hashes → cache miss → new LLM call with wrong context.
 *       OR same RAG context for different topics → cache HIT with wrong answer.
 *
 *  NEW: Cache key = SHA-256 of (type + class + subject + chapter + topic + difficulty).
 *       The NCERT context is intentionally excluded from the key.
 *       Result: same topic always hits the same cache slot, regardless of
 *       which RAG chunks were retrieved. First response for a topic is cached;
 *       subsequent requests for the same topic get the cached (correct) answer.
 */

const NodeCache = require('node-cache');
const crypto = require('crypto');

// Questions: 1-hour TTL, max 500 entries
const questionCache = new NodeCache({ stdTTL: 3600, checkperiod: 600, maxKeys: 500 });

// Papers: 30-minute TTL (heavier generation), max 100 entries
const paperCache = new NodeCache({ stdTTL: 1800, checkperiod: 300, maxKeys: 100 });

/**
 * Build a stable cache key from the semantically important fields,
 * deliberately excluding the NCERT context blob.
 */
function buildCacheKey(type, params) {
    const stable = JSON.stringify({
        type,
        class: params.class || params.studentClass || '',
        subject: (params.subject || '').toLowerCase().trim(),
        chapter: (params.chapter || params.chapters?.[0] || '').toLowerCase().trim(),
        topic: (params.topic || '').toLowerCase().trim(),
        difficulty: (params.difficulty || '').toLowerCase().trim(),
        questionType: (params.questionType || '').toLowerCase().trim(),
        totalQ: params.totalQuestions || '',
    });
    return crypto.createHash('sha256').update(stable).digest('hex');
}

/**
 * Legacy key builder — for when callers pass a raw prompt string.
 * Still used internally as a fallback.
 */
function hashPrompt(prompt) {
    return crypto.createHash('sha256').update(prompt).digest('hex');
}

const cache = {
    /**
     * Get a cached response.
     *
     * @param {string} type   - 'question' | 'paper'
     * @param {Object|string} keySource - params object (preferred) or raw prompt string
     * @returns {*} cached value or null on miss
     */
    get(type, keySource) {
        const store = type === 'paper' ? paperCache : questionCache;
        const key = typeof keySource === 'object'
            ? buildCacheKey(type, keySource)
            : hashPrompt(keySource);

        const hit = store.get(key);
        if (hit !== undefined) {
            console.log(`--> ⚡ CACHE HIT  [${type}] ${key.substring(0, 10)}…`);
            return hit;
        }
        return null;
    },

    /**
     * Store a response in the cache.
     *
     * @param {string} type   - 'question' | 'paper'
     * @param {Object|string} keySource - params object (preferred) or raw prompt string
     * @param {*} value       - value to store
     */
    set(type, keySource, value) {
        const store = type === 'paper' ? paperCache : questionCache;
        const key = typeof keySource === 'object'
            ? buildCacheKey(type, keySource)
            : hashPrompt(keySource);

        store.set(key, value);
        console.log(`--> 💾 CACHE SET  [${type}] ${key.substring(0, 10)}…`);
    },

    /**
     * Explicitly invalidate a cache entry.
     * Useful when a user requests fresh questions for the same topic.
     */
    invalidate(type, keySource) {
        const store = type === 'paper' ? paperCache : questionCache;
        const key = typeof keySource === 'object'
            ? buildCacheKey(type, keySource)
            : hashPrompt(keySource);

        store.del(key);
        console.log(`--> 🗑  CACHE DEL  [${type}] ${key.substring(0, 10)}…`);
    },

    /** Clear all cached entries (useful for testing / admin reset). */
    flush() {
        questionCache.flushAll();
        paperCache.flushAll();
        console.log('--> 🧹 Cache flushed');
    },

    /** Stats for the /api/health endpoint. */
    stats() {
        return {
            questions: {
                keys: questionCache.keys().length,
                hits: questionCache.getStats().hits,
                misses: questionCache.getStats().misses,
            },
            papers: {
                keys: paperCache.keys().length,
                hits: paperCache.getStats().hits,
                misses: paperCache.getStats().misses,
            },
        };
    },
};

module.exports = cache;