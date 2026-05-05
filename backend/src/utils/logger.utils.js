import winston from "winston";

// custom format 
const customFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${level}: ${message} - { ${timestamp} }`;
});

const logger = winston.createLogger({

  // In development, log everything ('debug' and up). In prod, log 'info' and up.
  level: process.env.NODE_ENV === "production" ? "info" : "debug", 
  
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss A' }),
    // Do NOT apply format here, apply it in the transports so Console can have colors, but Files do not.
  ),
  transports: [
    // 1. Console (With Colors & Custom Format)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }), // Colorize the whole line
        customFormat // Use your custom layout! (Removed .simple())
      ),
    }),
    
    // 2. Files (No Colors, otherwise text files get weird symbols like \x1b[32m)
    new winston.transports.File({ 
      filename: "logs/error.log", 
      level: "error",
      format: customFormat 
    }),
    new winston.transports.File({ 
      filename: "logs/combined.log",
      format: customFormat 
    }),
  ],
});

export default logger;