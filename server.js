require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ollama Configuration
const OLLAMA_API_URL = "http://localhost:11434/api/generate";
const MODEL_NAME = "llama3";

/**
 * Reads NCERT PDF context if available.
 */
async function loadNCERTContext(subject, chapter) {
    const dataDir = path.join(__dirname, 'data', 'ncert');
    if (!fs.existsSync(dataDir)) return null;

    try {
        const files = fs.readdirSync(dataDir);
        // Simple matching: find a PDF that has both subject and chapter in its name (case insensitive)
        const matchedFile = files.find(file =>
            file.toLowerCase().includes(subject.toLowerCase()) &&
            file.toLowerCase().includes(chapter.toLowerCase().split(' ')[0]) && // partial match on first word of chapter
            file.endsWith('.pdf')
        );

        if (!matchedFile) return null;

        console.log(`--> Loading NCERT Context from: ${matchedFile}`);
        const dataBuffer = fs.readFileSync(path.join(dataDir, matchedFile));
        const data = await pdf(dataBuffer);

        // Truncate text if too long (approx 15k chars for basic context)
        return data.text.substring(0, 15000) + "... [TRUNCATED]";
    } catch (err) {
        console.error("Error reading NCERT PDF:", err);
        return null;
    }
}

/**
 * Returns Bloom's Taxonomy level based on class.
 */
function getBloomsLevel(studentClass) {
    const cls = parseInt(studentClass);
    if (cls >= 11) return "Analyze, Evaluate, Create (High School Level)";
    if (cls >= 9) return "Apply, Understand, Remember (Secondary Level)";
    return "Remember, Understand (Basic Level)";
}

/**
 * Call Ollama API to generate a question.
 */
const crypto = require('crypto'); // Built-in crypto module

// ... (other imports)

// In-memory Cache
const responseCache = new Map();

/**
 * Call Ollama API to generate a question.
 */
async function callLLM(prompt) {
    // 1. Generate SHA-256 Hash of the prompt
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex');

    // 2. Check Cache
    if (responseCache.has(promptHash)) {
        console.log(`--> ⚡ CACHE HIT! Serving instant response for hash: ${promptHash.substring(0, 8)}...`);
        return responseCache.get(promptHash);
    }

    console.log("--> 🐢 CACHE MISS. Calling Ollama (Llama 3)...");

    try {
        const response = await fetch(OLLAMA_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: prompt,
                stream: false,
                format: "json"
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.response;

        console.log("--> Raw Response:", text);

        // Clean up markdown code blocks if present
        let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // 🛡️ REPAIR LATEX BACKSLASHES (Fix for \frac -> \f -> FormFeed bug)
        // Detects patterns like \frac, \boldsymbol, \tau, \rho, \nu which start with valid JSON escape chars (\f, \b, \t, \r, \n)
        // and ensures they are double-escaped properly.
        cleanedText = cleanedText
            .replace(/\\frac/g, '\\\\frac')
            .replace(/\\boldsymbol/g, '\\\\boldsymbol')
            .replace(/\\tau/g, '\\\\tau')
            .replace(/\\rho/g, '\\\\rho')
            .replace(/\\nu/g, '\\\\nu')
            .replace(/\\theta/g, '\\\\theta'); // just in case

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(cleanedText);
        } catch (e) {
            console.error("JSON Parse Error on first try. Attempting aggressive repair...");
            // Aggressive repair: escape ALL backslashes that aren't already escaped
            // This is risky but helps when AI completely forgets escaping
            cleanedText = cleanedText.replace(/\\(?![/"\\bfnrtu])/g, '\\\\');
            jsonResponse = JSON.parse(cleanedText);
        }

        // 3. Store in Cache
        responseCache.set(promptHash, jsonResponse);
        console.log(`--> 💾 Response saved to cache.`);

        return jsonResponse;
    } catch (error) {
        console.error("Ollama API Error:", error);
        throw new Error("Failed to generate content from AI");
    }
}

// Endpoint: /generate-questions
app.post('/generate-questions', async (req, res) => {
    try {
        const { class: studentClass, subject, chapter, topic, difficulty, questionType } = req.body;

        // Basic Validation
        if (!studentClass || !subject || !chapter || !topic) {
            return res.status(400).json({ error: "Missing required fields: class, subject, chapter, topic" });
        }

        const difficultyLevel = difficulty || "Exam-Oriented";

        // --- EXTRACTION & PREPARATION ---
        const bloomsLevel = getBloomsLevel(studentClass);
        const ncertContext = await loadNCERTContext(subject, chapter);

        // --- PROMPT ENGINEERING ---
        const isMath = subject.toLowerCase().includes('math');

        const requirements = isMath
            ? `
            STRICT MATH RULE: QUESTIONS MUST BE 100% NUMERICAL/PROBLEM-SOLVING. NO THEORY. NO DEFINITIONS.
            1. [Numerical / Problem Solving] (Standard calculation)
            2. [MCQ] (Must require calculation to find the option. NO theoretical MCQs)
            3. [Graphical / Diagrammatic] (Find area/slope/relation from graph. Provide 'visualization_hint')
            4. [Case-Based] (Scenario allowing for numerical analysis)
            5. [HOTS] (Complex alignment of multiple concepts)
            `
            : `
            1. [Numerical / Problem Solving] (Mandatory LaTeX for ALL math/units)
            2. [Theoretical / Definition]
            3. [Graphical / Diagrammatic] (Provide 'visualization_hint')
            4. [Case-Based] (Provide a short case/paragraph)
            5. [HOTS] (High Order Thinking Skills)
            `;

        const systemPrompt = `
        You are a SENIOR CBSE EXAM PAPER SETTER (20+ Years Experience).
        
        CRITICAL INSTRUCTION: You MUST generate EXACTLY 5 (FIVE) questions. Do not generate fewer than 5.
        
        CONTEXT:
        - Class: ${studentClass}
        - Subject: ${subject}
        - Chapter: ${chapter}
        - Topic: ${topic}
        - Difficulty: ${difficultyLevel}
        - BLOOM'S TAXONOMY LEVEL: ${bloomsLevel}

        NCERT GROUNDING (RAG):
        ${ncertContext ? `Below is the relevant text extracted from the NCERT Textbook. USE THIS SOURCE to ensure facts, definitions, and formulas are 100% compliant with the syllabus.\n\n--- BEGIN NCERT TEXT ---\n${ncertContext}\n--- END NCERT TEXT ---\n` : "No specific NCERT PDF found. Rely strictly on your internal knowledge of the CBSE Syllabus (NCERT 2024-25)."}

        REQUIREMENTS FOR THE 5 QUESTIONS (GENERATE ALL 5):
        ${requirements}

        STRICT LATEX & VISUAL RULES:
        1. **ALL MATH IS LATEX**: Every single variable ($x$), number with unit ($5 kg$), and formula must be in LaTeX enclosed in single dollar signs ($E=mc^2$).
        2. **DOUBLE ESCAPE LATEX**: You MUST use double backslashes for LaTeX in JSON strings (e.g., "$\\frac{1}{2}$", "$\\sin(x)$"). NEVER use single backslashes.
        3. **SPELLING & GRAMMAR**: Double-check for typos. Write "Solution" (not Slution), "Prove" (not Pove).
        4. **RELATED FORMULAS**: For Numerical/HOTS, populate "related_formulas".
        5. **VISUALIZATION HINT**: For Graphical questions, describe the image detail in "visualization_hint".

        OUTPUT FORMAT (Strict JSON):
        {
            "valid_topic": true,
            "questions": [
                {
                    "question_type": "Numerical", 
                    "marks": 3,
                    "question": "Calculate force...", 
                    "answer": "Solution: First, we apply...",
                    "key_points": ["Step 1", "Step 2"],
                    "related_formulas": ["$F = ma$", "$a = \\frac{v-u}{t}$"],
                    "visualization_hint": "A block of mass M on a frictionless table..." (or null if not applicable)
                },
                ... (ENSURE THERE ARE EXACTLY 5 OBJECTS IN THIS ARRAY)
            ]
        }
        
        FINAL CHECK:
        - Do you have 5 questions?
        - Did you double-escape all LaTeX backslashes?
        - Did you check for typos?
        - Is the JSON valid?
        `;

        // Step 2: Call the LLM
        const aiResponse = await callLLM(systemPrompt);

        // Handle AI-detected validation error
        if (aiResponse.error) {
            return res.status(400).json({ error: aiResponse.error });
        }

        // Robust Response Handling (Fix for 1 vs 5 issue)
        let finalQuestions = [];
        if (aiResponse.questions) {
            if (Array.isArray(aiResponse.questions)) {
                finalQuestions = aiResponse.questions;
            } else if (typeof aiResponse.questions === 'object') {
                // AI returned a single object inside 'questions' key
                finalQuestions = [aiResponse.questions];
            }
        } else {
            // AI returned just the question object or array at root
            if (Array.isArray(aiResponse)) {
                finalQuestions = aiResponse;
            } else {
                finalQuestions = [aiResponse];
            }
        }

        // Step 3: Return the response
        res.json({
            success: true,
            data: finalQuestions,
            meta: {
                generated_at: new Date().toISOString(),
                model: MODEL_NAME,
                rag_source: ncertContext ? "NCERT PDF" : "Internal Knowledge",
                count: finalQuestions.length
            }
        });

    } catch (error) {
        console.error("Error generating question:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Endpoint: /generate-paper
app.post('/generate-paper', async (req, res) => {
    try {
        const { class: studentClass, subject, chapters, totalQuestions, difficulty, questionTypes } = req.body;

        if (!studentClass || !subject || !chapters || chapters.length === 0) {
            return res.status(400).json({ error: "Missing required fields: class, subject, chapters" });
        }

        const difficultyLevel = difficulty || "Standard";
        const ncertContext = await loadNCERTContext(subject, chapters[0]); // Load context from first chapter for now
        const explicitCount = totalQuestions || 10;

        const isMath = subject.toLowerCase().includes('math');
        const mathInstruction = isMath ? "CRITICAL: MATH QUESTIONS MUST BE 100% NUMERICAL/PROBLEM-SOLVING. NO THEORY/DEFINITIONS allowed, even in MCQs or Case Studies." : "";

        const systemPrompt = `
        You are a SENIOR CBSE EXAM PAPER SETTER.
        
        CRITICAL TASK: Generate a COMPLETE PRACTICE PAPER with EXACTLY ${explicitCount} questions.
        You MUST NOT stop until you have generated ${explicitCount} questions.
        
        CONTEXT:
        - Class: ${studentClass}
        - Subject: ${subject}
        - Chapters: ${chapters.join(', ')}
        - Total Questions Required: ${explicitCount}
        - Difficulty Profile: ${JSON.stringify(difficulty)}
        - Question Types: ${JSON.stringify(questionTypes)}
        
        ${mathInstruction}

        NCERT CONTENT:
        ${ncertContext ? ncertContext.substring(0, 5000) : "Use standard CBSE syllabus."}

        OUTPUT FORMAT (Strict JSON):
        {
            "title": "Practice Paper - ${subject}",
            "time_allowed_mins": ${Math.max(30, explicitCount * 3)},
            "sections": [
                {
                    "name": "Section A",
                    "questions": [
                        {
                            "id": "q1",
                            "type": "MCQ", 
                            "marks": 1,
                            "question": "Question text...", 
                            "options": ["A", "B", "C", "D"], 
                            "correct_option": "A",
                            "explanation": "Why A is correct..."
                        }
                    ]
                },
                {
                    "name": "Section B",
                    "questions": [
                         {
                            "id": "q5",
                            "type": "Subjective", 
                            "marks": 3,
                            "question": "Explain...", 
                            "model_answer": "Expected key points..."
                        }
                    ]
                }
            ]
        }
        
        STRICT RULES:
        1. TOTAL QUESTIONS MUST BE ${explicitCount}. Count them before distinguishing sections.
        2. Divide questions into Sections A and B logically (e.g., 5 in A, 5 in B).
        3. FOLLOW CBSE BOARD PATTERN (MCQs, Short Answer, Long Answer).
        4. ALL MATH in LaTeX ($...$).
        5. ENSURE BALANCED COVERAGE OF CHAPTERS.
        `;

        const aiResponse = await callLLM(systemPrompt);

        if (aiResponse.error) {
            return res.status(400).json({ error: aiResponse.error });
        }

        res.json({ success: true, data: aiResponse });

    } catch (error) {
        console.error("Error generating paper:", error);
        res.status(500).json({ error: "Failed to generate paper", details: error.message });
    }
});

// Endpoint: /grade-paper
app.post('/grade-paper', async (req, res) => {
    try {
        const { submissions } = req.body; // Array of { question, model_answer, student_answer, marks }

        if (!submissions || !Array.isArray(submissions)) {
            return res.status(400).json({ error: "Invalid submissions format" });
        }

        const systemPrompt = `
        You are a STRICT CBSE EXAMINER.
        
        TASK: Grade the student's answers based on the Model Answer.
        
        INPUT DATA:
        ${JSON.stringify(submissions)}

        GUIDELINES:
        1. **MCQs (Multiple Choice)**: 
           - ABSOLUTELY NO PARTIAL MARKING.
           - If Student option matches Correct option: Award FULL MARKS.
           - If unrelated or wrong: Award 0.
           - Example: 1 Mark MCQ = either 1 or 0. NEVER 0.5.
        
        2. **Subjective / Short / Long Answers**:
           - Award marks based on key concepts present.
           - Be fair but accurate.
           - IGNORE minor spelling mistakes.
        
        3. **General**:
           - STRICTLY return a JSON object with "results".

        OUTPUT FORMAT (Strict JSON):
        {
            "results": [
                {
                    "question_id": "...", 
                    "marks_awarded": 1, 
                    "max_marks": 1,
                    "feedback": "Correct option selected."
                }
            ],
            "total_score": 15,
            "max_total_score": 20,
            "overall_feedback": "Great performance in Section A..."
        }
        `;

        const aiResponse = await callLLM(systemPrompt);

        if (aiResponse.error) {
            return res.status(400).json({ error: aiResponse.error });
        }

        res.json({ success: true, data: aiResponse });

    } catch (error) {
        console.error("Error grading paper:", error);
        res.status(500).json({ error: "Failed to grade paper", details: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Endpoint accessible at http://localhost:${PORT}/generate-questions`);
});
