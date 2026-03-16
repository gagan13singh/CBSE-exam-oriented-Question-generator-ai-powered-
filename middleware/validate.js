/**
 * middleware/validate.js
 * Zod schemas for all request bodies.
 */

const { z } = require('zod');

const VALID_CLASSES = ['6', '7', '8', '9', '10', '11', '12'];
const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Exam-Oriented', 'Standard', 'HOTS'];
const VALID_QUESTION_TYPES = ['MCQ', 'Short Answer', 'Long Answer', 'Numerical', 'Case-Based', 'Graphical', 'HOTS', 'All'];

const questionSchema = z.object({
    class: z.string().refine(v => VALID_CLASSES.includes(v), {
        message: `Class must be one of: ${VALID_CLASSES.join(', ')}`
    }),
    subject: z.string().min(2, 'Subject is required').max(100),
    chapter: z.string().min(2, 'Chapter is required').max(200),
    topic: z.string().min(2, 'Topic is required').max(200),
    difficulty: z.enum(VALID_DIFFICULTIES).optional().default('Exam-Oriented'),
    questionType: z.string().optional().default('All')
});

const paperSchema = z.object({
    class: z.string().refine(v => VALID_CLASSES.includes(v), {
        message: `Class must be one of: ${VALID_CLASSES.join(', ')}`
    }),
    subject: z.string().min(2).max(100),
    chapters: z.array(z.string().min(1)).min(1, 'At least one chapter required').max(10),
    totalQuestions: z.number().int().min(5).max(30).optional().default(10),
    difficulty: z.any().optional(),
    questionTypes: z.any().optional()
});

const gradeSchema = z.object({
    submissions: z.array(z.object({
        question: z.string().min(1),
        model_answer: z.string().min(1),
        student_answer: z.string().min(1),
        marks: z.number().positive()
    })).min(1, 'At least one submission required').max(30)
});

/**
 * Returns an Express middleware that validates req.body against a Zod schema.
 */
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: 'Invalid request data',
                details: result.error.errors.map(e => `${e.path.join('.') || 'field'}: ${e.message}`)
            });
        }
        req.body = result.data; // use the parsed (and defaulted) values
        next();
    };
}

module.exports = { validate, questionSchema, paperSchema, gradeSchema };
