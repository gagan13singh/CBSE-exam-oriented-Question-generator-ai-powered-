/**
 * services/prompt-builder.js
 *
 * FIXES applied:
 *  1. NCERT context is now labelled as "reference for answers only" — the LLM
 *     cannot use RAG context to invent a different question topic.
 *  2. Topic + Chapter are repeated in bold inside the JSON instruction so
 *     the LLM cannot drift to a different subject.
 *  3. Added an explicit "TOPIC LOCK" rule: every question MUST be about the
 *     specified chapter/topic. If the context doesn't match, ignore it.
 *  4. Self-check now includes a topic-consistency check.
 */

function getBloomsLevel(studentClass) {
    const cls = parseInt(studentClass);
    if (cls >= 11) return 'Analyze, Evaluate, Create (High School Level)';
    if (cls >= 9) return 'Apply, Understand, Remember (Secondary Level)';
    return 'Remember, Understand (Basic Level)';
}

function getQuestionRequirements(subject) {
    const isMath = subject.toLowerCase().includes('math');
    return isMath
        ? `STRICT MATH RULE: ALL QUESTIONS MUST BE 100% NUMERICAL/PROBLEM-SOLVING. NO THEORY. NO DEFINITIONS.
1. [Numerical / Problem Solving] — standard calculation with step-by-step solution
2. [MCQ] — requires calculation to find the answer, NOT theoretical
3. [Graphical / Diagrammatic] — find area/slope/relation from graph; include 'visualization_hint'
4. [Case-Based] — real-world scenario requiring numerical analysis
5. [HOTS] — complex multi-concept calculation`
        : `1. [Numerical / Problem Solving] — mandatory LaTeX for all math/units
2. [Theoretical / Definition] — clear and concise with examples
3. [Graphical / Diagrammatic] — include 'visualization_hint' describing the diagram
4. [Case-Based] — short context paragraph followed by the question
5. [HOTS] — requires synthesis of multiple concepts`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  QUESTION GENERATION PROMPT
// ─────────────────────────────────────────────────────────────────────────────
function buildQuestionPrompt({ studentClass, subject, chapter, topic, difficulty, ncertContext }) {
    const bloomsLevel = getBloomsLevel(studentClass);
    const requirements = getQuestionRequirements(subject);

    // Build the RAG section — explicitly tell the model what the context is for
    const ragSection = ncertContext
        ? `NCERT REFERENCE MATERIAL (use ONLY for answer accuracy and key points — do NOT change the question topic):
--- BEGIN NCERT TEXT ---
${ncertContext.substring(0, 6000)}
--- END NCERT TEXT ---

⚠ IMPORTANT: The NCERT text above is supplementary reference. 
  • ALL questions MUST be about: ${subject} → ${chapter} → ${topic}
  • If the NCERT text above is about a different topic, IGNORE it for question writing.
  • Use it ONLY to verify facts, formulas, and key points in your ANSWERS.`
        : `No NCERT PDF indexed for this topic. Use your internal CBSE 2024-25 knowledge strictly for: ${subject} → ${chapter} → ${topic}`;

    return `You are a SENIOR CBSE EXAM PAPER SETTER with 20+ years of experience.

══════════════════════════════════════════════════════
  TOPIC LOCK — ALL 5 QUESTIONS MUST BE ABOUT:
  Class   : ${studentClass}
  Subject : ${subject}
  Chapter : ${chapter}
  Topic   : ${topic}
  This is NON-NEGOTIABLE. Do not drift to any other topic.
══════════════════════════════════════════════════════

DIFFICULTY    : ${difficulty}
BLOOM'S LEVEL : ${bloomsLevel}

${ragSection}

GENERATE EXACTLY 5 QUESTIONS — ALL ABOUT "${topic}" in "${chapter}":
${requirements}

FORMATTING RULES:
1. LaTeX: every formula, variable, unit in single dollar signs — $F = ma$, $5\\;\\text{kg}$
2. JSON strings: double-escape backslashes — "$\\\\frac{1}{2}$" NOT "$\\frac{1}{2}$"
3. Language: English only
4. related_formulas: required for Numerical and HOTS questions
5. visualization_hint: required for Graphical questions

OUTPUT — valid JSON only, no markdown, no explanation:
{
    "valid_topic": true,
    "questions": [
        {
            "question_type": "Numerical",
            "marks": 3,
            "question": "Question about ${topic}...",
            "answer": "Step-by-step solution...",
            "key_points": ["Point 1", "Point 2"],
            "related_formulas": ["$formula$"],
            "visualization_hint": null
        }
    ]
}

SELF-CHECK before responding:
✓ Exactly 5 questions?
✓ Every question is about "${topic}" in "${chapter}"?
✓ Answers match the questions (not a different topic)?
✓ All LaTeX double-escaped in JSON?
✓ Valid JSON with no trailing commas?`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  PRACTICE PAPER PROMPT
// ─────────────────────────────────────────────────────────────────────────────
function buildPaperPrompt({ studentClass, subject, chapters, totalQuestions, difficulty, questionTypes, ncertContext }) {
    const isMath = subject.toLowerCase().includes('math');
    const timeAllowed = Math.max(30, totalQuestions * 3);

    const mathInstruction = isMath
        ? 'CRITICAL: ALL MATH QUESTIONS MUST BE 100% NUMERICAL/PROBLEM-SOLVING. No theory or definitions anywhere.'
        : '';

    const ragSection = ncertContext
        ? `NCERT REFERENCE (use for answer accuracy only — do NOT change question topics):
--- BEGIN NCERT TEXT ---
${ncertContext.substring(0, 5000)}
--- END NCERT TEXT ---
⚠ Questions must be from: ${chapters.join(', ')} — not from any other topic in the reference text.`
        : `No NCERT PDF indexed. Use internal CBSE 2024-25 knowledge for: ${subject} — ${chapters.join(', ')}`;

    return `You are a SENIOR CBSE EXAM PAPER SETTER.

══════════════════════════════════════════════════════
  PAPER LOCK — ALL ${totalQuestions} QUESTIONS MUST BE FROM:
  Class   : ${studentClass}
  Subject : ${subject}
  Chapters: ${chapters.join(', ')}
══════════════════════════════════════════════════════

Time allowed : ${timeAllowed} minutes
Difficulty   : ${JSON.stringify(difficulty)}
Question types: ${JSON.stringify(questionTypes)}

${mathInstruction}

${ragSection}

CBSE PAPER STRUCTURE (distribute ${totalQuestions} questions):
- Section A — MCQs, 1 mark each
- Section B — Short Answer, 2–3 marks each
- Section C — Long Answer / Case-Based, 4–5 marks each

OUTPUT — valid JSON only:
{
    "title": "Practice Paper — ${subject} (Class ${studentClass})",
    "time_allowed_mins": ${timeAllowed},
    "sections": [
        {
            "name": "Section A",
            "questions": [
                {
                    "id": "q1",
                    "type": "MCQ",
                    "marks": 1,
                    "question": "Question from ${chapters[0]}...",
                    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
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
                    "type": "Short Answer",
                    "marks": 3,
                    "question": "Question from ${chapters[0]}...",
                    "model_answer": "Expected key points..."
                }
            ]
        }
    ]
}

SELF-CHECK:
✓ Total questions = ${totalQuestions}?
✓ All questions from the specified chapters?
✓ Questions and answers consistent (same topic)?
✓ All LaTeX double-escaped?
✓ Valid JSON?`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  GRADING PROMPT
// ─────────────────────────────────────────────────────────────────────────────
function buildGradePrompt({ submissions }) {
    return `You are a STRICT CBSE EXAMINER grading student answers.

TASK: Grade each student answer against the model answer provided.

INPUT:
${JSON.stringify(submissions, null, 2)}

GRADING RULES:
1. MCQ — no partial marks. Correct = full marks. Wrong or blank = 0. Never give 0.5 for MCQ.
2. Subjective — award marks based on key concepts present. Partial marks allowed. Ignore minor spelling.
3. ZERO RULE — if student_answer is empty, "No Answer", or "No answer provided." → award exactly 0. Always.
4. Be educational in feedback — tell the student specifically what they missed.

OUTPUT — valid JSON only:
{
    "results": [
        {
            "question_id": "q1",
            "marks_awarded": 1,
            "max_marks": 1,
            "feedback": "Correct.",
            "model_answer": "Copy the model answer here for display"
        }
    ],
    "total_score": 0,
    "max_total_score": 0,
    "overall_feedback": "Summary feedback here."
}`;
}

module.exports = { buildQuestionPrompt, buildPaperPrompt, buildGradePrompt, getBloomsLevel };