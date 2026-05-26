import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: [
      "borrower",
      "sales",
      "sanction",
      "disbursement",
      "collection",
      "admin",
    ],
    required: true,
  },
  fullName: { type: String },
  phoneNumber: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
});

export const User = mongoose.model("User", userSchema);
