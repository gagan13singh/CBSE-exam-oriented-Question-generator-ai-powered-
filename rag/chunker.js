/**
 * rag/chunker.js
 * Section-aware NCERT chunker — replaces the old word-count-only approach.
 *
 * What changed vs old version:
 *  OLD: Split purely on word count → chunks start mid-sentence, split formulas,
 *       mix content from different chapters. Zero structural awareness.
 *
 *  NEW: 1. Split on NCERT structural boundaries first (Chapter, Exercise, section numbers)
 *       2. Within each section, split on paragraph breaks (double newline)
 *       3. Only fall back to sentence splitting if a paragraph is still too large
 *       4. Keep last 2 sentences as overlap so context doesn't break at boundaries
 *       5. Store chapter_num, section_title in metadata so retriever can filter by chapter
 */

// ── Tuning constants ──────────────────────────────────────────────────────────
const MAX_WORDS = 350;  // max words per chunk (fits in ~1500 token context window)
const OVERLAP_SENTS = 2;    // sentences to carry over as overlap
const MIN_WORDS = 25;   // discard chunks smaller than this (page headers, etc.)

// Patterns that signal a new structural section in NCERT PDFs
const SECTION_BREAKS = [
    /^Chapter\s+\d+/im,
    /^CHAPTER\s+\d+/m,
    /^\d+\.\s+[A-Z]/m,       // "1. Introduction"
    /^\d+\.\d+\s+[A-Z]/m,    // "1.1 Background"
    /^Exercise\s+\d+/im,
    /^EXERCISE\s+\d+/m,
    /^Example\s+\d+/im,
    /^Activities?/im,
    /^Summary/im,
    /^SUMMARY/m,
    /^Key\s+Terms/im,
    /^Intext\s+Questions?/im,
];

// Build a single regex that matches any section break at the start of a line
const SECTION_PATTERN = new RegExp(
    SECTION_BREAKS.map(r => r.source).join('|'),
    'im'
);

/**
 * Extract chapter number from a text block header.
 * e.g. "Chapter 5 — Light" → "5"
 *      "1.3 Laws of Motion" → "1"
 */
function extractChapterNum(text) {
    const m = text.match(/(?:chapter\s+|^)(\d{1,2})/i);
    return m ? m[1] : null;
}

/**
 * Split text into sentences, keeping LaTeX / formula blocks intact.
 * Simple but effective: split on ". " / "? " / "! " not preceded by digits
 * (so "5.4 cm" doesn't split) and not inside parentheses.
 */
function splitSentences(text) {
    return text
        .split(/(?<![0-9])(?<!\b[A-Z])(?<=[.!?])\s+(?=[A-Z"(])/)
        .map(s => s.trim())
        .filter(s => s.length > 10);
}

/**
 * Count words in a string.
 */
function wordCount(text) {
    return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Split a single section into chunks respecting MAX_WORDS.
 * Strategy:
 *  1. Try paragraph-level splits first (double newline)
 *  2. If a paragraph is still too big, fall back to sentence splitting
 *  3. Carry OVERLAP_SENTS sentences from previous chunk
 */
function splitSection(sectionText, baseMetadata) {
    const chunks = [];
    const paragraphs = sectionText.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 20);

    let buffer = [];  // array of sentences in current chunk
    let bufWords = 0;

    const flushBuffer = () => {
        const text = buffer.join(' ').trim();
        if (wordCount(text) >= MIN_WORDS) {
            chunks.push({ text, metadata: { ...baseMetadata, chunk_index: chunks.length } });
        }
        // Keep last OVERLAP_SENTS sentences as overlap for next chunk
        buffer = buffer.slice(-OVERLAP_SENTS);
        bufWords = buffer.reduce((a, s) => a + wordCount(s), 0);
    };

    for (const para of paragraphs) {
        const paraWords = wordCount(para);

        if (bufWords + paraWords <= MAX_WORDS) {
            // Whole paragraph fits — add as-is
            buffer.push(para);
            bufWords += paraWords;
        } else if (paraWords <= MAX_WORDS) {
            // Paragraph fits in a fresh chunk — flush first
            if (bufWords > 0) flushBuffer();
            buffer.push(para);
            bufWords += paraWords;
        } else {
            // Paragraph is too large — split into sentences
            const sentences = splitSentences(para);
            for (const sent of sentences) {
                const sw = wordCount(sent);
                if (bufWords + sw > MAX_WORDS && bufWords > 0) {
                    flushBuffer();
                }
                buffer.push(sent);
                bufWords += sw;
            }
        }
    }

    // Flush any remaining content
    if (buffer.length > 0) flushBuffer();

    return chunks;
}

/**
 * Main export — takes a full PDF text string and metadata from the filename.
 *
 * @param {string} text       - Raw text extracted from the PDF
 * @param {Object} metadata   - { class, subject, filename } from parseFilename()
 * @returns {Array<{ text: string, metadata: Object }>}
 */
function chunkText(text, metadata = {}) {
    // ── Step 1: Clean the raw PDF text ──────────────────────────────────────
    const cleaned = text
        .replace(/\r\n/g, '\n')
        .replace(/\f/g, '\n\n')             // form feed = new page
        .replace(/\t/g, ' ')               // tabs → space
        .replace(/[ ]{3,}/g, ' ')          // collapse long runs of spaces
        .replace(/\n{4,}/g, '\n\n\n')      // max 3 consecutive newlines
        .trim();

    // ── Step 2: Split on structural section boundaries ──────────────────────
    // We split on lines that match SECTION_PATTERN, keeping the delimiter
    // at the start of each new section.
    const lines = cleaned.split('\n');
    const sections = [];
    let current = [];

    for (const line of lines) {
        if (SECTION_PATTERN.test(line) && current.length > 0) {
            sections.push(current.join('\n'));
            current = [line];
        } else {
            current.push(line);
        }
    }
    if (current.length > 0) sections.push(current.join('\n'));

    // ── Step 3: Chunk each section ───────────────────────────────────────────
    const allChunks = [];

    for (let sIdx = 0; sIdx < sections.length; sIdx++) {
        const section = sections[sIdx].trim();
        if (section.length < 50) continue; // skip page headers, blank sections

        // Extract title (first line) and chapter number for metadata
        const firstLine = section.split('\n')[0].trim().substring(0, 120);
        const chapterNum = extractChapterNum(section) || metadata.chapter_num || null;

        const sectionMeta = {
            ...metadata,
            section_index: sIdx,
            section_title: firstLine || null,
            chapter_num: chapterNum,
        };

        const sectionChunks = splitSection(section, sectionMeta);
        allChunks.push(...sectionChunks);
    }

    return allChunks;
}

module.exports = { chunkText };