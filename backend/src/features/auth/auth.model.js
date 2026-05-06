import mongoose from "mongoose";

// ─── Password Reset Model ────────────────────────────────────────────────────
const passwordResetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true, // stored as hashed token
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 min
    },
    used: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-delete expired documents (TTL index)
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ─── Session Model ───────────────────────────────────────────────────────────
const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    refreshToken: {
      type: String,
      required: true, // stored as hashed token
    },
    deviceInfo: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  },
  { timestamps: true }
);

// Auto-delete expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ userId: 1 });

export const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);
export const Session = mongoose.model("Session", sessionSchema);