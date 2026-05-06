import { z } from "zod";

// ─── Login ───────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  body: z.object({
    companyId: z
      .string({ required_error: "Company ID is required" })
      .trim()
      .min(1, "Company ID cannot be empty"),
    userEmail: z
      .string({ required_error: "User email is required" })
      .trim()
      .email("Invalid email format")
      .toLowerCase(),
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password cannot be empty"),
  }),
});

// ─── Forgot Password ─────────────────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  body: z.object({
    companyId: z
      .string({ required_error: "Company ID is required" })
      .trim()
      .min(1, "Company ID cannot be empty"),
    userEmail: z
      .string({ required_error: "User email is required" })
      .trim()
      .email("Invalid email format")
      .toLowerCase(),
  }),
});

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPasswordSchema = z.object({
  params: z.object({
    token: z
      .string({ required_error: "Reset token is required" })
      .min(1, "Reset token cannot be empty"),
  }),
  body: z
    .object({
      newPassword: z
        .string({ required_error: "New password is required" })
        .min(8, "Password must be at least 8 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
          "Password must contain uppercase, lowercase, number, and special character"
        ),
      confirmPassword: z.string({ required_error: "Confirm password is required" }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

// ─── Change Password ─────────────────────────────────────────────────────────
export const changePasswordSchema = z.object({
  body: z
    .object({
      oldPassword: z.string({ required_error: "Old password is required" }).min(1),
      newPassword: z
        .string({ required_error: "New password is required" })
        .min(8, "Password must be at least 8 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
          "Password must contain uppercase, lowercase, number, and special character"
        ),
      confirmPassword: z.string({ required_error: "Confirm password is required" }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
    .refine((data) => data.oldPassword !== data.newPassword, {
      message: "New password must be different from old password",
      path: ["newPassword"],
    }),
});

// ─── Delete Session ───────────────────────────────────────────────────────────
export const sessionIdParamSchema = z.object({
  params: z.object({
    sessionId: z
      .string({ required_error: "Session ID is required" })
      .regex(/^[a-f\d]{24}$/i, "Invalid session ID"),
  }),
});