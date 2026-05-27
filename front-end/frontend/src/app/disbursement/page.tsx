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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  IconButton,
  Paper,
  LinearProgress,
  Avatar,
} from "@mui/material";
import {
  Payments as PaymentsIcon,
  AccountBalance as AccountBalanceIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Today as TodayIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";

interface Loan {
  _id: string;
  userId: { email: string; fullName: string };
  personalDetails: { fullName: string; monthlySalary: number };
  loanConfig: { amount: number; tenure: number; totalRepayment: number };
  status: string;
  sanctionDetails: { sanctionedDate: string };
  disbursementDetails?: { utrNumber: string; disbursedDate: string };
}

export default function DisbursementDashboard() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<Loan[]>([]);
  const [disburseDialogOpen, setDisburseDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchSanctionedLoans(), fetchDisbursementHistory()]);
  };

  // Add this after fetching data
  const fetchSanctionedLoans = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/disbursement/sanctioned`,
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
      console.error("Failed to fetch sanctioned loans:", error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDisbursementHistory = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/disbursement/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();

      // Handle different API response formats
      let historyArray = [];
      if (Array.isArray(data)) {
        historyArray = data;
      } else if (data && Array.isArray(data.data)) {
        historyArray = data.data;
      } else if (data && Array.isArray(data.history)) {
        historyArray = data.history;
      } else {
        historyArray = [];
      }

      setHistory(historyArray);
    } catch (error) {
      console.error("Failed to fetch history:", error);
      setHistory([]);
    }
  };

  const handleDisburseClick = (loan: Loan) => {
    setSelectedLoan(loan);
    setDisburseDialogOpen(true);
  };

  const handleDisburse = async () => {
    if (!selectedLoan || !utrNumber) return;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/disbursement/disburse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ loanId: selectedLoan._id, utrNumber }),
      },
    );

    if (response.ok) {
      alert("Loan disbursed successfully!");
      setDisburseDialogOpen(false);
      setUtrNumber("");
      setSelectedLoan(null);
      fetchData();
    } else {
      const error = await response.json();
      alert(error.error || "Failed to disburse loan");
    }
  };

  const stats = {
    pending: Array.isArray(loans) ? loans.length : 0,
    disbursed: Array.isArray(history) ? history.length : 0,
    totalAmount:
      Array.isArray(loans) && loans.length > 0
        ? loans.reduce((sum, loan) => sum + (loan?.loanConfig?.amount || 0), 0)
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
          Disbursement Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage loan disbursements and track payment transfers
        </Typography>
      </Box>

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
                    <Typography variant="h6">Pending Disbursements</Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {stats.pending}
                    </Typography>
                  </Box>
                  <PaymentsIcon sx={{ fontSize: 48, opacity: 0.8 }} />
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
                    <Typography variant="h6">Total Disbursed</Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {stats.disbursed}
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
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
                    <Typography variant="h6">Total Amount</Typography>
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
      </Grid>

      {/* Pending Disbursements */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Ready for Disbursement
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loans.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: "center", py: 8 }}>
                <CheckCircleIcon
                  sx={{ fontSize: 64, color: "success.main", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary">
                  No loans ready for disbursement
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All sanctioned loans have been processed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          loans.map((loan, index) => (
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
                            {loan.personalDetails.fullName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {loan.userId.email}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip label="PENDING DISBURSEMENT" color="warning" />
                    </Box>

                    <Grid container spacing={3} sx={{ mt: 2 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Loan Amount
                        </Typography>
                        <Typography variant="h6">
                          ₹{loan.loanConfig.amount.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Monthly Salary
                        </Typography>
                        <Typography variant="h6">
                          ₹{loan.personalDetails.monthlySalary.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Tenure
                        </Typography>
                        <Typography variant="h6">
                          {loan.loanConfig.tenure} days
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Total Repayment
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          ₹{loan.loanConfig.totalRepayment.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Sanctioned Date
                        </Typography>
                        <Typography variant="body1">
                          {new Date(
                            loan.sanctionDetails.sanctionedDate,
                          ).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 3,
                      }}
                    >
                      <Button
                        variant="contained"
                        onClick={() => handleDisburseClick(loan)}
                        startIcon={<PaymentsIcon />}
                        sx={{
                          background:
                            "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #38d7a0 0%, #2ee0c0 100%)",
                          },
                        }}
                      >
                        Disburse Loan
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))
        )}
      </Grid>

      {/* Disbursement History */}
      {history.length > 0 && (
        <>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            Recent Disbursements
          </Typography>
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    <TableCell>Borrower</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>UTR Number</TableCell>
                    <TableCell>Disbursed Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((loan) => (
                    <TableRow key={loan._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {loan.personalDetails.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {loan.userId.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        ₹{loan.loanConfig.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={loan.disbursementDetails?.utrNumber || "N/A"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {loan.disbursementDetails?.disbursedDate
                          ? new Date(
                              loan.disbursementDetails.disbursedDate,
                            ).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}

      {/* Disburse Dialog */}
      <Dialog
        open={disburseDialogOpen}
        onClose={() => setDisburseDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Disburse Loan</Typography>
            <IconButton onClick={() => setDisburseDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Borrower:{" "}
              <strong>{selectedLoan?.personalDetails.fullName}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Amount:{" "}
              <strong>
                ₹{selectedLoan?.loanConfig.amount.toLocaleString()}
              </strong>
            </Typography>
          </Box>
          <TextField
            fullWidth
            label="UTR Number"
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value)}
            required
            placeholder="Enter UTR/Transaction ID"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisburseDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDisburse} variant="contained" color="success">
            Confirm Disbursement
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
