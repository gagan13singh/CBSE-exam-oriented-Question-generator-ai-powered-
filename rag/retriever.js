/**
 * rag/retriever.js
 * Semantic NCERT retrieval using ChromaDB + nomic-embed-text embeddings via Ollama.
 *
 * Setup (one-time): Run `node scripts/index-ncert.js` to embed your NCERT PDFs.
 * Runtime: Each generate request queries ChromaDB for relevant NCERT chunks.
 */

const { ChromaClient } = require('chromadb');
const path = require('path');

const COLLECTION_NAME = 'ncert_chunks';
const OLLAMA_EMBED_URL = process.env.OLLAMA_URL
    ? process.env.OLLAMA_URL.replace('/api/generate', '/api/embeddings')
    : 'http://localhost:11434/api/embeddings';
const EMBED_MODEL = 'nomic-embed-text';

let client = null;
let collection = null;

async function getClient() {
    if (client) return client;
    client = new ChromaClient({
        path: `http://localhost:8000`
    });

    // Test connection
    try {
        await client.heartbeat();
    } catch (e) {
        console.warn('[RAG] ChromaDB not running. Using fallback NCERT retrieval.');
        client = null;
    }
    return client;
}

async function getCollection() {
    if (collection) return collection;
    const c = await getClient();
    if (!c) return null;

    try {
        collection = await c.getOrCreateCollection({
            name: COLLECTION_NAME,
            metadata: { 'hnsw:space': 'cosine' }
        });
        return collection;
    } catch (e) {
        console.warn('[RAG] Could not access ChromaDB collection:', e.message);
        return null;
    }
}

/**
 * Get embeddings from Ollama (nomic-embed-text)
 */
async function getEmbedding(text) {
    const response = await fetch(OLLAMA_EMBED_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: EMBED_MODEL, prompt: text }),
        signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error(`Ollama embedding failed: ${response.status}`);
    const data = await response.json();
    return data.embedding;
}

/**
 * Retrieve the most relevant NCERT chunks for a given query.
 * Returns concatenated context string, or null if ChromaDB unavailable.
 *
 * @param {Object} params
 * @param {string} params.subject
 * @param {string} params.studentClass
 * @param {string} params.chapter
 * @param {string} params.topic
 * @param {number} [params.topK=3] - Number of chunks to retrieve
 */
async function retrieveNCERTContext({ subject, studentClass, chapter, topic, topK = 3 }) {
    const col = await getCollection();

    // Fallback to old PDF-based method if ChromaDB not available
    if (!col) {
        return await fallbackFileRetrieval(subject, chapter);
    }

    try {
        const query = `CBSE Class ${studentClass} ${subject} ${chapter} ${topic}`;
        const embedding = await getEmbedding(query);

        const results = await col.query({
            queryEmbeddings: [embedding],
            nResults: topK,
            where: {
                $and: [
                    { class: { $eq: studentClass } },
                    { subject: { $eq: subject.toLowerCase() } }
                ]
            }
        });

        if (!results.documents?.[0]?.length) {
            // Retry without metadata filter (broader search)
            const broadResults = await col.query({
                queryEmbeddings: [embedding],
                nResults: topK
            });
            if (!broadResults.documents?.[0]?.length) return null;
            const chunks = broadResults.documents[0];
            console.log(`--> 📚 RAG (ChromaDB broad): ${chunks.length} chunks retrieved`);
            return chunks.join('\n\n---\n\n').substring(0, 8000);
        }

        const chunks = results.documents[0];
        const sources = results.metadatas?.[0]?.map(m => `${m.subject} Ch.${m.chapter}`) || [];
        console.log(`--> 📚 RAG (ChromaDB): ${chunks.length} chunks from [${sources.join(', ')}]`);
        return chunks.join('\n\n---\n\n').substring(0, 8000);

    } catch (e) {
        console.warn('[RAG] ChromaDB query failed:', e.message);
        return await fallbackFileRetrieval(subject, chapter);
    }
}

/**
 * Fallback: Original file-based PDF retrieval (for when ChromaDB is not indexed)
 */
async function fallbackFileRetrieval(subject, chapter) {
    const fs = require('fs');
    const pdf = require('pdf-parse');
    const dataDir = path.join(__dirname, '..', 'data', 'ncert');

    if (!fs.existsSync(dataDir)) return null;

    try {
        const files = fs.readdirSync(dataDir);
        const matchedFile = files.find(file =>
            file.toLowerCase().includes(subject.toLowerCase()) &&
            file.toLowerCase().includes(chapter.toLowerCase().split(' ')[0]) &&
            file.endsWith('.pdf')
        );

        if (!matchedFile) return null;

        console.log(`--> 📚 RAG (Fallback PDF): ${matchedFile}`);
        const dataBuffer = fs.readFileSync(path.join(dataDir, matchedFile));
        const data = await pdf(dataBuffer);
        return data.text.substring(0, 8000) + '\n... [TRUNCATED]';
    } catch (e) {
        console.error('[RAG] Fallback PDF retrieval failed:', e.message);
        return null;
    }
}

module.exports = { retrieveNCERTContext };
