import {
  loginService,
  logoutService,
  refreshTokenService,
  forgotPasswordService,
  resetPasswordService,
  changePasswordService,
  getSessionsService,
  deleteSessionService,
} from "./auth.service.js";

// ─── Cookie Config ────────────────────────────────────────────────────────────
const REFRESH_COOKIE_NAME = "refreshToken";
const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/api/auth",
};

// ─── Login ───────────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { user, accessToken, rawRefreshToken } = await loginService(req.body, req);

    res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, refreshCookieOptions);

    res.status(200).json({
      status: 200,
      success: true,
      message: "Login successful",
      data: { user, accessToken },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies[REFRESH_COOKIE_NAME];
    await logoutService(req.user.userId, rawRefreshToken);

    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });

    res.status(200).json({
      status: 200,
      success: true,
      message: "Logged out successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
export const refreshToken = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies[REFRESH_COOKIE_NAME];
    const { accessToken, rawRefreshToken: newRawRefreshToken } = await refreshTokenService(
      rawRefreshToken,
      req
    );

    // Rotate cookie
    res.cookie(REFRESH_COOKIE_NAME, newRawRefreshToken, refreshCookieOptions);

    res.status(200).json({
      status: 200,
      success: true,
      message: "Token refreshed",
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Forgot Password ─────────────────────────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    await forgotPasswordService(req.body);

    // Always return 200 to prevent email enumeration
    res.status(200).json({
      status: 200,
      success: true,
      message: "If the email exists, a reset link has been sent.",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    await resetPasswordService({
      token: req.params.token,
      newPassword: req.body.newPassword,
    });

    res.status(200).json({
      status: 200,
      success: true,
      message: "Password reset successful. Please log in.",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Change Password ─────────────────────────────────────────────────────────
export const changePassword = async (req, res, next) => {
  try {
    await changePasswordService(req.user.userId, req.body);

    // Clear cookie since all sessions are invalidated
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });

    res.status(200).json({
      status: 200,
      success: true,
      message: "Password changed successfully. Please log in again.",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Sessions ─────────────────────────────────────────────────────────────
export const getSessions = async (req, res, next) => {
  try {
    const sessions = await getSessionsService(req.user.userId, req.user);

    res.status(200).json({
      status: 200,
      success: true,
      message: "Sessions fetched successfully",
      data: sessions,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Session ───────────────────────────────────────────────────────────
export const deleteSession = async (req, res, next) => {
  try {
    await deleteSessionService(req.params.sessionId, req.user);

    res.status(200).json({
      status: 200,
      success: true,
      message: "Session revoked successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};