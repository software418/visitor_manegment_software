import User, { ROLE_DEFAULT_PERMISSIONS } from "./user.model.js";
import { Session } from "../auth/auth.model.js";
import AppError from "../../utils/AppError.js";
import logger from "../../utils/logger.utils.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a safe projection — never expose password in service responses.
 */
const SAFE_FIELDS = "-password";

/**
 * Merge role defaults with any custom permissions passed in.
 * Admin always gets full permissions; manager/operator get defaults + overrides.
 */
const resolvePermissions = (role, customPermissions = {}) => {
  const defaults = ROLE_DEFAULT_PERMISSIONS[role] || ROLE_DEFAULT_PERMISSIONS.operator;
  if (role === "admin") return { ...defaults }; // admins cannot have permissions reduced
  return { ...defaults, ...customPermissions };
};

// ─── Get Own Profile ──────────────────────────────────────────────────────────

export const getProfileService = async (userId) => {
  const user = await User.findById(userId).select(SAFE_FIELDS).populate("department", "depName depCode");
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  return user;
};

// ─── Update Own Profile ───────────────────────────────────────────────────────

export const updateProfileService = async (userId, updateData) => {
  // Strip fields a user cannot update on their own
  const { firstName, middleName, lastName, phone, email, designation, department } = updateData;
  const allowedUpdate = { firstName, middleName, lastName, phone, email, designation, department };

  // Remove undefined keys so mongoose doesn't nullify optional fields
  Object.keys(allowedUpdate).forEach((k) => allowedUpdate[k] === undefined && delete allowedUpdate[k]);

  const user = await User.findByIdAndUpdate(userId, allowedUpdate, {
    new: true,
    runValidators: true,
  })
    .select(SAFE_FIELDS)
    .populate("department", "depName depCode");

  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  logger.info(`User profile updated: ${userId}`);
  return user;
};

// ─── Delete Own Profile (soft delete / deactivate) ────────────────────────────

export const deleteProfileService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  if (user.userRole === "admin") {
    throw new AppError("Admin account cannot be self-deleted", 403, "FORBIDDEN");
  }

  await User.findByIdAndUpdate(userId, { isActive: false });
  await Session.deleteMany({ userId }); // invalidate all sessions

  logger.info(`User self-deactivated: ${userId}`);
};

// ─── Create User (Admin creates manager/operator) ─────────────────────────────

export const createUserService = async (adminId, userData) => {
  const { userEmail, employeeCode, userRole, permissions, ...rest } = userData;

  // Check duplicates
  const existing = await User.findOne({
    $or: [{ userEmail: userEmail.toLowerCase() }, { employeeCode }],
  });

  if (existing) {
    const field = existing.userEmail === userEmail.toLowerCase() ? "userEmail" : "employeeCode";
    throw new AppError(`${field} is already in use`, 409, "DUPLICATE_FIELD");
  }

  const resolvedPermissions = resolvePermissions(userRole, permissions);

  const user = await User.create({
    ...rest,
    userEmail: userEmail.toLowerCase(),
    employeeCode,
    userRole,
    permissions: resolvedPermissions,
  });

  logger.info(`New user created by admin ${adminId}: ${user._id} | role: ${userRole}`);

  const { password: _pw, ...safeUser } = user.toObject();
  return safeUser;
};

// ─── Get All Users ────────────────────────────────────────────────────────────

export const getAllUsersService = async ({ role, isActive, search, page, limit }) => {
  const filter = {};

  if (role) filter.userRole = role;
  if (isActive !== undefined) filter.isActive = isActive;
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { userEmail: { $regex: search, $options: "i" } },
      { employeeCode: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter)
      .select(SAFE_FIELDS)
      .populate("department", "depName depCode")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─── Get User By ID ───────────────────────────────────────────────────────────

export const getUserByIdService = async (userId) => {
  const user = await User.findById(userId)
    .select(SAFE_FIELDS)
    .populate("department", "depName depCode");
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  return user;
};

// ─── Update User By Admin ─────────────────────────────────────────────────────

export const updateUserByAdminService = async (adminId, targetUserId, updateData) => {
  const { userRole, permissions, ...rest } = updateData;

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  // Admins cannot be demoted via this route
  if (targetUser.userRole === "admin") {
    throw new AppError("Admin accounts cannot be modified via this route", 403, "FORBIDDEN");
  }

  const update = { ...rest };
  if (userRole) {
    update.userRole = userRole;
    update.permissions = resolvePermissions(userRole, permissions);
  } else if (permissions) {
    update.permissions = resolvePermissions(targetUser.userRole, permissions);
  }

  const user = await User.findByIdAndUpdate(targetUserId, update, {
    new: true,
    runValidators: true,
  })
    .select(SAFE_FIELDS)
    .populate("department", "depName depCode");

  logger.info(`User ${targetUserId} updated by admin ${adminId}`);
  return user;
};

// ─── Set Active / Inactive ────────────────────────────────────────────────────

export const setUserActiveStatusService = async (adminId, targetUserId, isActive) => {
  const user = await User.findById(targetUserId);
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  if (user.userRole === "admin") {
    throw new AppError("Admin status cannot be changed via this route", 403, "FORBIDDEN");
  }

  await User.findByIdAndUpdate(targetUserId, { isActive });

  if (!isActive) {
    // Revoke all sessions when deactivating
    await Session.deleteMany({ userId: targetUserId });
    logger.info(`User ${targetUserId} deactivated by admin ${adminId}. Sessions cleared.`);
  } else {
    logger.info(`User ${targetUserId} activated by admin ${adminId}`);
  }
};

// ─── Delete User (Hard delete — Admin only) ───────────────────────────────────

export const deleteUserService = async (adminId, targetUserId) => {
  const user = await User.findById(targetUserId);
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  if (user.userRole === "admin") {
    throw new AppError("Admin accounts cannot be deleted via this route", 403, "FORBIDDEN");
  }

  await User.deleteOne({ _id: targetUserId });
  await Session.deleteMany({ userId: targetUserId });

  logger.info(`User ${targetUserId} permanently deleted by admin ${adminId}`);
};

// ─── Check In ─────────────────────────────────────────────────────────────────

export const checkInService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  if (user.isCheckedIn) throw new AppError("Already checked in", 400, "ALREADY_CHECKED_IN");

  const updated = await User.findByIdAndUpdate(
    userId,
    { isCheckedIn: true, checkInTime: new Date(), checkOutTime: null },
    { new: true }
  ).select(SAFE_FIELDS);

  logger.info(`User checked in: ${userId}`);
  return updated;
};

// ─── Check Out ────────────────────────────────────────────────────────────────

export const checkOutService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  if (!user.isCheckedIn) throw new AppError("Not checked in", 400, "NOT_CHECKED_IN");

  const updated = await User.findByIdAndUpdate(
    userId,
    { isCheckedIn: false, checkOutTime: new Date() },
    { new: true }
  ).select(SAFE_FIELDS);

  logger.info(`User checked out: ${userId}`);
  return updated;
};