"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  LinearProgress,
  Avatar,
  Divider,
  Alert,
} from "@mui/material";
import {
  PendingActions as PendingActionsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";

interface Loan {
  _id: string;
  personalDetails: { fullName: string; monthlySalary: number };
  loanConfig: { amount: number; tenure: number; totalRepayment: number };
  status: string;
}

export default function SanctionDashboard() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [rejectionReason, setRejectionReason] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setError("");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sanction/pending`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();

      // Handle different API response formats
      let loansArray = [];
      if (Array.isArray(data)) {
        loansArray = data;
      } else if (data && Array.isArray(data.data)) {
        loansArray = data.data;
      } else if (data && Array.isArray(data.loans)) {
        loansArray = data.loans;
      } else {
        loansArray = [];
      }

      setLoans(loansArray);
    } catch (error) {
      console.error("Failed to fetch loans:", error);
      setError("Failed to load applications. Please try again.");
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (loan: Loan, action: "approve" | "reject") => {
    setSelectedLoan(loan);
    setActionType(action);
    setRejectionReason("");
    setActionDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedLoan) return;

    if (actionType === "reject" && !rejectionReason) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sanction/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            loanId: selectedLoan._id,
            approved: actionType === "approve",
            rejectedReason: rejectionReason,
          }),
        },
      );

      if (response.ok) {
        alert(
          `Loan ${actionType === "approve" ? "approved" : "rejected"} successfully`,
        );
        setActionDialogOpen(false);
        setSelectedLoan(null);
        fetchLoans();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Action failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to process request");
    }
  };

  // Safe calculations with array check
  const stats = {
    pending: Array.isArray(loans) ? loans.length : 0,
    totalAmount:
      Array.isArray(loans) && loans.length > 0
        ? loans.reduce((sum, loan) => sum + (loan?.loanConfig?.amount || 0), 0)
        : 0,
    avgSalary:
      Array.isArray(loans) && loans.length > 0
        ? Math.round(
            loans.reduce(
              (sum, loan) => sum + (loan?.personalDetails?.monthlySalary || 0),
              0,
            ) / loans.length,
          )
        : 0,
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <LinearProgress sx={{ width: "50%" }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Sanction Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review and approve loan applications
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="h6">Pending Applications</Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {stats.pending}
                    </Typography>
                  </Box>
                  <PendingActionsIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              sx={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="h6">Total Requested</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      ₹{stats.totalAmount.toLocaleString()}
                    </Typography>
                  </Box>
                  <MoneyIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              sx={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="h6">Avg Monthly Salary</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      ₹{stats.avgSalary.toLocaleString()}
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Pending Applications */}
      {!Array.isArray(loans) || loans.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <CheckCircleIcon
              sx={{ fontSize: 64, color: "success.main", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary">
              No pending loans for sanction
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All applications have been reviewed
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {loans.map((loan, index) => (
            <Grid item xs={12} key={loan._id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "primary.main",
                            width: 56,
                            height: 56,
                          }}
                        >
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {loan.personalDetails?.fullName || "N/A"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Application #{loan._id?.slice(-8) || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip label="PENDING REVIEW" color="warning" />
                    </Box>

                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Monthly Salary
                        </Typography>
                        <Typography variant="h6">
                          ₹
                          {(
                            loan.personalDetails?.monthlySalary || 0
                          ).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Requested Amount
                        </Typography>
                        <Typography variant="h6">
                          ₹{(loan.loanConfig?.amount || 0).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Tenure
                        </Typography>
                        <Typography variant="h6">
                          {loan.loanConfig?.tenure || 0} days
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Total Repayment
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          ₹{(loan.loanConfig?.totalRepayment || 0).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 2,
                      }}
                    >
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleActionClick(loan, "reject")}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleActionClick(loan, "approve")}
                      >
                        Approve
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionType === "approve"
            ? "Approve Loan Application"
            : "Reject Loan Application"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {actionType === "approve"
              ? `Are you sure you want to approve the loan application for ${selectedLoan?.personalDetails?.fullName}?`
              : `Please provide a reason for rejecting the loan application for ${selectedLoan?.personalDetails?.fullName}.`}
          </DialogContentText>
          {actionType === "reject" && (
            <TextField
              fullWidth
              label="Rejection Reason"
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              required
            />
          )}
          {actionType === "approve" && selectedLoan && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Application Summary:
              </Typography>
              <Typography variant="body2">
                Amount: ₹
                {(selectedLoan.loanConfig?.amount || 0).toLocaleString()}
              </Typography>
              <Typography variant="body2">
                Tenure: {selectedLoan.loanConfig?.tenure || 0} days
              </Typography>
              <Typography variant="body2">
                Monthly Salary: ₹
                {(
                  selectedLoan.personalDetails?.monthlySalary || 0
                ).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={actionType === "approve" ? "success" : "error"}
          >
            {actionType === "approve"
              ? "Confirm Approval"
              : "Confirm Rejection"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
