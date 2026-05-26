import type { Response } from "express";
import { LoanApplication } from "../models/LoanApplication.js";
import { Payment } from "../models/Payment.js";
import type { AuthRequest } from "../middleware/Auth.js";

export const collectionController = {
  // Get active (disbursed) loans
  async getActiveLoans(req: AuthRequest, res: Response) {
    try {
      const loans = await LoanApplication.find({
        status: { $in: ["disbursed", "active"] },
        outstandingBalance: { $gt: 0 },
      }).populate("userId", "email fullName phoneNumber");

      res.json(loans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active loans" });
    }
  },

  // Get closed loans
  async getClosedLoans(req: AuthRequest, res: Response) {
    try {
      const loans = await LoanApplication.find({
        status: "closed",
      }).populate("userId", "email fullName");

      res.json(loans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch closed loans" });
    }
  },

  // Record payment with comprehensive validations
  async recordPayment(req: AuthRequest, res: Response) {
    try {
      const { loanId, utrNumber, amount, paymentDate, paymentMethod, notes } =
        req.body;

      // Validate amount
      if (!amount || amount <= 0) {
        return res
          .status(400)
          .json({ error: "Payment amount must be greater than 0" });
      }

      // Validate payment date
      const paymentDateObj = new Date(paymentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(paymentDateObj.getTime())) {
        return res.status(400).json({ error: "Invalid payment date" });
      }

      if (paymentDateObj > new Date()) {
        return res
          .status(400)
          .json({ error: "Payment date cannot be in the future" });
      }

      // Validate UTR format (example - adjust based on your requirements)
      const utrRegex = /^[A-Z0-9]{10,20}$/i;
      if (!utrRegex.test(utrNumber)) {
        return res.status(400).json({
          error: "Invalid UTR format. Must be 10-20 alphanumeric characters",
        });
      }

      // Check for duplicate UTR (case-insensitive)
      const existingPayment = await Payment.findOne({
        utrNumber: { $regex: new RegExp(`^${utrNumber}$`, "i") },
      });

      if (existingPayment) {
        return res.status(400).json({
          error: "UTR number must be unique. This UTR has already been used.",
        });
      }

      const loan = await LoanApplication.findById(loanId);
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }

      // Check if loan is active for payments
      if (!["disbursed", "active"].includes(loan.status)) {
        return res.status(400).json({
          error: `Loan is not active for payments. Current status: ${loan.status}`,
        });
      }

      // Check if loan is already closed
      if (loan.outstandingBalance === 0) {
        return res
          .status(400)
          .json({ error: "Loan has already been fully paid and closed" });
      }

      // Validate payment amount (can't exceed outstanding balance)
      if (amount > loan.outstandingBalance) {
        return res.status(400).json({
          error: `Payment amount cannot exceed outstanding balance of ₹${loan.outstandingBalance.toFixed(2)}`,
        });
      }

      // Create payment record
      const payment = new Payment({
        loanId,
        utrNumber: utrNumber.toUpperCase(),
        amount,
        paymentDate: paymentDateObj,
        recordedBy: req.user._id,
        paymentMethod: paymentMethod || "bank_transfer",
        notes,
      });

      await payment.save();

      // Update loan totals
      const previousOutstanding = loan.outstandingBalance;
      loan.totalPaid += amount;
      loan.outstandingBalance -= amount;
      loan.lastPaymentDate = paymentDateObj;

      // Update status if needed
      if (loan.outstandingBalance === 0) {
        loan.status = "closed";
        loan.statusHistory.push({
          status: "closed",
          changedBy: req.user._id,
          changedAt: new Date(),
          notes: `Loan fully paid. Total paid: ₹${loan.totalPaid}`,
        });
      } else if (loan.status === "disbursed") {
        // First payment moves to active status
        loan.status = "active";
        loan.statusHistory.push({
          status: "active",
          changedBy: req.user._id,
          changedAt: new Date(),
          notes: "First payment received, loan is now active",
        });
      }

      await loan.save();

      res.json({
        success: true,
        payment: {
          id: payment._id,
          amount: payment.amount,
          utrNumber: payment.utrNumber,
          paymentDate: payment.paymentDate,
        },
        loan: {
          outstandingBalance: loan.outstandingBalance,
          totalPaid: loan.totalPaid,
          status: loan.status,
          isFullyPaid: loan.outstandingBalance === 0,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to record payment" });
    }
  },

  // Get payment history for a loan
  async getPaymentHistory(req: AuthRequest, res: Response) {
    try {
      const { loanId } = req.params;
      const payments = await Payment.find({ loanId })
        .populate("recordedBy", "email fullName")
        .sort({ paymentDate: -1 });

      const loan = await LoanApplication.findById(loanId).select(
        "outstandingBalance totalPaid status",
      );

      res.json({
        payments,
        summary: {
          outstandingBalance: loan?.outstandingBalance || 0,
          totalPaid: loan?.totalPaid || 0,
          status: loan?.status,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment history" });
    }
  },

  // Get payment statistics
  async getPaymentStats(req: AuthRequest, res: Response) {
    try {
      const stats = await Payment.aggregate([
        {
          $group: {
            _id: null,
            totalPayments: { $sum: "$amount" },
            averagePayment: { $avg: "$amount" },
            paymentCount: { $sum: 1 },
          },
        },
      ]);

      const activeLoans = await LoanApplication.countDocuments({
        status: { $in: ["disbursed", "active"] },
      });

      const fullyPaidLoans = await LoanApplication.countDocuments({
        status: "closed",
      });

      res.json({
        totalPaymentsCollected: stats[0]?.totalPayments || 0,
        averagePaymentAmount: stats[0]?.averagePayment || 0,
        totalPaymentCount: stats[0]?.paymentCount || 0,
        activeLoans,
        fullyPaidLoans,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment statistics" });
    }
  },
};
