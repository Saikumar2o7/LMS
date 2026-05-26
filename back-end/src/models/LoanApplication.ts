import mongoose from "mongoose";

const loanApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Personal Details
  personalDetails: {
    fullName: { type: String, required: true },
    pan: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    monthlySalary: { type: Number, required: true },
    employmentMode: {
      type: String,
      enum: ["Salaried", "Self-Employed", "Unemployed"],
      required: true,
    },
  },

  // Salary Slip
  salarySlip: {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    uploadDate: Date,
    filePath: String, // Added for file storage
  },

  // Loan Configuration
  loanConfig: {
    amount: { type: Number, min: 50000, max: 500000 },
    tenure: { type: Number, min: 30, max: 365 },
    interestRate: { type: Number, default: 12 },
    simpleInterest: Number,
    totalRepayment: Number,
  },

  // Status Tracking
  status: {
    type: String,
    enum: [
      "draft",
      "applied",
      "sanctioned",
      "rejected",
      "disbursed",
      "active",
      "closed",
    ],
    default: "draft",
  },

  // Sanction Module
  sanctionDetails: {
    approved: { type: Boolean },
    rejectedReason: String,
    sanctionedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sanctionedDate: Date,
    reviewedAt: Date, // Added for audit
  },

  // Disbursement Module
  disbursementDetails: {
    disbursedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    disbursedDate: Date,
    utrNumber: String,
    accountNumber: String, // Added for tracking
  },

  // Financial Tracking
  outstandingBalance: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  lastPaymentDate: { type: Date }, // Added for tracking

  // Audit Trail
  statusHistory: [
    {
      // Added for audit
      status: String,
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      changedAt: { type: Date, default: Date.now },
      notes: String,
    },
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt timestamp on save
loanApplicationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const LoanApplication = mongoose.model(
  "LoanApplication",
  loanApplicationSchema,
);
