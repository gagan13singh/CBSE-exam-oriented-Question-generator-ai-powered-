/**
 * rag/retriever.js
 * Semantic NCERT retrieval using ChromaDB + nomic-embed-text via Ollama.
 *
 * What changed vs old version:
 *  1. chapter_num metadata filter added — narrows results to the student's
 *     actual chapter before falling back to subject-wide search
 *  2. 3-tier fallback: chapter-filtered → subject-filtered → broad → PDF file
 *  3. topK bumped to 5 (section-aware chunks are smaller, need more of them)
 *  4. Result deduplication — removes near-identical chunks before returning
 *  5. Better logging — shows chapter_num and section_title from metadata
 */

const { ChromaClient } = require('chromadb');
const path = require('path');

const COLLECTION_NAME = 'ncert_chunks';
const OLLAMA_EMBED_URL = process.env.OLLAMA_URL
    ? process.env.OLLAMA_URL.replace('/api/generate', '/api/embeddings')
    : 'http://localhost:11434/api/embeddings';
const EMBED_MODEL = 'nomic-embed-text';

// Singleton client + collection — avoids reconnecting on every request
let _client = null;
let _collection = null;

// ── ChromaDB connection ───────────────────────────────────────────────────────

async function getClient() {
    if (_client) return _client;

    const c = new ChromaClient({ path: 'http://localhost:8000' });
    try {
        await c.heartbeat();
        _client = c;
        return _client;
    } catch (e) {
        console.warn('[RAG] ChromaDB not reachable — will use PDF fallback.');
        return null;
    }
}

async function getCollection() {
    if (_collection) return _collection;

    const c = await getClient();
    if (!c) return null;

    try {
        _collection = await c.getOrCreateCollection({
            name: COLLECTION_NAME,
            metadata: { 'hnsw:space': 'cosine' },
        });
        return _collection;
    } catch (e) {
        console.warn('[RAG] Cannot access collection:', e.message);
        return null;
    }
}

// ── Embedding ─────────────────────────────────────────────────────────────────

async function getEmbedding(text) {
    const res = await fetch(OLLAMA_EMBED_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: EMBED_MODEL, prompt: text }),
        signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Ollama embedding failed: ${res.status}`);
    const data = await res.json();
    return data.embedding;
}

// ── Deduplication ─────────────────────────────────────────────────────────────
// Remove chunks whose first 80 characters match a chunk we already have.
// Happens when two nearby chunks share the same overlap sentences.

function dedupe(chunks) {
    const seen = new Set();
    return chunks.filter(chunk => {
        const key = chunk.substring(0, 80).trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// ── Main retrieval ─────────────────────────────────────────────────────────────

/**
 * Retrieve the most relevant NCERT chunks for a query.
 *
 * Falls back through 3 tiers if each returns no results:
 *   Tier 1 — chapter + subject + class filter  (most specific)
 *   Tier 2 — subject + class filter            (chapter not indexed)
 *   Tier 3 — no metadata filter                (broadest — any content)
 *   Tier 4 — raw PDF text scan                 (ChromaDB unavailable)
 *
 * @returns {string|null} Concatenated context string, or null
 */
async function retrieveNCERTContext({ subject, studentClass, chapter, topic, topK = 5 }) {
    const col = await getCollection();

    if (!col) {
        console.warn('[RAG] ChromaDB unavailable — falling back to PDF scan.');
        return await fallbackFileRetrieval(subject, chapter);
    }

    // Build semantic query string
    const query = [
        `CBSE Class ${studentClass}`,
        subject,
        chapter,
        topic,
    ].filter(Boolean).join(' — ');

    let embedding;
    try {
        embedding = await getEmbedding(query);
    } catch (e) {
        console.warn('[RAG] Embedding failed:', e.message, '— falling back to PDF.');
        return await fallbackFileRetrieval(subject, chapter);
    }

    // Extract chapter number for metadata filter
    // Works for both "Chapter 5" and "5. Light" and "10"
    const chapterNum = chapter?.match(/\b(\d{1,2})\b/)?.[1] || null;

    try {
        // ── TIER 1: chapter + subject + class ──────────────────────────────
        if (chapterNum) {
            const tier1 = await col.query({
                queryEmbeddings: [embedding],
                nResults: topK,
                where: {
                    $and: [
                        { class: { $eq: studentClass } },
                        { subject: { $eq: subject.toLowerCase() } },
                        { chapter_num: { $eq: chapterNum } },
                    ],
                },
            });

            if (tier1.documents?.[0]?.length) {
                const chunks = dedupe(tier1.documents[0]);
                const sources = tier1.metadatas?.[0]?.map(m =>
                    `${m.subject} Ch.${m.chapter_num}${m.section_title ? ' — ' + m.section_title.substring(0, 40) : ''}`
                ) || [];
                console.log(`--> 📚 RAG Tier 1 (chapter-filtered): ${chunks.length} chunks [${sources.slice(0, 2).join(', ')}]`);
                return chunks.join('\n\n---\n\n').substring(0, 9000);
            }
            console.log(`--> 📚 RAG Tier 1 miss (no chapter_num=${chapterNum} in index), trying Tier 2…`);
        }

        // ── TIER 2: subject + class only ────────────────────────────────────
        const tier2 = await col.query({
            queryEmbeddings: [embedding],
            nResults: topK,
            where: {
                $and: [
                    { class: { $eq: studentClass } },
                    { subject: { $eq: subject.toLowerCase() } },
                ],
            },
        });

        if (tier2.documents?.[0]?.length) {
            const chunks = dedupe(tier2.documents[0]);
            console.log(`--> 📚 RAG Tier 2 (subject-filtered): ${chunks.length} chunks`);
            return chunks.join('\n\n---\n\n').substring(0, 9000);
        }

        // ── TIER 3: no filter — broadest ────────────────────────────────────
        console.log(`--> 📚 RAG Tier 2 miss, trying Tier 3 (no filter)…`);
        const tier3 = await col.query({
            queryEmbeddings: [embedding],
            nResults: topK,
        });

        if (tier3.documents?.[0]?.length) {
            const chunks = dedupe(tier3.documents[0]);
            console.log(`--> 📚 RAG Tier 3 (broad): ${chunks.length} chunks`);
            return chunks.join('\n\n---\n\n').substring(0, 9000);
        }

        console.warn('[RAG] All tiers returned no results — falling back to PDF scan.');
        return await fallbackFileRetrieval(subject, chapter);

    } catch (e) {
        console.warn('[RAG] ChromaDB query error:', e.message, '— falling back to PDF.');
        // Reset collection singleton so next request gets a fresh connection
        _collection = null;
        return await fallbackFileRetrieval(subject, chapter);
    }
}

// ── PDF fallback ──────────────────────────────────────────────────────────────
// Used when ChromaDB is not running or returns nothing.
// Scans /data/ncert/ for a PDF matching the subject + first word of chapter.

async function fallbackFileRetrieval(subject, chapter) {
    const fs = require('fs');
    const pdf = require('pdf-parse');
    const dir = path.join(__dirname, '..', 'data', 'ncert');

    if (!fs.existsSync(dir)) return null;

    try {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));

        // Match on subject name in filename
        const subjectKey = subject.toLowerCase().replace(/\s+/g, '');
        const chapterKey = chapter?.toLowerCase().split(' ')[0] || '';

        // Try subject + chapter match first, then just subject
        const match =
            files.find(f =>
                f.toLowerCase().includes(subjectKey) &&
                f.toLowerCase().includes(chapterKey)
            ) ||
            files.find(f => f.toLowerCase().includes(subjectKey));

        if (!match) {
            console.warn(`[RAG] No matching PDF for subject="${subject}" chapter="${chapter}"`);
            return null;
        }

        console.log(`--> 📚 RAG Tier 4 (PDF fallback): ${match}`);
        const buf = fs.readFileSync(path.join(dir, match));
        const data = await pdf(buf);

        // Try to extract the relevant chapter section from the full PDF text
        const text = data.text;
        const chapterNum = chapter?.match(/\b(\d{1,2})\b/)?.[1];
        const chapterHead = chapterNum
            ? new RegExp(`(?:chapter|CHAPTER)\\s+${chapterNum}[^\\d]`, 'i')
            : null;

        if (chapterHead) {
            const idx = text.search(chapterHead);
            if (idx !== -1) {
                // Return ~8000 chars starting from the chapter heading
                return text.substring(idx, idx + 8000) + '\n… [TRUNCATED]';
            }
        }

        // Fallback: return the first 8000 chars
        return text.substring(0, 8000) + '\n… [TRUNCATED]';

    } catch (e) {
        console.error('[RAG] PDF fallback failed:', e.message);
        return null;
    }
}

module.exports = { retrieveNCERTContext };