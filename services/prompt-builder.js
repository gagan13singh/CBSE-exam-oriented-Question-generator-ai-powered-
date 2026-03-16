/**
 * services/prompt-builder.js
 * All LLM prompts in one place — easy to tune without touching route logic.
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
        ? `STRICT MATH RULE: QUESTIONS MUST BE 100% NUMERICAL/PROBLEM-SOLVING. NO THEORY. NO DEFINITIONS.
1. [Numerical / Problem Solving] (Standard calculation with step-by-step solution)
2. [MCQ] (Must require calculation to find the answer. NO theoretical MCQs)
3. [Graphical / Diagrammatic] (Find area/slope/relation from graph. Provide 'visualization_hint')
4. [Case-Based] (Real-world scenario requiring numerical analysis)
5. [HOTS] (Complex multi-concept problem)`
        : `1. [Numerical / Problem Solving] (Mandatory LaTeX for ALL math/units)
2. [Theoretical / Definition] (Clear, concise with examples)
3. [Graphical / Diagrammatic] (Provide 'visualization_hint' describing the diagram)
4. [Case-Based] (Provide a short context paragraph then ask the question)
5. [HOTS] (High Order Thinking Skills — requires synthesis of multiple concepts)`;
}

/**
 * Build the question generation prompt.
 */
function buildQuestionPrompt({ studentClass, subject, chapter, topic, difficulty, ncertContext }) {
    const bloomsLevel = getBloomsLevel(studentClass);
    const requirements = getQuestionRequirements(subject);

    return `You are a SENIOR CBSE EXAM PAPER SETTER with 20+ years of experience.

CRITICAL INSTRUCTION: Generate EXACTLY 5 (FIVE) questions. No more, no fewer.

CONTEXT:
- Class: ${studentClass}
- Subject: ${subject}
- Chapter: ${chapter}
- Topic: ${topic}
- Difficulty: ${difficulty}
- BLOOM'S TAXONOMY LEVEL: ${bloomsLevel}

NCERT GROUNDING (RAG):
${ncertContext
        ? `Use the following NCERT textbook content to ensure 100% syllabus compliance and factual accuracy:\n\n--- BEGIN NCERT TEXT ---\n${ncertContext}\n--- END NCERT TEXT ---`
        : 'No specific NCERT PDF found. Rely strictly on your internal knowledge of the CBSE Syllabus (NCERT 2024-25).'}

REQUIREMENTS FOR THE 5 QUESTIONS (GENERATE ALL 5):
${requirements}

STRICT LATEX & FORMATTING RULES:
1. ALL MATH IS LATEX: Every variable ($x$), number with unit ($5\\;\\text{kg}$), and formula must be in LaTeX enclosed in single dollar signs.
2. DOUBLE ESCAPE LATEX: Use double backslashes in JSON strings (e.g., "$\\\\frac{1}{2}$", "$\\\\sin(x)$"). NEVER single backslashes.
3. LANGUAGE: English only. Proper grammar and spelling.
4. RELATED FORMULAS: For Numerical/HOTS questions, always populate "related_formulas".
5. VISUALIZATION HINT: For Graphical questions, describe the diagram in "visualization_hint".

OUTPUT: Respond ONLY with valid JSON matching this exact schema:
{
    "valid_topic": true,
    "questions": [
        {
            "question_type": "Numerical",
            "marks": 3,
            "question": "Question text with LaTeX...",
            "answer": "Step-by-step solution...",
            "key_points": ["Key point 1", "Key point 2"],
            "related_formulas": ["$F = ma$", "$a = \\\\frac{v-u}{t}$"],
            "visualization_hint": null
        }
    ]
}

SELF-CHECK BEFORE RESPONDING:
- Exactly 5 questions in the array? ✓
- All LaTeX double-escaped? ✓
- No spelling errors? ✓
- Valid JSON? ✓`;
}

/**
 * Build the full paper generation prompt.
 */
function buildPaperPrompt({ studentClass, subject, chapters, totalQuestions, difficulty, questionTypes, ncertContext }) {
    const isMath = subject.toLowerCase().includes('math');
    const mathInstruction = isMath
        ? 'CRITICAL: ALL MATH QUESTIONS MUST BE 100% NUMERICAL/PROBLEM-SOLVING. No theory or definitions, even in MCQs.'
        : '';
    const timeAllowed = Math.max(30, totalQuestions * 3);

    return `You are a SENIOR CBSE EXAM PAPER SETTER.

CRITICAL TASK: Generate a COMPLETE PRACTICE PAPER with EXACTLY ${totalQuestions} questions.
You MUST NOT stop until you have generated all ${totalQuestions} questions.

CONTEXT:
- Class: ${studentClass}
- Subject: ${subject}
- Chapters: ${chapters.join(', ')}
- Total Questions Required: ${totalQuestions}
- Difficulty Profile: ${JSON.stringify(difficulty)}
- Question Types: ${JSON.stringify(questionTypes)}
- Time Allowed: ${timeAllowed} minutes

${mathInstruction}

NCERT CONTENT:
${ncertContext ? ncertContext.substring(0, 5000) : 'Use standard CBSE syllabus.'}

CBSE PAPER STRUCTURE:
- Section A: MCQs (1 mark each) — fill this section first
- Section B: Short Answer (2-3 marks each)
- Section C: Long Answer / Case-Based (4-5 marks each)
- Distribute ${totalQuestions} questions across sections logically

OUTPUT: Respond ONLY with valid JSON matching this exact schema:
{
    "title": "Practice Paper - ${subject} (Class ${studentClass})",
    "time_allowed_mins": ${timeAllowed},
    "sections": [
        {
            "name": "Section A",
            "questions": [
                {
                    "id": "q1",
                    "type": "MCQ",
                    "marks": 1,
                    "question": "Question text...",
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
                    "question": "Question text...",
                    "model_answer": "Expected key points..."
                }
            ]
        }
    ]
}

SELF-CHECK:
- Total questions across all sections = ${totalQuestions}? ✓
- CBSE board pattern followed? ✓
- All LaTeX double-escaped? ✓
- Valid JSON? ✓`;
}

/**
 * Build the grading prompt.
 */
function buildGradePrompt({ submissions }) {
    return `You are a STRICT CBSE EXAMINER grading student answers.

TASK: Grade each student answer based on the model answer provided.

INPUT DATA:
${JSON.stringify(submissions, null, 2)}

GRADING GUIDELINES:
1. MCQs (Multiple Choice):
   - NO partial marking whatsoever.
   - Correct option = full marks. Wrong or blank = 0 marks. NEVER 0.5 for MCQs.

2. Subjective / Short / Long Answers:
   - Award marks based on key concepts present in the student answer.
   - Be fair but strict. Ignore minor spelling errors.
   - Partial marks are allowed and expected for partially correct answers.

3. General Rules:
   - Award marks_awarded out of max_marks only.
   - Give specific, educational feedback so students understand what they missed.
   - CRITICAL ZERO-MARK RULE: If the student_answer is "No Answer", "No answer provided.", or empty, you MUST award EXACTLY 0 marks. Do not grade it as correct under any circumstances.

OUTPUT: Respond ONLY with valid JSON matching this exact schema:
{
    "results": [
        {
            "question_id": "q1",
            "marks_awarded": 1,
            "max_marks": 1,
            "feedback": "Correct! You identified the right option."
        }
    ],
    "total_score": 15,
    "max_total_score": 20,
    "overall_feedback": "Good performance. Revisit Chapter 3 for stronger answers on thermodynamics."
}`;
}

module.exports = { buildQuestionPrompt, buildPaperPrompt, buildGradePrompt, getBloomsLevel };
