import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Manually resolve the path to the .env in the project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); 



import mongoose from "mongoose";
import User, { ROLE_DEFAULT_PERMISSIONS } from "../features/user/user.model.js";


const seedAdmin = async () => {
  try {
    console.log("Database URI:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI );

    const adminExists = await User.findOne({ userEmail: "admin@vms.com" });
    if (adminExists) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    const admin = new User({
      employeeCode: "ADMIN001",
      firstName: "Super",
      lastName: "Admin",
      phone: "1234567890",
      userEmail: "admin@vms.com",
      password: "password123", // User should change this
      userRole: "admin",
      permissions: ROLE_DEFAULT_PERMISSIONS.admin,
      isActive: true,
    });

    await admin.save();
    console.log("Admin user seeded successfully. Email: admin@vms.com, Password: password123");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
