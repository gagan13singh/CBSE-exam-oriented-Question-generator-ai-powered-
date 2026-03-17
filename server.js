/**
 * server.js — Entry point
 * CBSE Question Generator & Practice Platform
 * UPDATED: Added Winston request logging
 */

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const errorHandler = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');   // ← NEW

// Routes
const questionsRouter = require('./routes/questions');
const paperRouter = require('./routes/paper');
const graderRouter = require('./routes/grader');
const healthRouter = require('./routes/health');
const syllabusRouter = require('./routes/syllabus');

const app = express();
const PORT = process.env.PORT || 3000;
const statusRouter = require('./routes/status');
app.use('/api/v1/status', statusRouter);

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://cbse-exam-oriented-question-generat.vercel.app'
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// ─── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ─── Request Logging ──────────────────────────────────────────────────────────
app.use(requestLogger);   // ← NEW — logs every request with status + timing

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/health', healthRouter);
app.use('/api/v1/syllabus', syllabusRouter);
app.use('/api/v1/questions', questionsRouter);
app.use('/api/v1/paper', paperRouter);
app.use('/api/v1/grade', graderRouter);

// ─── Legacy aliases (keeps old frontend calls working) ────────────────────────
app.post('/generate-questions', (req, res, next) => { req.url = '/generate'; questionsRouter(req, res, next); });
app.post('/generate-paper', (req, res, next) => { req.url = '/generate'; paperRouter(req, res, next); });
app.post('/grade-paper', (req, res, next) => { req.url = '/'; graderRouter(req, res, next); });

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    const groqConfigured = !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here';
    const useGroq = process.env.USE_GROQ !== 'false';

    console.log('\n========================================');
    console.log('  CBSE Question Generator — Backend');
    console.log('========================================');
    console.log(`  Server : http://localhost:${PORT}`);
    console.log(`  Env    : ${process.env.NODE_ENV || 'development'}`);
    console.log(`  LLM    : ${groqConfigured && useGroq ? '🚀 Groq (fast, free cloud)' : '🐢 Ollama (local fallback)'}`);
    if (!groqConfigured) {
        console.log('\n  ⚠️  GROQ_API_KEY not set — using Ollama fallback');
        console.log('     Get free key: https://console.groq.com\n');
    }
    console.log('  Endpoints:');
    console.log('    GET  /api/health');
    console.log('    GET  /api/v1/syllabus');
    console.log('    POST /api/v1/questions/generate');
    console.log('    POST /api/v1/paper/generate');
    console.log('    POST /api/v1/grade');
    console.log('========================================\n');
});