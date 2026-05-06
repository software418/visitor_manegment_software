import { Router } from "express";
import {
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  getSessions,
  deleteSession,
} from "./auth.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { rateLimiter } from "../../middleware/ratelimite.middleware.js";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  sessionIdParamSchema,
} from "./auth.validation.js";

const router = Router();

// ─── Public Routes (no auth required) ────────────────────────────────────────
router.post("/login", rateLimiter("login"), validate(loginSchema), login);
router.post("/refresh-token", rateLimiter("refreshToken"), refreshToken);
router.post("/forgot-password", rateLimiter("forgotPassword"), validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password/:token", rateLimiter("resetPassword"), validate(resetPasswordSchema), resetPassword);

// ─── Protected Routes (access token required) ────────────────────────────────
router.use(authenticate);

router.post("/logout", logout);
router.post("/change-password",  validate(changePasswordSchema), changePassword);
router.get("/sessions", getSessions);
router.delete("/sessions/:sessionId",  validate(sessionIdParamSchema), deleteSession);

export default router;