import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const users = [
  {
    email: "borrower@example.com",
    password: "password123",
    role: "borrower",
    fullName: "Test Borrower",
  },
  {
    email: "sales@example.com",
    password: "password123",
    role: "sales",
    fullName: "Sales Executive",
  },
  {
    email: "sanction@example.com",
    password: "password123",
    role: "sanction",
    fullName: "Sanction Officer",
  },
  {
    email: "disbursement@example.com",
    password: "password123",
    role: "disbursement",
    fullName: "Disbursement Officer",
  },
  {
    email: "collection@example.com",
    password: "password123",
    role: "collection",
    fullName: "Collection Officer",
  },
  {
    email: "admin@example.com",
    password: "password123",
    role: "admin",
    fullName: "System Admin",
  },
];

async function seed() {
  try {
    console.log(`Connecting to MongoDB at ${process.env.MONGODB_URI}...`);
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB successfully");

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const result = await mongoose.connection.collection("users").updateOne(
        { email: user.email },
        {
          $setOnInsert: {
            email: user.email,
            password: hashedPassword,
            role: user.role,
            fullName: user.fullName,
            createdAt: new Date(),
          },
        },
        { upsert: true },
      );

      if (result.upsertedCount > 0) {
        console.log(`Created user ${user.email}...`);
      } else {
        console.log(`User ${user.email} already exists...`);
      }
    }

    console.log("\n✅ Seed completed successfully!\n");
    console.log("Test Credentials:");
    console.log("================");
    users.forEach((user) => {
      console.log(`${user.role.padEnd(12)}: ${user.email} / ${user.password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
