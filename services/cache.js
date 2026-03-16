/**
 * services/cache.js
 * In-memory LRU cache with TTL.
 * Questions are cached by SHA-256 hash of the prompt.
 * Grade results are NEVER cached (unique per student).
 */

const NodeCache = require('node-cache');
const crypto = require('crypto');

// 1-hour TTL for questions, check for expired keys every 10 min
const questionCache = new NodeCache({ stdTTL: 3600, checkperiod: 600, maxKeys: 500 });

// 30-minute TTL for full paper generation (more compute-heavy)
const paperCache = new NodeCache({ stdTTL: 1800, checkperiod: 300, maxKeys: 100 });

function hashPrompt(prompt) {
    return crypto.createHash('sha256').update(prompt).digest('hex');
}

const cache = {
    /**
     * Get a cached response. Returns null on miss.
     */
    get(type, prompt) {
        const store = type === 'paper' ? paperCache : questionCache;
        const key = hashPrompt(prompt);
        const hit = store.get(key);
        if (hit !== undefined) {
            console.log(`--> ⚡ CACHE HIT [${type}] key:${key.substring(0, 8)}...`);
            return hit;
        }
        return null;
    },

    /**
     * Store a response in the cache.
     */
    set(type, prompt, value) {
        const store = type === 'paper' ? paperCache : questionCache;
        const key = hashPrompt(prompt);
        store.set(key, value);
        console.log(`--> 💾 CACHE SET [${type}] key:${key.substring(0, 8)}...`);
    },

    /**
     * Stats for the health endpoint.
     */
    stats() {
        return {
            questions: {
                keys: questionCache.keys().length,
                hits: questionCache.getStats().hits,
                misses: questionCache.getStats().misses
            },
            papers: {
                keys: paperCache.keys().length,
                hits: paperCache.getStats().hits,
                misses: paperCache.getStats().misses
            }
        };
    }
};

module.exports = cache;
