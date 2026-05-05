import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import env from "dotenv";


import logger from "./utils/logger.utils.js";
import AppError from "./utils/appError.js";

const app = express();
env.config();
// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());

//-----------------morgan setup with winston-----------------

morgan.token("user", (req) => req.user ? `ID:${req.user.id}` : "Guest");
morgan.token("success", (req, res) =>req.success ? `${req.success}` : "false");

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



export default app;