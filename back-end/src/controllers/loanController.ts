import type { Request, Response } from "express";
import { LoanApplication } from "../models/LoanApplication.js";
import { Payment } from "../models/Payment.js";
import { checkEligibility } from "../services/bre.js";
import type { AuthRequest } from "../middleware/Auth.js";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const loanController = {
  // Save personal details and run eligibility
  async savePersonalDetails(req: AuthRequest, res: Response) {
    try {
      const { fullName, pan, dateOfBirth, monthlySalary, employmentMode } =
        req.body;

      // Run BRE
      const eligibility = checkEligibility({
        fullName,
        pan,
        dateOfBirth,
        monthlySalary,
        employmentMode,
      });

      if (!eligibility.passed) {
        return res.status(400).json({ errors: eligibility.errors });
      }

      // Find or create application
      let application = await LoanApplication.findOne({
        userId: req.user._id,
        status: "draft",
      });

      if (!application) {
        application = new LoanApplication({ userId: req.user._id });
      }

      application.personalDetails = {
        fullName,
        pan,
        dateOfBirth: new Date(dateOfBirth),
        monthlySalary,
        employmentMode,
      };
      application.status = "draft";

      await application.save();

      res.json({ success: true, applicationId: application._id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save personal details" });
    }
  },

  // Upload salary slip with file storage
  async uploadSalarySlip(req: AuthRequest, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Validate file type and size
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.mimetype)) {
        return res
          .status(400)
          .json({ error: "Only PDF, JPG, and PNG files are allowed" });
      }

      if (file.size > 5 * 1024 * 1024) {
        return res
          .status(400)
          .json({ error: "File size must be less than 5MB" });
      }

      const application = await LoanApplication.findOne({
        userId: req.user._id,
        status: "draft",
      });

      if (!application) {
        return res.status(404).json({ error: "No active application found" });
      }

      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(__dirname, "../../uploads/salary-slips");
      await fs.ensureDir(uploadDir);

      // Generate unique filename
      const fileExt = path.extname(file.originalname);
      const newFilename = `${Date.now()}-${req.user._id}${fileExt}`;
      const newPath = path.join(uploadDir, newFilename);

      // Move file to permanent location
      await fs.move(file.path, newPath, { overwrite: true });

      application.salarySlip = {
        filename: newFilename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        uploadDate: new Date(),
        filePath: `/uploads/salary-slips/${newFilename}`,
      };

      await application.save();

      res.json({ success: true, filePath: application.salarySlip.filePath });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to upload salary slip" });
    }
  },

  // Configure and apply for loan
  async configureLoan(req: AuthRequest, res: Response) {
    try {
      const { amount, tenure } = req.body;

      // Validate amount and tenure
      if (amount < 50000 || amount > 500000) {
        return res
          .status(400)
          .json({ error: "Loan amount must be between ₹50,000 and ₹5,00,000" });
      }

      if (tenure < 30 || tenure > 365) {
        return res
          .status(400)
          .json({ error: "Tenure must be between 30 and 365 days" });
      }

      const application = await LoanApplication.findOne({
        userId: req.user._id,
        status: "draft",
      });

      if (
        !application ||
        !application.personalDetails ||
        !application.salarySlip
      ) {
        return res
          .status(400)
          .json({ error: "Please complete all previous steps first" });
      }

      // Calculate interest
      const interestRate = 12;
      const simpleInterest = (amount * interestRate * tenure) / (365 * 100);
      const totalRepayment = amount + simpleInterest;

      application.loanConfig = {
        amount,
        tenure,
        interestRate,
        simpleInterest,
        totalRepayment,
      };
      application.status = "applied";
      application.outstandingBalance = totalRepayment;

      // Add to status history
      application.statusHistory.push({
        status: "applied",
        changedBy: req.user._id,
        changedAt: new Date(),
        notes: "Loan application submitted",
      });

      await application.save();

      res.json({
        success: true,
        applicationId: application._id,
        calculation: { amount, tenure, simpleInterest, totalRepayment },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to apply for loan" });
    }
  },

  // Get user's applications
  async getUserApplications(req: AuthRequest, res: Response) {
    try {
      const applications = await LoanApplication.find({
        userId: req.user._id,
      }).sort({ createdAt: -1 });

      res.json(applications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  },

  // Get single application details
  async getApplicationById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const application = await LoanApplication.findById(id).populate(
        "userId",
        "email fullName",
      );

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      // Check authorization
      if (
        req.user.role === "borrower" &&
        application.userId._id.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(application);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch application" });
    }
  },
};
