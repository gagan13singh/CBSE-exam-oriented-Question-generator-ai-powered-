/**
 * rag/chunker.js
 * Splits NCERT PDF text into overlapping chunks for embedding.
 */

const CHUNK_SIZE = 400;      // tokens (approx 300 words)
const CHUNK_OVERLAP = 50;    // token overlap between chunks

/**
 * Splits text into overlapping word-based chunks.
 * @param {string} text
 * @param {Object} metadata - { subject, class, chapter, page }
 * @returns {Array<{ text: string, metadata: Object }>}
 */
function chunkText(text, metadata = {}) {
    // Clean the text
    const cleaned = text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')        // collapse multiple blank lines
        .replace(/\s{2,}/g, ' ')           // collapse multiple spaces
        .trim();

    const words = cleaned.split(/\s+/);
    const chunks = [];

    for (let i = 0; i < words.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
        const chunkWords = words.slice(i, i + CHUNK_SIZE);
        if (chunkWords.length < 20) break; // skip tiny tail chunks

        chunks.push({
            text: chunkWords.join(' '),
            metadata: { ...metadata, chunk_index: chunks.length }
        });
    }

    return chunks;
}

module.exports = { chunkText };
