import winston from 'winston';
import path from 'path';
import fs from 'fs/promises';

// Create logs folder if it doesn't exist
const logDirectory = path.join(process.cwd(), 'logs');
await fs.mkdir(logDirectory, { recursive: true });

// Create a Winston logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    // File transport for daily logs
    new winston.transports.File({
      filename: path.join(logDirectory, `${new Date().toISOString().split('T')[0]}.log`),
    }),
    // Console transport for terminal output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    }),
  ],
});

// Log cleanup function
async function cleanOldLogs() {
  const files = await fs.readdir(logDirectory);
  const now = Date.now();

  for (const file of files) {
    const filePath = path.join(logDirectory, file);
    const stat = await fs.stat(filePath);

    if (now - stat.mtimeMs > 7 * 24 * 60 * 60 * 1000) {
      await fs.unlink(filePath);
      logger.info(`Deleted old log file: ${file}`);
    }
  }
}

// Schedule log cleanup (runs once daily)
setInterval(cleanOldLogs, 24 * 60 * 60 * 1000);
cleanOldLogs(); // Initial cleanup on startup

export default logger;
