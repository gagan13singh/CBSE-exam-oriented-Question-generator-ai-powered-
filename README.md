<!-- VIDYASTRA — README -->

<div align="center">

<h1>⚡ VIDYASTRA</h1>

### *AI-Powered CBSE Question Generator*

[![Live](https://img.shields.io/badge/🚀_LIVE_DEMO-vidyastra--prep.vercel.app-6366f1?style=for-the-badge)](https://vidyastra-prep.vercel.app/)
[![Questions](https://img.shields.io/badge/GENERATES-10--50_Questions-f59e0b?style=for-the-badge)](#)
[![Speed](https://img.shields.io/badge/IN_UNDER-60_Seconds-10b981?style=for-the-badge)](#)
[![Effort](https://img.shields.io/badge/PREP_EFFORT-↓_80%25-ef4444?style=for-the-badge)](#)

*Vidyastra (विद्यास्त्र) — Sanskrit for "Weapon of Knowledge"*

</div>

---

## ▸ What is Vidyastra?

Exam prep is broken. Students spend hours hunting for the right questions — sorted by type, chapter, difficulty — often settling for low-quality material.

**Vidyastra fixes this with AI.**

Select your class, subject, and chapter. Choose question type. Get 10–50 CBSE-standard questions in under 60 seconds, complete with solutions. Download as PDF. Done.

---

## ▸ Key Features

### 🤖 Dual LLM Architecture
Two models working in tandem — **LLaMA** for question depth and **Groq** for speed. The system automatically balances quality and latency to give you the best output fast.

### 📐 Smart Subject Handling
- **Math & Science**: Strict numerical enforcement — no pure theory, real problem-solving questions with LaTeX rendered equations (`$E=mc^2$`, `$F=ma$`)
- **HOTS**: Higher Order Thinking Skills questions aligned to CBSE marking schemes
- **Case-Based**: Passage-based questions matching the latest exam pattern

### 📄 Practice Paper Mode
Generate a full 10-question mock paper with expert solutions. Timed, structured, exam-ready.

### ⚡ Performance Optimisations
- **Backend caching** — previously generated topics return in 0ms
- **Streaming typewriter effect** — questions appear in real time, no waiting
- **100+ educational facts** on the loading screen (curriculum-aligned)

### 📥 PDF Export
Clean, formatted question papers ready to print or share.

---

## ▸ Architecture

```
User Input
  │
  ▼
┌─────────────────────────────────────┐
│           React Frontend            │
│  Class → Subject → Chapter → Type  │
└──────────────────┬──────────────────┘
                   │ REST API
                   ▼
┌─────────────────────────────────────┐
│          Node.js + Express          │
│                                     │
│  ┌─────────────┐  ┌──────────────┐  │
│  │  Cache Layer│  │  RAG Pipeline│  │
│  │  (instant   │  │  (data/ dir) │  │
│  │  on repeat) │  └──────┬───────┘  │
│  └─────────────┘         │          │
│                           ▼          │
│  ┌────────────────────────────────┐  │
│  │         Dual LLM Router        │  │
│  │  LLaMA (quality) + Groq (speed)│  │
│  └────────────────────────────────┘  │
└──────────────────┬──────────────────┘
                   │
                   ▼
          Structured Questions
          + LaTeX + Solutions
```

---

## ▸ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React · Vite · TailwindCSS |
| Backend | Node.js · Express |
| AI Models | LLaMA 3 (via Ollama) · Groq API |
| Math Rendering | KaTeX · React Markdown |
| Auth | Supabase Auth |
| Deployment | Vercel (frontend) · Render (backend) |

---

## ▸ Project Structure

```
vidyastra/
├── client/          # React frontend
├── agents/          # LLM agent logic
├── rag/             # Retrieval-augmented generation
├── data/            # CBSE curriculum data
├── routes/          # Express API routes
├── services/        # LLM service handlers
├── middleware/      # Auth & validation
└── server.js        # Entry point
```

---

## ▸ Getting Started

```bash
# Clone the repo
git clone https://github.com/gagan13singh/CBSE-exam-oriented-Question-generator-ai-powered-.git
cd CBSE-exam-oriented-Question-generator-ai-powered-

# Install backend dependencies
npm install

# Setup environment
cp .env.example .env
# Add your GROQ_API_KEY to .env

# Start backend (port 3000)
node server.js

# In a new terminal — start frontend
cd client
npm install
npm run dev
```

> Requires [Ollama](https://ollama.com/) running locally: `ollama run llama3`

---

## ▸ Supported Classes & Subjects

```
Classes  : 9 · 10 · 11 · 12
Subjects : Physics · Chemistry · Mathematics · Biology
           Economics · Accountancy · Computer Science
Types    : Numerical · Case-Based · HOTS · Short Answer · Long Answer
```

---

<div align="center">

**Built by [Gagandeep Singh](https://github.com/gagan13singh)**

*Reducing exam prep effort by 80% — one question at a time.*

</div>
