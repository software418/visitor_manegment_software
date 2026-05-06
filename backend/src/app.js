import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import env from "dotenv";

import logger from "./utils/logger.utils.js";
import AppError from "./utils/appError.js";
import { sanitizeInput } from "./middleware/sanitize.middleware.js";

import authRoutes from "./features/auth/auth.routes.js";
import userRoutes from "./features/user/user.routes.js";


// Load environment variables from .env file
env.config();
const app = express();

// CORS configuration
const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    // Allow non-browser and same-origin requests that do not send Origin header.
    if (!origin) return callback(null, true);
    const normalizedOrigin = String(origin).trim().replace(/\/+$/, "");
    if (!allowedOrigins.length || allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
};

//-----------------Middleware setup-----------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(sanitizeInput);

//-----------------morgan setup with winston-----------------

morgan.token("user", (req) => (req.user ? `ID:${req.user.id}` : "Guest"));
morgan.token("success", (req, res) =>
  req.success ? `${req.success}` : "false",
);

const stream = { write: (message) => logger.http(message.trim()) };

// 3. Apply Morgan WITH the stream option attached!
app.use(
  morgan(
    "[:method]|| :url ||User::user ||Status::status  ||Success::success  ||ResponseTime: { :response-time ms }  ||Device: { :user-agent }",
    { stream: stream }, // This tells Morgan to use Winston!
  ),
);
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    data: {
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    },
  });
});

//-----------------Routes-----------------
app.use("/api", authRoutes);
app.use("/api/users", userRoutes);

export default app;
