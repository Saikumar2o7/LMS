import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LoanApplication",
    required: true,
  },
  utrNumber: { type: String, required: true, unique: true },
  amount: { type: Number, required: true, min: 0.01 },
  paymentDate: { type: Date, required: true },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  paymentMethod: {
    // Added
    type: String,
    enum: ["bank_transfer", "cheque", "cash", "online"],
    default: "bank_transfer",
  },
  notes: { type: String }, // Added
  createdAt: { type: Date, default: Date.now },
});

// Index for faster queries
paymentSchema.index({ loanId: 1, paymentDate: -1 });

export const Payment = mongoose.model("Payment", paymentSchema);
