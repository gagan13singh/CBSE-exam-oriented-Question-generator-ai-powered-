/**
 * middleware/logger.js
 * NEW FILE — Winston request logger
 * 
 * Install first: npm install winston
 * Then add to server.js:
 *   const { requestLogger } = require('./middleware/logger');
 *   app.use(requestLogger);  ← after app.use(express.json(...))
 */

const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const extras = Object.keys(meta).length ? '  ' + JSON.stringify(meta) : '';
            return `${timestamp} [${level}] ${message}${extras}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
    ],
});

// Express middleware — logs every request with method, path, status, time
const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const ms = Date.now() - start;
        const status = res.statusCode;
        const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

        logger[level](`${req.method} ${req.path}`, {
            status,
            ms,
            ...(res.locals.provider ? { provider: res.locals.provider } : {}),
        });
    });

    next();
};

module.exports = { logger, requestLogger };