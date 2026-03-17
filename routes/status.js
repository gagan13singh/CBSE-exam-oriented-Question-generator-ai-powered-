// routes/status.js — NEW FILE
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const status = {
        groq: { ok: !!process.env.GROQ_API_KEY },
        ollama: { ok: false },
        chroma: { ok: false, chunks: 0 },
    };

    // Check Ollama
    try {
        const r = await fetch('http://localhost:11434/api/tags',
            { signal: AbortSignal.timeout(2000) });
        status.ollama.ok = r.ok;
    } catch (_) { }

    // Check ChromaDB + chunk count
    try {
        const { ChromaClient } = require('chromadb');
        const client = new ChromaClient({ path: 'http://localhost:8000' });
        await client.heartbeat();
        const col = await client.getCollection({ name: 'ncert_chunks' });
        status.chroma.ok = true;
        status.chroma.chunks = await col.count();
    } catch (_) { }

    res.json(status);
});

module.exports = router;