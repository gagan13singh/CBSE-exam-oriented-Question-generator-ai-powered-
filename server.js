/**
 * server.js — Entry point
 * CBSE Question Generator & Practice Platform
 *
 * Architecture:
 *   Request → helmet/cors/rate-limit → routes/ → services/ → Groq or Ollama
 *
 * Start: node server.js
 */

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const errorHandler = require('./middleware/errorHandler');

// Routes
const questionsRouter = require('./routes/questions');
const paperRouter     = require('./routes/paper');
const graderRouter    = require('./routes/grader');
const healthRouter    = require('./routes/health');
const syllabusRouter  = require('./routes/syllabus');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check (no rate limit — used by frontend for model badge)
app.use('/api/health', healthRouter);

// Syllabus data (no rate limit — static JSON serving)
app.use('/api/v1/syllabus', syllabusRouter);

// AI endpoints
app.use('/api/v1/questions', questionsRouter);
app.use('/api/v1/paper',     paperRouter);
app.use('/api/v1/grade',     graderRouter);

// ─── Legacy endpoint aliases (backwards-compat with existing frontend) ────────
// Keeps your old /generate-questions, /generate-paper, /grade-paper calls working
app.post('/generate-questions', (req, res, next) => {
    req.url = '/generate';
    questionsRouter(req, res, next);
});

app.post('/generate-paper', (req, res, next) => {
    req.url = '/generate';
    paperRouter(req, res, next);
});

app.post('/grade-paper', (req, res, next) => {
    req.url = '/';
    graderRouter(req, res, next);
});

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ─── Centralized Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    const groqConfigured = !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here';
    const useGroq = process.env.USE_GROQ !== 'false';

    console.log('\n========================================');
    console.log('  CBSE Question Generator — Backend');
    console.log('========================================');
    console.log(`  Server    : http://localhost:${PORT}`);
    console.log(`  Env       : ${process.env.NODE_ENV || 'development'}`);
    console.log(`  LLM       : ${groqConfigured && useGroq ? '🚀 Groq (fast, free cloud)' : '🐢 Ollama (local fallback)'}`);
    if (!groqConfigured) {
        console.log('\n  ⚠️  GROQ_API_KEY not set in .env');
        console.log('     Get your FREE key at: https://console.groq.com');
        console.log('     Without it, all requests fall back to local Ollama.\n');
    }
    console.log('  Endpoints :');
    console.log('    GET  /api/health');
    console.log('    GET  /api/v1/syllabus');
    console.log('    POST /api/v1/questions/generate');
    console.log('    POST /api/v1/paper/generate');
    console.log('    POST /api/v1/grade');
    console.log('========================================\n');
});
