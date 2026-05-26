import express from "express";
import multer from "multer";
import { authenticate, authorize } from "../middleware/Auth.js";
import { loanController } from "../controllers/loanController.js";
import { authController } from "../controllers/authContoller.js";
import { sanctionController } from "../controllers/sanctionController.js";
import { disbursementController } from "../controllers/disbursementController.js";
import { collectionController } from "../controllers/collectionController.js";
import { LoanApplication } from "../models/LoanApplication.js";
import { User } from "../models/User.js";

const router = express.Router();
const upload = multer({ dest: "uploads/temp/" });

// ============ PUBLIC AUTH ROUTES ============
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);

// ============ PROTECTED AUTH ROUTES ============
router.get("/auth/me", authenticate, authController.getCurrentUser);
router.post(
  "/auth/change-password",
  authenticate,
  authController.changePassword,
);
router.post("/auth/logout", authenticate, (req, res) => {
  res.json({ message: "Logged out successfully" });
});

// ============ ADMIN ONLY ROUTES ============
router.post(
  "/admin/users",
  authenticate,
  authorize("admin"),
  authController.createUserByAdmin,
);
router.get(
  "/admin/users",
  authenticate,
  authorize("admin"),
  authController.getAllUsers,
);
router.get(
  "/admin/all-loans",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    const loans = await LoanApplication.find()
      .populate("userId", "email fullName")
      .sort({ createdAt: -1 });
    res.json(loans);
  },
);
router.get(
  "/admin/stats",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalLoans = await LoanApplication.countDocuments();
    const totalDisbursed = await LoanApplication.countDocuments({
      status: "disbursed",
    });
    const totalClosed = await LoanApplication.countDocuments({
      status: "closed",
    });

    res.json({
      totalUsers,
      totalLoans,
      totalDisbursed,
      totalClosed,
    });
  },
);

// ============ BORROWER ROUTES ============
router.post(
  "/loan/personal-details",
  authenticate,
  authorize("borrower"),
  loanController.savePersonalDetails,
);
router.post(
  "/loan/upload-salary-slip",
  authenticate,
  authorize("borrower"),
  upload.single("salarySlip"),
  loanController.uploadSalarySlip,
);
router.post(
  "/loan/configure",
  authenticate,
  authorize("borrower"),
  loanController.configureLoan,
);
router.get(
  "/loan/my-applications",
  authenticate,
  authorize("borrower"),
  loanController.getUserApplications,
);
router.get(
  "/loan/application/:id",
  authenticate,
  loanController.getApplicationById,
);

// ============ SALES ROUTES ============
router.get(
  "/sales/leads",
  authenticate,
  authorize("sales", "admin"),
  async (req, res) => {
    // Get all borrowers who haven't completed loan application
    const allBorrowers = await User.find({ role: "borrower" });
    const borrowersWithApplications = await LoanApplication.distinct("userId");

    const leads = allBorrowers.filter(
      (borrower) =>
        !borrowersWithApplications.some(
          (id) => id.toString() === borrower._id.toString(),
        ),
    );

    // Add additional lead info
    const leadDetails = await Promise.all(
      leads.map(async (lead) => {
        const applications = await LoanApplication.find({ userId: lead._id });
        return {
          ...lead.toObject(),
          password: undefined,
          applicationCount: applications.length,
          lastActivity: applications[0]?.updatedAt || lead.createdAt,
        };
      }),
    );

    res.json(leadDetails);
  },
);

router.post(
  "/sales/leads/:userId/contact",
  authenticate,
  authorize("sales", "admin"),
  async (req, res) => {
    const { userId } = req.params;
    const { notes } = req.body;

    // Track sales activity (you can create a SalesActivity model)
    res.json({ success: true, message: "Lead contact logged" });
  },
);

// ============ SANCTION ROUTES ============
router.get(
  "/sanction/pending",
  authenticate,
  authorize("sanction", "admin"),
  sanctionController.getPendingLoans,
);
router.get(
  "/sanction/history",
  authenticate,
  authorize("sanction", "admin"),
  sanctionController.getSanctionedLoans,
);
router.post(
  "/sanction/review",
  authenticate,
  authorize("sanction", "admin"),
  sanctionController.reviewLoan,
);

// ============ DISBURSEMENT ROUTES ============
router.get(
  "/disbursement/sanctioned",
  authenticate,
  authorize("disbursement", "admin"),
  disbursementController.getSanctionedLoans,
);
router.post(
  "/disbursement/disburse",
  authenticate,
  authorize("disbursement", "admin"),
  disbursementController.disburseLoan,
);
router.get(
  "/disbursement/history",
  authenticate,
  authorize("disbursement", "admin"),
  disbursementController.getDisbursementHistory,
);

// ============ COLLECTION ROUTES ============
router.get(
  "/collection/active",
  authenticate,
  authorize("collection", "admin"),
  collectionController.getActiveLoans,
);
router.get(
  "/collection/closed",
  authenticate,
  authorize("collection", "admin"),
  collectionController.getClosedLoans,
);
router.post(
  "/collection/payment",
  authenticate,
  authorize("collection", "admin"),
  collectionController.recordPayment,
);
router.get(
  "/collection/payments/:loanId",
  authenticate,
  authorize("collection", "admin"),
  collectionController.getPaymentHistory,
);
router.get(
  "/collection/stats",
  authenticate,
  authorize("collection", "admin"),
  collectionController.getPaymentStats,
);

export default router;
