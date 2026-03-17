/**
 * middleware/validate.js
 * FIXED: topic is now optional (min 0) — users often don't select a topic
 */

const { z } = require('zod');

const VALID_CLASSES = ['6', '7', '8', '9', '10', '11', '12'];
const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Exam-Oriented', 'Standard', 'HOTS'];

const questionSchema = z.object({
    class: z.string().refine(v => VALID_CLASSES.includes(v), {
        message: `Class must be one of: ${VALID_CLASSES.join(', ')}`
    }),
    subject: z.string().min(2, 'Subject required').max(100),
    chapter: z.string().min(2, 'Chapter required').max(200),
    // FIXED: topic is optional — empty string becomes the chapter name
    topic: z.string().max(200).optional().default(''),
    difficulty: z.enum(VALID_DIFFICULTIES).optional().default('Exam-Oriented'),
    questionType: z.string().optional().default('All'),
});

const paperSchema = z.object({
    class: z.string().refine(v => VALID_CLASSES.includes(v), {
        message: `Class must be one of: ${VALID_CLASSES.join(', ')}`
    }),
    subject: z.string().min(2).max(100),
    chapters: z.array(z.string().min(1)).min(1).max(10),
    totalQuestions: z.number().int().min(5).max(30).optional().default(10),
    difficulty: z.any().optional(),
    questionTypes: z.any().optional(),
});

const gradeSchema = z.object({
    submissions: z.array(z.object({
        question: z.string().min(1),
        model_answer: z.string().min(1),
        student_answer: z.string().min(1),
        marks: z.number().positive(),
    })).min(1).max(30),
});

function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: 'Invalid request data',
                details: result.error.issues.map(e =>
                    `${e.path.join('.') || 'field'}: ${e.message}`
                ),
            });
        }
        req.body = result.data;
        next();
    };
}

module.exports = { validate, questionSchema, paperSchema, gradeSchema };