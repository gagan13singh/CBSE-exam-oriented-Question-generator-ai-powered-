/**
 * scripts/index-ncert.js
 * Re-index all NCERT PDFs with the new section-aware chunker.
 *
 * Run this ONCE after replacing chunker.js:
 *   node scripts/index-ncert.js
 *
 * Prerequisites:
 *   1. Ollama running with nomic-embed-text pulled:
 *        ollama pull nomic-embed-text
 *   2. ChromaDB running (in a separate terminal):
 *        npx --yes chromadb@latest run --path ./data/chroma
 *   3. NCERT PDFs in /data/ncert/
 *      Naming convention: class10_science.pdf  OR  physics_class12.pdf
 *
 * What's new vs old script:
 *   - Uses the new section-aware chunker (smaller, smarter chunks)
 *   - Stores chapter_num + section_title in metadata for Tier 1 filtering
 *   - Shows chunk quality stats per file (avg words, section count)
 *   - Batch size stays at 10 to avoid Ollama memory spikes
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const { ChromaClient } = require('chromadb');
const { chunkText } = require('../rag/chunker');

// ── Config ────────────────────────────────────────────────────────────────────
const NCERT_DIR = path.join(__dirname, '..', 'data', 'ncert');
const COLLECTION_NAME = 'ncert_chunks';
const OLLAMA_EMBED = 'http://localhost:11434/api/embeddings';
const EMBED_MODEL = 'nomic-embed-text';
const BATCH_SIZE = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────

async function embed(text) {
    const res = await fetch(OLLAMA_EMBED, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: EMBED_MODEL, prompt: text }),
        signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`Embedding failed: ${res.status} ${res.statusText}`);
    const data = await res.json();
    if (!data.embedding) throw new Error('Ollama returned no embedding');
    return data.embedding;
}

/**
 * Parse class number and subject from filename.
 *
 * Supports formats:
 *   class10_science_light.pdf
 *   physics_class12_chapter8.pdf
 *   science10.pdf
 */
function parseFilename(filename) {
    const base = filename.replace('.pdf', '').toLowerCase();

    // Extract class number
    const classMatch = base.match(/class[_\s-]?(\d{1,2})|(\d{1,2})[_\s-]?class/);
    const cls = classMatch ? (classMatch[1] || classMatch[2]) : 'unknown';

    // Extract subject
    const SUBJECTS = [
        'physics', 'chemistry', 'mathematics', 'maths', 'math',
        'biology', 'science', 'history', 'geography', 'economics',
        'civics', 'socialscience', 'political', 'english', 'hindi',
    ];
    const subject = SUBJECTS.find(s => base.includes(s)) || 'general';

    // Normalise "maths"/"math" to "mathematics"
    const normSubject = subject === 'maths' || subject === 'math' ? 'mathematics' : subject;

    return { class: cls, subject: normSubject };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║  NCERT Indexer — Section-Aware Chunker   ║');
    console.log('╚══════════════════════════════════════════╝\n');

    // Check NCERT dir
    if (!fs.existsSync(NCERT_DIR)) {
        console.error(`❌  NCERT directory not found: ${NCERT_DIR}`);
        console.log('    Create it and place your PDF files there.');
        process.exit(1);
    }

    const pdfFiles = fs.readdirSync(NCERT_DIR).filter(f => f.endsWith('.pdf'));
    if (!pdfFiles.length) {
        console.warn('⚠️   No PDF files found. Add NCERT PDFs to /data/ncert/ and re-run.');
        process.exit(0);
    }

    console.log(`📚  Found ${pdfFiles.length} PDF file${pdfFiles.length > 1 ? 's' : ''}:`);
    pdfFiles.forEach(f => console.log(`     • ${f}`));
    console.log();

    // Connect ChromaDB
    const client = new ChromaClient({ path: 'http://localhost:8000' });
    try {
        await client.heartbeat();
        console.log('✅  ChromaDB connected\n');
    } catch (e) {
        console.error('❌  ChromaDB not reachable. Start it with:');
        console.log('    npx --yes chromadb@latest run --path ./data/chroma\n');
        process.exit(1);
    }

    // Check Ollama + nomic-embed-text
    try {
        console.log(`🔍  Testing Ollama embedding model (${EMBED_MODEL})…`);
        await embed('test');
        console.log('✅  Ollama embedding working\n');
    } catch (e) {
        console.error(`❌  Ollama embedding failed: ${e.message}`);
        console.log('    Make sure Ollama is running and nomic-embed-text is pulled:');
        console.log('      ollama pull nomic-embed-text\n');
        process.exit(1);
    }

    // Drop old collection and create fresh
    try { await client.deleteCollection({ name: COLLECTION_NAME }); } catch (_) { }
    const collection = await client.createCollection({
        name: COLLECTION_NAME,
        metadata: { 'hnsw:space': 'cosine' },
    });
    console.log(`✅  Collection "${COLLECTION_NAME}" created (fresh)\n`);

    let totalChunks = 0;
    const stats = [];

    // Process each PDF
    for (const file of pdfFiles) {
        const filePath = path.join(NCERT_DIR, file);
        const { class: cls, subject } = parseFilename(file);

        console.log(`📄  Processing: ${file}`);
        console.log(`    Class: ${cls} | Subject: ${subject}`);

        try {
            const buffer = fs.readFileSync(filePath);
            const pdfData = await pdf(buffer);
            const rawText = pdfData.text;

            console.log(`    Pages: ${pdfData.numpages} | Raw text: ${(rawText.length / 1000).toFixed(1)}k chars`);

            // Generate chunks using new section-aware chunker
            const chunks = chunkText(rawText, { class: cls, subject, filename: file });

            if (!chunks.length) {
                console.warn(`    ⚠️  No chunks generated — check the PDF has extractable text.`);
                continue;
            }

            // Quality stats
            const wordCounts = chunks.map(c => c.text.split(/\s+/).length);
            const avgWords = Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length);
            const withChapterNum = chunks.filter(c => c.metadata.chapter_num).length;

            console.log(`    Chunks: ${chunks.length} | Avg words/chunk: ${avgWords} | With chapter_num: ${withChapterNum}`);

            stats.push({ file, chunks: chunks.length, avgWords });

            // Embed + store in batches
            for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
                const batch = chunks.slice(i, i + BATCH_SIZE);

                const ids = [];
                const embeddings = [];
                const documents = [];
                const metadatas = [];

                for (const chunk of batch) {
                    const id = `${file}_chunk_${totalChunks + ids.length + 1}`;
                    const emb = await embed(chunk.text);

                    ids.push(id);
                    embeddings.push(emb);
                    documents.push(chunk.text);
                    metadatas.push(chunk.metadata);
                }

                await collection.add({ ids, embeddings, documents, metadatas });

                // Progress indicator
                const done = Math.min(i + BATCH_SIZE, chunks.length);
                process.stdout.write(`\r    Indexed ${done}/${chunks.length} chunks…`);
            }

            totalChunks += chunks.length;
            console.log(`\r    ✅ Done — ${chunks.length} chunks stored\n`);

        } catch (e) {
            console.error(`\n    ❌ Failed to process ${file}: ${e.message}\n`);
        }
    }

    // Summary
    console.log('╔══════════════════════════════════════════╗');
    console.log('║  Indexing Complete                       ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  Total chunks stored : ${String(totalChunks).padEnd(17)}║`);
    console.log(`║  Files processed     : ${String(pdfFiles.length).padEnd(17)}║`);
    console.log('╠══════════════════════════════════════════╣');
    stats.forEach(s => {
        const label = s.file.substring(0, 20).padEnd(20);
        console.log(`║  ${label} → ${String(s.chunks).padStart(4)} chunks        ║`);
    });
    console.log('╚══════════════════════════════════════════╝');
    console.log('\n✅  RAG pipeline ready. Restart your server.\n');
}

main().catch(err => {
    console.error('\n❌  Indexer crashed:', err.message);
    console.error(err.stack);
    process.exit(1);
});