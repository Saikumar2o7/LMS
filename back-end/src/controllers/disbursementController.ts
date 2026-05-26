import type { Response } from "express";
import { LoanApplication } from "../models/LoanApplication.js";
import type { AuthRequest } from "../middleware/Auth.js";

export const disbursementController = {
  // Get sanctioned loans ready for disbursement
  async getSanctionedLoans(req: AuthRequest, res: Response) {
    try {
      const loans = await LoanApplication.find({
        status: "sanctioned",
      }).populate("userId", "email");

      res.json(loans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sanctioned loans" });
    }
  },

  // Disburse loan
  async disburseLoan(req: AuthRequest, res: Response) {
    try {
      const { loanId, utrNumber } = req.body;

      const loan = await LoanApplication.findById(loanId);
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }

      if (loan.status !== "sanctioned") {
        return res.status(400).json({ error: "Loan is not sanctioned" });
      }

      loan.status = "disbursed";
      loan.disbursementDetails = {
        disbursedBy: req.user._id,
        disbursedDate: new Date(),
        utrNumber,
      };

      await loan.save();

      res.json({ success: true, status: loan.status });
    } catch (error) {
      res.status(500).json({ error: "Failed to disburse loan" });
    }
  },
};
