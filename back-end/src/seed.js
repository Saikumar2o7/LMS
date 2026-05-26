const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const users = [
  { email: "borrower@example.com", password: "password123", role: "borrower" },
  { email: "sales@example.com", password: "password123", role: "sales" },
  { email: "sanction@example.com", password: "password123", role: "sanction" },
  {
    email: "disbursement@example.com",
    password: "password123",
    role: "disbursement",
  },
  {
    email: "collection@example.com",
    password: "password123",
    role: "collection",
  },
  { email: "admin@example.com", password: "password123", role: "admin" },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await mongoose.connection
        .collection("users")
        .updateOne(
          { email: user.email },
          { $set: { ...user, password: hashedPassword } },
          { upsert: true },
        );
    }

    console.log("Seed completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
