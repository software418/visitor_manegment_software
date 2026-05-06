import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ─── Default Permissions Map ──────────────────────────────────────────────────
const defaultAdminPermissions = {
  allSettings: true,
  createGatePass: true,
  approveGatePass: true,
  checkInOut: true,
  cancelGatePass: true,
  viewReports: true,
  manageSystemUsers: true,
  companySettings: true,
  reprintGatePass: true,
  changeOwnPassword: true,
  viewActiveSessions: true,
};

const defaultManagerPermissions = {
  allSettings: false,
  createGatePass: true,
  approveGatePass: true,
  checkInOut: true,
  cancelGatePass: true,
  viewReports: false,
  manageSystemUsers: false,
  companySettings: false,
  reprintGatePass: false,
  changeOwnPassword: true,
  viewActiveSessions: true,
};

const defaultOperatorPermissions = {
  allSettings: false,
  createGatePass: true,
  approveGatePass: false,
  checkInOut: true,
  cancelGatePass: false,
  viewReports: false,
  manageSystemUsers: false,
  companySettings: false,
  reprintGatePass: false,
  changeOwnPassword: true,
  viewActiveSessions: true,
};

export const ROLE_DEFAULT_PERMISSIONS = {
  admin: defaultAdminPermissions,
  manager: defaultManagerPermissions,
  operator: defaultOperatorPermissions,
};

// ─── User Schema ──────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: [true, "Employee code is required"],
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
      default: null,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null, // personal email — optional
    },
    userEmail: {
      type: String,
      required: [true, "User email is required"],
      unique: true,
      trim: true,
      lowercase: true, // login credential
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // never returned in queries unless explicitly selected
      minlength: 8,
    },
    designation: {
      type: String,
      trim: true,
      default: null,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    userRole: {
      type: String,
      enum: {
        values: ["admin", "manager", "operator"],
        message: "Role must be admin, manager, or operator",
      },
      required: [true, "User role is required"],
    },
    permissions: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Permissions are required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Check-in/out tracking for system users (operators/managers on shift)
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    isCheckedIn: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────
userSchema.virtual("fullName").get(function () {
  return [this.firstName, this.middleName, this.lastName].filter(Boolean).join(" ");
});

// ─── Pre-save: Hash password ──────────────────────────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ isActive: 1 });
userSchema.index({ userRole: 1 });

const User = mongoose.model("User", userSchema);
export default User;