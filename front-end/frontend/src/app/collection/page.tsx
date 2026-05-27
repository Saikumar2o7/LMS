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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  IconButton,
  Paper,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Close as CloseIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";

interface Loan {
  _id: string;
  userId: { email: string; fullName: string };
  personalDetails: { fullName: string };
  loanConfig: { totalRepayment: number };
  outstandingBalance: number;
  totalPaid: number;
  status: string;
  updatedAt: Date;
}

interface Payment {
  _id: string;
  amount: number;
  utrNumber: string;
  paymentDate: string;
  paymentMethod: string;
  recordedBy: { email: string };
}

export default function CollectionDashboard() {
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [closedLoans, setClosedLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [activeRes, closedRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/collection/active`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/collection/closed`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/collection/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const active = await activeRes.json();
      const closed = await closedRes.json();
      const statsData = await statsRes.json();

      setActiveLoans(active);
      setClosedLoans(closed);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async (loan: Loan) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/collection/payments/${loan._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      setPaymentHistory(data.payments || []);
      setSelectedLoan(loan);
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    }
  };

  const recordPayment = async () => {
    if (!selectedLoan) return;
    if (!utrNumber || !paymentAmount) {
      alert("Please fill all fields");
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/collection/payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          loanId: selectedLoan._id,
          utrNumber,
          amount,
          paymentDate: new Date().toISOString(),
          paymentMethod: "bank_transfer",
        }),
      },
    );

    if (response.ok) {
      alert("Payment recorded successfully!");
      setPaymentDialogOpen(false);
      setUtrNumber("");
      setPaymentAmount("");
      fetchData();
      if (selectedLoan) {
        fetchPaymentHistory(selectedLoan);
      }
    } else {
      const error = await response.json();
      alert(error.error || "Failed to record payment");
    }
  };

  const statsCards = [
    {
      title: "Total Collected",
      value: `₹${stats?.totalPaymentsCollected?.toFixed(2) || 0}`,
      icon: ReceiptIcon,
      color: "#667eea",
    },
    {
      title: "Active Loans",
      value: stats?.activeLoans || 0,
      icon: TrendingUpIcon,
      color: "#f093fb",
    },
    {
      title: "Closed Loans",
      value: stats?.fullyPaidLoans || 0,
      icon: PeopleIcon,
      color: "#4facfe",
    },
    {
      title: "Avg Payment",
      value: `₹${stats?.averagePaymentAmount?.toFixed(2) || 0}`,
      icon: HistoryIcon,
      color: "#43e97b",
    },
  ];

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
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Collection Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Manage loan collections and track payments
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card sx={{ background: stat.color, color: "white" }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="h6">{stat.title}</Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {stat.value}
                      </Typography>
                    </Box>
                    <stat.icon sx={{ fontSize: 48, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Active Loans */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Active Loans
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {activeLoans.map((loan) => (
          <Grid item xs={12} key={loan._id}>
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
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {loan.personalDetails.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {loan.userId.email}
                    </Typography>
                  </Box>
                  <Chip label={loan.status.toUpperCase()} color="primary" />
                </Box>

                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Total Repayment
                    </Typography>
                    <Typography variant="h6">
                      ₹{loan.loanConfig.totalRepayment.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Total Paid
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      ₹{loan.totalPaid.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Outstanding Balance
                    </Typography>
                    <Typography variant="h6" color="error">
                      ₹{loan.outstandingBalance.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setSelectedLoan(loan);
                        setPaymentDialogOpen(true);
                      }}
                      sx={{ mt: 1 }}
                    >
                      Record Payment
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => fetchPaymentHistory(loan)}
                      sx={{ mt: 1, ml: 1 }}
                    >
                      View History
                    </Button>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (loan.totalPaid / loan.loanConfig.totalRepayment) * 100
                    }
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {(
                      (loan.totalPaid / loan.loanConfig.totalRepayment) *
                      100
                    ).toFixed(1)}
                    % paid
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Payment History Dialog */}
      <Dialog
        open={!!selectedLoan && !paymentDialogOpen}
        onClose={() => setSelectedLoan(null)}
        maxWidth="md"
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
            <Typography variant="h6">
              Payment History - {selectedLoan?.personalDetails.fullName}
            </Typography>
            <IconButton onClick={() => setSelectedLoan(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {paymentHistory.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ py: 4 }}
            >
              No payments recorded yet
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>UTR Number</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Recorded By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell>
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{payment.utrNumber}</TableCell>
                      <TableCell>₹{payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{payment.paymentMethod}</TableCell>
                      <TableCell>{payment.recordedBy.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="UTR Number"
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Amount (₹)"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button onClick={recordPayment} variant="contained">
            Submit Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
