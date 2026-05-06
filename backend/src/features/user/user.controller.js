import {
  getProfileService,
  updateProfileService,
  deleteProfileService,
  createUserService,
  getAllUsersService,
  getUserByIdService,
  updateUserByAdminService,
  setUserActiveStatusService,
  deleteUserService,
  checkInService,
  checkOutService,
} from "./user.service.js";

// ─── Own Profile ──────────────────────────────────────────────────────────────

export const getProfile = async (req, res, next) => {
  try {
    const user = await getProfileService(req.user.userId);
    res.status(200).json({ status: 200, success: true, message: "Profile fetched", data: user });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await updateProfileService(req.user.userId, req.body);
    res.status(200).json({ status: 200, success: true, message: "Profile updated", data: user });
  } catch (err) {
    next(err);
  }
};

export const deleteProfile = async (req, res, next) => {
  try {
    await deleteProfileService(req.user.userId);
    res.status(200).json({ status: 200, success: true, message: "Account deactivated", data: null });
  } catch (err) {
    next(err);
  }
};

// ─── Admin — User Management ─────────────────────────────────────────────────

export const createUser = async (req, res, next) => {
  try {
    const user = await createUserService(req.user.userId, req.body);
    res.status(201).json({ status: 201, success: true, message: "User created successfully", data: user });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const result = await getAllUsersService(req.query);
    res.status(200).json({ status: 200, success: true, message: "Users fetched", data: result });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await getUserByIdService(req.params.userId);
    res.status(200).json({ status: 200, success: true, message: "User fetched", data: user });
  } catch (err) {
    next(err);
  }
};

export const updateUserByAdmin = async (req, res, next) => {
  try {
    const user = await updateUserByAdminService(req.user.userId, req.params.userId, req.body);
    res.status(200).json({ status: 200, success: true, message: "User updated", data: user });
  } catch (err) {
    next(err);
  }
};

export const setUserActive = async (req, res, next) => {
  try {
    await setUserActiveStatusService(req.user.userId, req.params.userId, true);
    res.status(200).json({ status: 200, success: true, message: "User activated", data: null });
  } catch (err) {
    next(err);
  }
};

export const setUserInactive = async (req, res, next) => {
  try {
    await setUserActiveStatusService(req.user.userId, req.params.userId, false);
    res.status(200).json({ status: 200, success: true, message: "User deactivated", data: null });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await deleteUserService(req.user.userId, req.params.userId);
    res.status(200).json({ status: 200, success: true, message: "User deleted permanently", data: null });
  } catch (err) {
    next(err);
  }
};

// ─── Check In / Out ───────────────────────────────────────────────────────────

export const checkIn = async (req, res, next) => {
  try {
    const user = await checkInService(req.user.userId);
    res.status(200).json({ status: 200, success: true, message: "Checked in successfully", data: user });
  } catch (err) {
    next(err);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    const user = await checkOutService(req.user.userId);
    res.status(200).json({ status: 200, success: true, message: "Checked out successfully", data: user });
  } catch (err) {
    next(err);
  }
};