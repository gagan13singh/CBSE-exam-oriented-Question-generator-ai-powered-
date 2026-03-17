// middleware/quota.js — NEW FILE
const usage = new Map(); // ip → { count, date }

function quotaCheck(limit = 10) {
    return (req, res, next) => {
        const key = req.ip;
        const today = new Date().toDateString();
        const entry = usage.get(key);

        if (!entry || entry.date !== today) {
            usage.set(key, { count: 1, date: today });
            return next();
        }
        if (entry.count >= limit) {
            return res.status(429).json({
                error: `Daily limit of ${limit} questions reached.`,
                message: 'Come back tomorrow or upgrade to Pro for unlimited access.',
                reset: 'midnight',
            });
        }
        entry.count++;
        next();
    };
}

module.exports = { quotaCheck };