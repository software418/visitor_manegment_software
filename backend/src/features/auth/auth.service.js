import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../user/user.model.js";
import { PasswordReset, Session } from "./auth.model.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt.utils.js";
import { sendEmail, passwordResetTemplate } from "../../utils/email.utils.js";
import AppError from "../../utils/appError.js";
import logger from "../../utils/logger.utils.js";

const MAX_SESSIONS = 3;
const SALT_ROUNDS = 12;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Hash a plain token (refresh / reset) before storing in DB.
 */
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/**
 * Enforce max-3-sessions rule. Removes oldest if limit reached.
 */
const enforceSessionLimit = async (userId) => {
  const sessions = await Session.find({ userId }).sort({ createdAt: 1 });
  if (sessions.length >= MAX_SESSIONS) {
    const oldest = sessions[0];
    await Session.deleteOne({ _id: oldest._id });
    logger.info(`Session limit reached for user ${userId}. Removed oldest session.`);
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────

export const loginService = async ({ companyId, userEmail, password }, req) => {
  // companyId validation is done at the company level (future multi-tenant);
  // for now we just verify the user exists and belongs to the right context.
  const user = await User.findOne({ userEmail: userEmail.toLowerCase(), isActive: true }).select(
    "+password"
  );

  if (!user) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  // Generate tokens
  const payload = { userId: user._id, role: user.userRole, permissions: user.permissions };
  const accessToken = generateAccessToken(payload);
  const rawRefreshToken = generateRefreshToken({ userId: user._id });

  // Enforce session limit then persist new session
  await enforceSessionLimit(user._id);
  await Session.create({
    userId: user._id,
    refreshToken: hashToken(rawRefreshToken),
    deviceInfo: req.headers["user-agent"] || null,
    ipAddress: req.ip || null,
  });

  logger.info(`User logged in: ${user._id} | role: ${user.userRole}`);

  const { password: _pw, ...userWithoutPassword } = user.toObject();
  return { user: userWithoutPassword, accessToken, rawRefreshToken };
};

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logoutService = async (userId, rawRefreshToken) => {
  if (rawRefreshToken) {
    await Session.deleteOne({
      userId,
      refreshToken: hashToken(rawRefreshToken),
    });
  }
  logger.info(`User logged out: ${userId}`);
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

export const refreshTokenService = async (rawRefreshToken, req) => {
  if (!rawRefreshToken) {
    throw new AppError("Refresh token not found", 401, "TOKEN_MISSING");
  }

  // Verify JWT signature and expiry
  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401, "TOKEN_INVALID");
  }

  const hashed = hashToken(rawRefreshToken);
  const session = await Session.findOne({
    userId: payload.userId,
    refreshToken: hashed,
  });

  if (!session) {
    throw new AppError("Session not found. Please log in again.", 401, "SESSION_NOT_FOUND");
  }

  const user = await User.findById(payload.userId);
  if (!user || !user.isActive) {
    throw new AppError("User not found or inactive", 401, "USER_INACTIVE");
  }

  // Rotate: delete old session, create new one
  await Session.deleteOne({ _id: session._id });

  const newRawRefreshToken = generateRefreshToken({ userId: user._id });
  await Session.create({
    userId: user._id,
    refreshToken: hashToken(newRawRefreshToken),
    deviceInfo: req.headers["user-agent"] || null,
    ipAddress: req.ip || null,
  });

  const newAccessToken = generateAccessToken({
    userId: user._id,
    role: user.userRole,
    permissions: user.permissions,
  });

  logger.info(`Token refreshed for user: ${user._id}`);
  return { accessToken: newAccessToken, rawRefreshToken: newRawRefreshToken };
};

// ─── Forgot Password ─────────────────────────────────────────────────────────

export const forgotPasswordService = async ({ companyId, userEmail }) => {
  const user = await User.findOne({ userEmail: userEmail.toLowerCase(), isActive: true });

  // Always respond with success to prevent user enumeration
  if (!user) {
    logger.warn(`Forgot password requested for non-existent email: ${userEmail}`);
    return;
  }

  // Invalidate any existing unused tokens
  await PasswordReset.deleteMany({ userId: user._id, used: false });

  const rawToken = crypto.randomBytes(32).toString("hex");
  await PasswordReset.create({
    userId: user._id,
    token: hashToken(rawToken),
  });

  const resetLink = `${process.env.CLIENT_URL}/auth/reset-password/${rawToken}`;
  return { resetLink };
  await sendEmail(user.email || user.userEmail, "Password Reset Request", passwordResetTemplate(resetLink));
  logger.info(`Password reset email sent for user: ${user._id}`);
};

// ─── Reset Password ───────────────────────────────────────────────────────────

export const resetPasswordService = async ({ token, newPassword }) => {
  const hashed = hashToken(token);
  const resetRecord = await PasswordReset.findOne({
    token: hashed,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!resetRecord) {
    throw new AppError("Invalid or expired reset token", 400, "TOKEN_INVALID");
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await User.findByIdAndUpdate(resetRecord.userId, { password: hashedPassword });

  // Mark token as used
  resetRecord.used = true;
  await resetRecord.save();

  // Invalidate all sessions for security
  await Session.deleteMany({ userId: resetRecord.userId });

  logger.info(`Password reset successful for user: ${resetRecord.userId}`);
};

// ─── Change Password ─────────────────────────────────────────────────────────

export const changePasswordService = async (userId, { oldPassword, newPassword }) => {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new AppError("Old password is incorrect", 400, "INVALID_CREDENTIALS");
  }

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();

  // Revoke all other sessions except current would need sessionId; here we clear all
  await Session.deleteMany({ userId });

  logger.info(`Password changed for user: ${userId}`);
};

// ─── Get Active Sessions ──────────────────────────────────────────────────────

export const getSessionsService = async (userId, requestingUser) => {
  const query = requestingUser.role === "admin" ? {} : { userId };

  const sessions = await Session.find(query)
    .select("-refreshToken") // never expose hashed token
    .populate("userId", "firstName lastName userEmail userRole")
    .sort({ createdAt: -1 });

  return sessions;
};

// ─── Delete Session ───────────────────────────────────────────────────────────

export const deleteSessionService = async (sessionId, requestingUser) => {
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new AppError("Session not found", 404, "SESSION_NOT_FOUND");
  }

  // Non-admins can only delete their own sessions
  if (
    requestingUser.role !== "admin" &&
    session.userId.toString() !== requestingUser.userId.toString()
  ) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  await Session.deleteOne({ _id: sessionId });
  logger.info(`Session ${sessionId} revoked by user ${requestingUser.userId}`);
};