const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const User = require("./models/User");

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();

    await User.deleteMany({});

    const password = await bcrypt.hash("Password@123", 10);

    await User.create([
      {
        name: "Admin Manager",
        email: "manager@edulead.com",
        password,
        role: "MANAGER",
      },
      {
        name: "Demo Counsellor",
        email: "counsellor@edulead.com",
        password,
        role: "COUNSELLOR",
      },
    ]);

    console.log("Users created successfully");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seedUsers();
