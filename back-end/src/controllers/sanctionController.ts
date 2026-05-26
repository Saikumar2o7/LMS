import type { Response } from "express";
import { LoanApplication } from "../models/LoanApplication.js";
import type { AuthRequest } from "../middleware/Auth.js";

export const sanctionController = {
  // Get all applied loans for sanction review
  async getPendingLoans(req: AuthRequest, res: Response) {
    try {
      const loans = await LoanApplication.find({
        status: "applied",
      }).populate("userId", "email fullName phoneNumber");

      res.json(loans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending loans" });
    }
  },

  // Get sanctioned loans (for history)
  async getSanctionedLoans(req: AuthRequest, res: Response) {
    try {
      const loans = await LoanApplication.find({
        status: { $in: ["sanctioned", "rejected"] },
      })
        .populate("userId", "email fullName")
        .sort({ updatedAt: -1 })
        .limit(50);

      res.json(loans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sanctioned loans" });
    }
  },

  // Approve or reject loan
  async reviewLoan(req: AuthRequest, res: Response) {
    try {
      const { loanId, approved, rejectedReason, notes } = req.body;

      const loan = await LoanApplication.findById(loanId);
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }

      if (loan.status !== "applied") {
        return res.status(400).json({
          error: `Loan is not in applied state. Current status: ${loan.status}`,
        });
      }

      if (approved) {
        loan.status = "sanctioned";
        loan.sanctionDetails = {
          approved: true,
          sanctionedBy: req.user._id,
          sanctionedDate: new Date(),
          reviewedAt: new Date(),
        };
        loan.statusHistory.push({
          status: "sanctioned",
          changedBy: req.user._id,
          changedAt: new Date(),
          notes: notes || "Loan approved by sanction team",
        });
      } else {
        if (!rejectedReason) {
          return res
            .status(400)
            .json({ error: "Rejection reason is required" });
        }

        loan.status = "rejected";
        loan.sanctionDetails = {
          approved: false,
          rejectedReason,
          sanctionedBy: req.user._id,
          sanctionedDate: new Date(),
          reviewedAt: new Date(),
        };
        loan.statusHistory.push({
          status: "rejected",
          changedBy: req.user._id,
          changedAt: new Date(),
          notes: `Rejected: ${rejectedReason}`,
        });
      }

      await loan.save();

      res.json({
        success: true,
        status: loan.status,
        message: approved ? "Loan approved successfully" : "Loan rejected",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to review loan" });
    }
  },
};
