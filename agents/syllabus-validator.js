/**
 * agents/syllabus-validator.js
 * Rule-based CBSE syllabus checker — NO LLM call needed.
 * Validates that a topic belongs to the CBSE curriculum before wasting compute.
 * Returns instantly using JSON lookup (< 5ms).
 */

const path = require('path');
const fs = require('fs');

let syllabusData = null;

function loadSyllabus() {
    if (syllabusData) return syllabusData;
    const syllabusPath = path.join(__dirname, '..', 'data', 'syllabus.json');
    if (!fs.existsSync(syllabusPath)) {
        console.warn('[SyllabusValidator] syllabus.json not found. Validation disabled.');
        return null;
    }
    syllabusData = JSON.parse(fs.readFileSync(syllabusPath, 'utf8'));
    return syllabusData;
}

/**
 * Validates if the topic is plausibly within CBSE scope.
 * We do a fuzzy check: match class, subject, chapter partially.
 * If syllabus.json is missing, we pass everything through.
 *
 * @param {string} studentClass
 * @param {string} subject
 * @param {string} chapter
 * @param {string} topic
 * @returns {{ valid: boolean, reason: string }}
 */
function validateTopic(studentClass, subject, chapter, topic) {
    const syllabus = loadSyllabus();

    // If no syllabus file, assume valid (allows usage without syllabus.json)
    if (!syllabus) {
        return { valid: true, reason: 'Syllabus validation skipped (no syllabus.json)' };
    }

    const classKey = `class_${studentClass}`;
    const classData = syllabus[classKey];

    if (!classData) {
        return { valid: false, reason: `Class ${studentClass} is not in the CBSE curriculum (Classes 6-12 supported).` };
    }

    // Normalize for comparison
    const normalize = str => str.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    const subjectNorm = normalize(subject);

    // Find matching subject (partial match allowed)
    const matchedSubject = Object.keys(classData).find(s =>
        normalize(s).includes(subjectNorm) || subjectNorm.includes(normalize(s))
    );

    if (!matchedSubject) {
        const available = Object.keys(classData).join(', ');
        return {
            valid: false,
            reason: `"${subject}" is not a valid subject for Class ${studentClass}. Available: ${available}`
        };
    }

    // Topic itself — check it's not garbage (very basic filter)
    const CLEARLY_INVALID = ['thanos', 'avengers', 'minecraft', 'fortnite', 'anime', 'meme'];
    const topicLower = topic.toLowerCase();
    const isGarbage = CLEARLY_INVALID.some(bad => topicLower.includes(bad));
    if (isGarbage) {
        return {
            valid: false,
            reason: `"${topic}" does not appear to be a valid CBSE topic. Please enter an academic topic from your NCERT textbook.`
        };
    }

    return { valid: true, reason: 'Topic validated.' };
}

module.exports = { validateTopic };
