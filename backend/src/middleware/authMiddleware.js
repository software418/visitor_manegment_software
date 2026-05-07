import { verifyAccessToken } from "../utils/jwt.utils.js";
import User from "../features/user/user.model.js";
import AppError from "../utils/appError.js";
// ─── Authenticate ────────────────────────────────────────────────────────────
// Verifies access token and attaches user to req.user
// Use on every protected route

export const authenticate = async (req, res, next) => {
  try {
    // 1. Check header exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401, "UNAUTHORIZED");
    }

    // 2. Extract token
    const token = authHeader.split(" ")[1];

    // 3. Verify token — throws AppError if invalid or expired
    const decoded = verifyAccessToken(token);

    // Guard: ensure decoded payload contains userId
    if (!decoded || !decoded.userId) {
      throw new AppError("Invalid token payload", 401, "UNAUTHORIZED");
    }

    // 4. Check user still exists and is active
    const user = await User.findById(decoded.userId).select("_id userRole isActive permissions");

    if (!user) {
      throw new AppError("User no longer exists", 401, "UNAUTHORIZED");
    }

    if (user.isActive === false) {
      throw new AppError("Your account has been blocked", 403, "ACCOUNT_BLOCKED");
    }

    // 5. Attach user to request
    req.user = {
      userId: user._id,
      role: user.userRole,
      permissions: user.permissions,
    };

    next();
  } catch (err) {
    next(err);
  }
};
// require permission
export const requirePermission = (key) => (req, res, next) => {
  if (!req.user?.permissions?.[key]) {
    return next(new AppError("Forbidden", 403, "FORBIDDEN"));
  }
  next();
};
// ─── Authorize ───────────────────────────────────────────────────────────────
// Role-based access control — use after authenticate
// Usage: authorize("admin") or authorize("admin", "seller")

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403, "FORBIDDEN")
      );
    }
    next();
  };
};


