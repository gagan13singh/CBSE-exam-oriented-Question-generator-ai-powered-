/**
 * scripts/index-ncert.js
 * ONE-TIME script: Reads all NCERT PDFs from /data/ncert/, chunks them,
 * embeds them with nomic-embed-text (via Ollama), and stores in ChromaDB.
 *
 * Prerequisites:
 *   1. Ollama running with nomic-embed-text: `ollama pull nomic-embed-text`
 *   2. ChromaDB running: `npx --yes chromadb@latest run --path ./data/chroma`
 *      (In a separate terminal)
 *   3. NCERT PDFs placed in /data/ncert/ folder
 *
 * Usage:
 *   node scripts/index-ncert.js
 *
 * This needs to be run only once, or whenever you add new NCERT PDF files.
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { ChromaClient } = require('chromadb');
const { chunkText } = require('../rag/chunker');

const NCERT_DIR = path.join(__dirname, '..', 'data', 'ncert');
const COLLECTION_NAME = 'ncert_chunks';
const OLLAMA_EMBED_URL = 'http://localhost:11434/api/embeddings';
const EMBED_MODEL = 'nomic-embed-text';
const BATCH_SIZE = 10;

/**
 * Get embedding from Ollama
 */
async function embed(text) {
    const resp = await fetch(OLLAMA_EMBED_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: EMBED_MODEL, prompt: text })
    });
    if (!resp.ok) throw new Error(`Embedding failed: ${resp.status}`);
    const data = await resp.json();
    return data.embedding;
}

/**
 * Extract metadata from filename.
 * Expected filename format: class10_science_light.pdf
 * or: physics_class12_chapter8.pdf
 */
function parseFilename(filename) {
    const base = filename.replace('.pdf', '').toLowerCase();
    const classMatch = base.match(/class[_\s]?(\d{1,2})/);
    const cls = classMatch ? classMatch[1] : 'unknown';

    const subjects = ['physics', 'chemistry', 'mathematics', 'biology', 'science', 'history', 'geography', 'economics', 'civics', 'socialscience'];
    const subject = subjects.find(s => base.includes(s)) || 'general';

    return { class: cls, subject };
}

async function main() {
    console.log('🚀 NCERT Indexing Script Started\n');

    // Check NCERT directory exists
    if (!fs.existsSync(NCERT_DIR)) {
        console.error(`❌ NCERT directory not found: ${NCERT_DIR}`);
        console.log('Create the directory and place your NCERT PDF files there.');
        process.exit(1);
    }

    const pdfFiles = fs.readdirSync(NCERT_DIR).filter(f => f.endsWith('.pdf'));
    if (pdfFiles.length === 0) {
        console.warn('⚠️  No PDF files found in /data/ncert/. Add NCERT PDFs and re-run.');
        process.exit(0);
    }

    console.log(`📚 Found ${pdfFiles.length} PDF files: ${pdfFiles.join(', ')}\n`);

    // Connect to ChromaDB
    const client = new ChromaClient({ path: 'http://localhost:8000' });
    try {
        await client.heartbeat();
        console.log('✅ ChromaDB connected\n');
    } catch (e) {
        console.error('❌ ChromaDB not running!');
        console.log('Start it with: npx --yes chromadb@latest run --path ./data/chroma');
        process.exit(1);
    }

    // Delete existing collection (fresh re-index)
    try { await client.deleteCollection({ name: COLLECTION_NAME }); } catch (_) {}
    const collection = await client.createCollection({
        name: COLLECTION_NAME,
        metadata: { 'hnsw:space': 'cosine' }
    });
    console.log(`✅ Collection "${COLLECTION_NAME}" created\n`);

    let totalChunks = 0;

    for (const file of pdfFiles) {
        const filePath = path.join(NCERT_DIR, file);
        const { class: cls, subject } = parseFilename(file);

        console.log(`📄 Processing: ${file} (Class ${cls}, ${subject})`);

        try {
            const buffer = fs.readFileSync(filePath);
            const pdfData = await pdf(buffer);
            const text = pdfData.text;

            const chunks = chunkText(text, { class: cls, subject, filename: file });
            console.log(`   → ${chunks.length} chunks created`);

            // Embed in batches
            for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
                const batch = chunks.slice(i, i + BATCH_SIZE);
                const embeddings = [];
                const documents = [];
                const metadatas = [];
                const ids = [];

                for (const chunk of batch) {
                    const embedding = await embed(chunk.text);
                    embeddings.push(embedding);
                    documents.push(chunk.text);
                    metadatas.push(chunk.metadata);
                    ids.push(`${file}_chunk_${totalChunks + embeddings.length}`);
                }

                await collection.add({ ids, embeddings, documents, metadatas });
                process.stdout.write(`   → Indexed ${Math.min(i + BATCH_SIZE, chunks.length)}/${chunks.length} chunks\r`);
                totalChunks += batch.length;
            }

            console.log(`   ✅ Done: ${chunks.length} chunks indexed\n`);
        } catch (e) {
            console.error(`   ❌ Failed to process ${file}: ${e.message}`);
        }
    }

    console.log(`\n🎉 Indexing Complete!`);
    console.log(`   Total chunks stored: ${totalChunks}`);
    console.log(`   Collection: "${COLLECTION_NAME}"`);
    console.log(`\nYour RAG pipeline is ready. Restart your server.`);
}

main().catch(console.error);
