import { Router } from "express";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  createUser,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  setUserActive,
  setUserInactive,
  deleteUser,
  checkIn,
  checkOut,
} from "./user.controller.js";
import { authenticate, authorize,requirePermission } from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import {
  createUserSchema,
  updateProfileSchema,
  updateUserByAdminSchema,
  userIdParamSchema,
  getAllUsersSchema,
} from "./user.validation.js";
import { rateLimiter } from "../../middleware/ratelimite.middleware.js";

const router = Router();

// All user routes require a valid access token
router.use(authenticate);
router.use(rateLimiter); // Apply rate limiting to all user routes
// ─── Own Profile ──────────────────────────────────────────────────────────────
router.get("/profile", getProfile);
router.put("/profile", validate(updateProfileSchema), updateProfile);
router.delete("/profile", deleteProfile);

// ─── Check In / Out (own shift tracking) ─────────────────────────────────────
router.post("/check-in", checkIn);
router.post("/check-out", checkOut);

// ─── Admin-only: System User Management ──────────────────────────────────────
router.post(
  "/",
  requirePermission("manageSystemUsers"),
  validate(createUserSchema),
  authorize("admin"),
  createUser,
);

router.get(
  "/",
  requirePermission("manageSystemUsers"),
  validate(getAllUsersSchema),
  authorize("admin"),
  getAllUsers,
);

router.get(
  "/:userId",
  requirePermission("manageSystemUsers"),
  validate(userIdParamSchema),
  authorize("admin"),
  getUserById,
);

router.put(
  "/:userId",
  requirePermission("manageSystemUsers"),
  validate(updateUserByAdminSchema),
  authorize("admin"),
  updateUserByAdmin,
);

router.patch(
  "/:userId/activate",
  requirePermission("manageSystemUsers"),
  validate(userIdParamSchema),
  authorize("admin"),
  setUserActive,
);

router.patch(
  "/:userId/deactivate",
  requirePermission("manageSystemUsers"),
  validate(userIdParamSchema),
  authorize("admin"),
  setUserInactive,
);

router.delete(
  "/:userId",
  requirePermission("manageSystemUsers"),
  validate(userIdParamSchema),
  authorize("admin"),
  deleteUser,
);

export default router;
