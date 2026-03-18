/**
 * routes/upload.js
 * POST /api/v1/upload/pdf
 *
 * Student uploads their own NCERT PDF → we chunk, embed, store in ChromaDB.
 * We never host NCERT content — user uploads their own copy.
 */

const express = require('express');
const multer  = require('multer');
const fs      = require('fs');
const path    = require('path');
const pdf     = require('pdf-parse');
const router  = express.Router();

// Multer config
const upload = multer({
    dest: path.join(__dirname, '..', 'uploads', 'tmp'),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are accepted.'));
    },
});

// Constants
const COLLECTION_NAME  = 'ncert_chunks';
const OLLAMA_EMBED_URL = (process.env.OLLAMA_URL || 'http://localhost:11434/api/generate')
    .replace('/api/generate', '/api/embeddings');
const EMBED_MODEL = 'nomic-embed-text';
const CHUNK_SIZE  = 500;
const OVERLAP     = 100;
const BATCH_SIZE  = 5;

// Helpers
function chunkText(text) {
    const chunks = [];
    let i = 0;
    while (i < text.length) {
        const chunk = text.slice(i, i + CHUNK_SIZE).trim();
        if (chunk.length > 50) chunks.push(chunk);
        i += CHUNK_SIZE - OVERLAP;
    }
    return chunks;
}

async function getEmbedding(text) {
    const res = await fetch(OLLAMA_EMBED_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: EMBED_MODEL, prompt: text }),
        signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`Embedding failed: ${res.status}`);
    const data = await res.json();
    return data.embedding;
}

// Route
router.post('/pdf', upload.single('pdf'), async (req, res, next) => {
    const tmpPath = req.file?.path;

    try {
        const { subject, class: studentClass, chapter } = req.body;

        if (!subject || !studentClass || !chapter) {
            return res.status(400).json({
                success: false,
                error: 'subject, class, and chapter are all required.',
            });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No PDF uploaded.' });
        }

        // Parse PDF
        const buffer  = fs.readFileSync(tmpPath);
        const pdfData = await pdf(buffer);
        const rawText = pdfData.text;

        if (!rawText || rawText.trim().length < 100) {
            return res.status(400).json({
                success: false,
                error: 'PDF appears empty or is scanned (no extractable text).',
            });
        }

        // Chunk text
        const chunks = chunkText(rawText);

        // Try to connect ChromaDB
        let collection;
        try {
            const { ChromaClient } = require('chromadb');
            const client = new ChromaClient({ path: 'http://localhost:8000' });
            await client.heartbeat();
            collection = await client.getOrCreateCollection({
                name: COLLECTION_NAME,
                metadata: { 'hnsw:space': 'cosine' },
            });
        } catch (e) {
            return res.status(503).json({
                success: false,
                error: 'ChromaDB is not running. Start it with: npx chromadb@latest run --path ./data/chroma',
            });
        }

        // Embed and store in batches
        let indexed = 0;
        const timestamp = Date.now();

        for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
            const batch = chunks.slice(i, i + BATCH_SIZE);
            const ids        = [];
            const embeddings = [];
            const documents  = [];
            const metadatas  = [];

            for (const [j, chunk] of batch.entries()) {
                const embedding = await getEmbedding(chunk);
                ids.push(`upload_${timestamp}_chunk_${indexed + j}`);
                embeddings.push(embedding);
                documents.push(chunk);
                metadatas.push({
                    subject: subject.toLowerCase(),
                    class: studentClass,
                    chapter: chapter.toLowerCase(),
                    source: 'user_upload',
                    filename: req.file.originalname,
                    uploaded_at: timestamp,
                });
            }

            await collection.add({ ids, embeddings, documents, metadatas });
            indexed += batch.length;
        }

        // Cleanup temp file
        fs.unlinkSync(tmpPath);

        console.log(`[Upload] ✅ Indexed ${indexed} chunks — ${subject} Class ${studentClass} Ch: ${chapter}`);

        res.json({
            success: true,
            message: `PDF indexed! ${indexed} chunks stored. Questions for "${chapter}" will now be grounded in your textbook.`,
            meta: { chunks: indexed, subject, class: studentClass, chapter },
        });

    } catch (err) {
        if (tmpPath && fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
        next(err);
    }
});

module.exports = router;