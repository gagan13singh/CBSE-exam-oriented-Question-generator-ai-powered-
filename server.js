/**
 * server.js — Entry point
 * CBSE Question Generator & Practice Platform
 * UPDATED: Added doubt engine route + cleaned up duplicate registrations
 */

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const errorHandler = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');

// ── Routes ────────────────────────────────────────────────────────────────────
const questionsRouter = require('./routes/questions');
const paperRouter     = require('./routes/paper');
const graderRouter    = require('./routes/grader');
const healthRouter    = require('./routes/health');
const syllabusRouter  = require('./routes/syllabus');
const statusRouter    = require('./routes/status');
const uploadRouter    = require('./routes/upload');
const similarRouter   = require('./routes/similar');
const doubtRouter     = require('./routes/doubt');
const helmet          = require('helmet');

const app  = express();
app.use(helmet());
const PORT = process.env.PORT || 3000;

// ── Ensure uploads/tmp directory exists ──────────────────────────────────────
const uploadTmpDir = path.join(__dirname, 'uploads', 'tmp');
if (!fs.existsSync(uploadTmpDir)) {
    fs.mkdirSync(uploadTmpDir, { recursive: true });
    console.log('[Server] Created uploads/tmp directory');
}

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (origin.includes('vercel.app') || origin.includes('localhost')) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    }
}));

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));

// ── Request Logging ───────────────────────────────────────────────────────────
app.use(requestLogger);

// ── Route Registrations ───────────────────────────────────────────────────────
app.use('/api/health',       healthRouter);
app.use('/api/v1/syllabus',  syllabusRouter);
app.use('/api/v1/status',    statusRouter);
app.use('/api/v1/questions', questionsRouter);   // handles /generate
app.use('/api/v1/questions', similarRouter);     // handles /similar + /similar-from-image
app.use('/api/v1/paper',     paperRouter);
app.use('/api/v1/grade',     graderRouter);
app.use('/api/v1/upload',    uploadRouter);
app.use('/api/v1/doubt',     doubtRouter);       // ← Doubt Engine

// ── Legacy aliases ────────────────────────────────────────────────────────────
app.post('/generate-questions', (req, res, next) => { req.url = '/generate'; questionsRouter(req, res, next); });
app.post('/generate-paper',     (req, res, next) => { req.url = '/generate'; paperRouter(req, res, next); });
app.post('/grade-paper',        (req, res, next) => { req.url = '/'; graderRouter(req, res, next); });

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    const groqConfigured = !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here';
    const useGroq        = process.env.USE_GROQ !== 'false';

    console.log('\n========================================');
    console.log('  CBSE Question Generator — Backend');
    console.log('========================================');
    console.log(`  Server : http://localhost:${PORT}`);
    console.log(`  Env    : ${process.env.NODE_ENV || 'development'}`);
    console.log(`  LLM    : ${groqConfigured && useGroq ? '🚀 Groq' : '🐢 Ollama fallback'}`);
    console.log('  Endpoints:');
    console.log('    GET  /api/health');
    console.log('    GET  /api/v1/syllabus');
    console.log('    POST /api/v1/questions/generate');
    console.log('    POST /api/v1/questions/similar');
    console.log('    POST /api/v1/questions/similar-from-image');
    console.log('    POST /api/v1/paper/generate');
    console.log('    POST /api/v1/grade');
    console.log('    POST /api/v1/upload/pdf');
    console.log('    POST /api/v1/doubt');             // ← NEW
    console.log('========================================\n');
});

// ── Keep-alive ping (Render/Railway) ─────────────────────────────────────────
if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
    setInterval(() => {
        fetch(`${process.env.RENDER_EXTERNAL_URL}/api/health`)
            .catch(() => {});
    }, 10 * 60 * 1000);
}