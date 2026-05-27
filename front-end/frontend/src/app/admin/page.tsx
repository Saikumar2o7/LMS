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
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { showError, showSuccess } from "@/utils/notification";

interface User {
  _id: string;
  email: string;
  role: string;
  fullName?: string;
  createdAt: string;
}

interface Loan {
  _id: string;
  userId: { email: string; fullName: string };
  personalDetails: { fullName: string };
  loanConfig: { amount: number; totalRepayment: number };
  status: string;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalLoans: number;
  totalDisbursed: number;
  totalClosed: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const { token } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, loansRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/all-loans`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const usersData = await usersRes.json();
      const loansData = await loansRes.json();
      const statsData = await statsRes.json();

      setUsers(usersData);
      setLoans(loansData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const createUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
          role: formData.get("role"),
          fullName: formData.get("fullName"),
        }),
      },
    );

    if (response.ok) {
      showSuccess("User created successfully");
      setCreateUserOpen(false);
      fetchData();
    } else {
      const error = await response.json();
      showError(error.error || "Failed to create user");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      applied: { bg: "#fff3e0", color: "#e65100" },
      sanctioned: { bg: "#e3f2fd", color: "#1565c0" },
      disbursed: { bg: "#e8f5e9", color: "#2e7d32" },
      active: { bg: "#e0f7fa", color: "#00695c" },
      closed: { bg: "#e8eaf6", color: "#283593" },
      rejected: { bg: "#ffebee", color: "#c62828" },
    };
    return colors[status] || { bg: "#f5f5f5", color: "#424242" };
  };

  const statsCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: PeopleIcon,
      color: "#667eea",
    },
    {
      title: "Total Loans",
      value: stats?.totalLoans || 0,
      icon: ReceiptIcon,
      color: "#f093fb",
    },
    {
      title: "Disbursed",
      value: stats?.totalDisbursed || 0,
      icon: CheckCircleIcon,
      color: "#4facfe",
    },
    {
      title: "Closed",
      value: stats?.totalClosed || 0,
      icon: CancelIcon,
      color: "#43e97b",
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage users, loans, and system settings
        </Typography>
      </Box>

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
                      <Typography variant="h3" fontWeight="bold">
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

      {/* Tabs */}
      <Card>
        <CardContent>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            sx={{ mb: 3 }}
          >
            <Tab label="Recent Applications" />
            <Tab label="Users Management" />
            <Tab label="All Loans" />
          </Tabs>

          {/* Recent Applications Tab */}
          {tabValue === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Borrower</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loans.slice(0, 10).map((loan) => {
                    const statusColor = getStatusColor(loan.status);
                    return (
                      <TableRow key={loan._id} hover>
                        <TableCell>{loan.personalDetails.fullName}</TableCell>
                        <TableCell>
                          ₹{loan.loanConfig.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={loan.status.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: statusColor.bg,
                              color: statusColor.color,
                              fontWeight: "bold",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(loan.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Users Management Tab */}
          {tabValue === 1 && (
            <>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateUserOpen(true)}
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  Add User
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Joined</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id} hover>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar sx={{ bgcolor: "#667eea" }}>
                              {user.fullName?.[0] ||
                                user.email[0].toUpperCase()}
                            </Avatar>
                            <Typography>{user.fullName || "-"}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            size="small"
                            sx={{ textTransform: "capitalize" }}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* All Loans Tab */}
          {tabValue === 2 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Borrower</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Total Repayment</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loans.map((loan) => {
                    const statusColor = getStatusColor(loan.status);
                    return (
                      <TableRow key={loan._id} hover>
                        <TableCell>{loan.personalDetails.fullName}</TableCell>
                        <TableCell>
                          ₹{loan.loanConfig.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          ₹{loan.loanConfig.totalRepayment.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={loan.status.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: statusColor.bg,
                              color: statusColor.color,
                              fontWeight: "bold",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(loan.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog
        open={createUserOpen}
        onClose={() => setCreateUserOpen(false)}
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
            <Typography variant="h6">Create New User</Typography>
            <IconButton onClick={() => setCreateUserOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <form onSubmit={createUser}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Role"
                  name="role"
                  required
                  defaultValue="borrower"
                >
                  <MenuItem value="borrower">Borrower</MenuItem>
                  <MenuItem value="sales">Sales</MenuItem>
                  <MenuItem value="sanction">Sanction</MenuItem>
                  <MenuItem value="disbursement">Disbursement</MenuItem>
                  <MenuItem value="collection">Collection</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateUserOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}
