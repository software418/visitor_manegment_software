import { z } from "zod";

// ─── Reusable field definitions ───────────────────────────────────────────────
const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID format")
  .optional()
  .nullable();

const phoneNumber = z
  .string()
  .trim()
  .regex(/^\+?[\d\s\-().]{7,15}$/, "Invalid phone number format");

const permissionsSchema = z
  .object({
    allSettings: z.boolean().optional(),
    createGatePass: z.boolean().optional(),
    approveGatePass: z.boolean().optional(),
    checkInOut: z.boolean().optional(),
    cancelGatePass: z.boolean().optional(),
    viewReports: z.boolean().optional(),
    manageSystemUsers: z.boolean().optional(),
    companySettings: z.boolean().optional(),
    reprintGatePass: z.boolean().optional(),
    changeOwnPassword: z.boolean().optional(),
    viewActiveSessions: z.boolean().optional(),
  })
  .optional();

// ─── Create User (Admin only — via system user settings) ─────────────────────
export const createUserSchema = z.object({
  body: z.object({
    employeeCode: z
      .string({ required_error: "Employee code is required" })
      .trim()
      .min(1, "Employee code cannot be empty"),
    firstName: z
      .string({ required_error: "First name is required" })
      .trim()
      .min(1, "First name cannot be empty"),
    middleName: z.string().trim().optional().nullable(),
    lastName: z
      .string({ required_error: "Last name is required" })
      .trim()
      .min(1, "Last name cannot be empty"),
    phone: phoneNumber,
    email: z.string().trim().email("Invalid personal email").optional().nullable(),
    userEmail: z
      .string({ required_error: "User email is required" })
      .trim()
      .email("Invalid user email"),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Password must contain uppercase, lowercase, number, and special character"
      ),
    designation: z.string().trim().optional().nullable(),
    department: objectId,
    userRole: z.enum(["manager", "operator"], {
      required_error: "Role is required",
      invalid_type_error: "Role must be manager or operator",
    }),
    permissions: permissionsSchema,
  }),
});

// ─── Update Own Profile ───────────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1).optional(),
    middleName: z.string().trim().optional().nullable(),
    lastName: z.string().trim().min(1).optional(),
    phone: phoneNumber.optional(),
    email: z.string().trim().email("Invalid email").optional().nullable(),
    designation: z.string().trim().optional().nullable(),
    department: objectId,
  }),
});

// ─── Update User by Admin ─────────────────────────────────────────────────────
export const updateUserByAdminSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID"),
  }),
  body: z.object({
    firstName: z.string().trim().min(1).optional(),
    middleName: z.string().trim().optional().nullable(),
    lastName: z.string().trim().min(1).optional(),
    phone: phoneNumber.optional(),
    email: z.string().trim().email("Invalid email").optional().nullable(),
    designation: z.string().trim().optional().nullable(),
    department: objectId,
    userRole: z.enum(["manager", "operator"]).optional(),
    permissions: permissionsSchema,
  }),
});

// ─── User ID Param ────────────────────────────────────────────────────────────
export const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID"),
  }),
});

// ─── Get All Users — Query Filters ───────────────────────────────────────────
export const getAllUsersSchema = z.object({
  query: z.object({
    role: z.enum(["admin", "manager", "operator"]).optional(),
    isActive: z
      .string()
      .transform((v) => v === "true")
      .optional(),
    search: z.string().trim().optional(),
    page: z
      .string()
      .transform(Number)
      .pipe(z.number().int().positive())
      .optional()
      .default("1"),
    limit: z
      .string()
      .transform(Number)
      .pipe(z.number().int().min(1).max(100))
      .optional()
      .default("20"),
  }),
});