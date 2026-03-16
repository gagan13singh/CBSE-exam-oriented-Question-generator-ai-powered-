/**
 * routes/syllabus.js
 * GET /api/v1/syllabus
 * Serves the full CBSE syllabus JSON for the React dropdowns.
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const SYLLABUS_PATH = path.join(__dirname, '..', 'data', 'syllabus.json');

router.get('/', (req, res) => {
    if (!fs.existsSync(SYLLABUS_PATH)) {
        return res.status(404).json({ error: 'Syllabus data not found.' });
    }

    const syllabus = JSON.parse(fs.readFileSync(SYLLABUS_PATH, 'utf8'));

    // Optional filter: ?class=10 or ?class=10&subject=Physics
    const { class: cls, subject } = req.query;

    if (cls) {
        const classKey = `class_${cls}`;
        if (!syllabus[classKey]) {
            return res.status(404).json({ error: `No syllabus found for Class ${cls}` });
        }
        if (subject) {
            const subjectData = syllabus[classKey][subject];
            if (!subjectData) {
                return res.status(404).json({ error: `No syllabus found for Class ${cls}, ${subject}` });
            }
            return res.json({ success: true, data: { [subject]: subjectData } });
        }
        return res.json({ success: true, data: syllabus[classKey] });
    }

    res.json({ success: true, data: syllabus });
});

module.exports = router;
