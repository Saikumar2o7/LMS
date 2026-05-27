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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { motion } from "framer-motion";

interface Application {
  _id: string;
  status: string;
  loanConfig?: {
    amount: number;
    tenure: number;
    totalRepayment: number;
  };
  createdAt: string;
  outstandingBalance?: number;
}

export default function BorrowerDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const { token } = useAuth();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/loan/my-applications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setApplications(data);
      } else if (data && Array.isArray(data.data)) {
        setApplications(data.data);
      } else if (data && Array.isArray(data.applications)) {
        setApplications(data.applications);
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      draft: { bg: "#f3e5f5", color: "#6a1b9a" },
      applied: { bg: "#fff3e0", color: "#e65100" },
      sanctioned: { bg: "#e3f2fd", color: "#1565c0" },
      rejected: { bg: "#ffebee", color: "#c62828" },
      disbursed: { bg: "#e8f5e9", color: "#2e7d32" },
      active: { bg: "#e0f7fa", color: "#00695c" },
      closed: { bg: "#e8eaf6", color: "#283593" },
    };
    return colors[status] || { bg: "#f5f5f5", color: "#424242" };
  };

  const getStats = () => {
    const active = applications.filter((app) =>
      ["active", "disbursed"].includes(app.status),
    ).length;
    const sanctioned = applications.filter(
      (app) => app.status === "sanctioned",
    ).length;
    const closed = applications.filter((app) => app.status === "closed").length;
    const totalAmount = applications.reduce(
      (sum, app) => sum + (app.loanConfig?.amount || 0),
      0,
    );
    return { active, sanctioned, closed, totalAmount };
  };

  const stats = getStats();

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
        <CircularProgress />
      </Box>
    );
  }

  const filteredApplications = applications.filter((app) => {
    if (tabValue === 0) return true;
    if (tabValue === 1) return ["active", "disbursed"].includes(app.status);
    if (tabValue === 2) return app.status === "sanctioned";
    if (tabValue === 3) return app.status === "closed";
    return true;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            My Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your loan applications and manage your finances
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/borrower/apply"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
            },
          }}
        >
          New Application
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
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
                    <Typography variant="h6">Total Applications</Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {applications.length}
                    </Typography>
                  </Box>
                  <MoneyIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
                    <Typography variant="h6">Active Loans</Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {stats.active}
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
                    <Typography variant="h6">Sanctioned</Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {stats.sanctioned}
                    </Typography>
                  </Box>
                  <ScheduleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card
              sx={{
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
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
                    <Typography variant="h6">Closed Loans</Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {stats.closed}
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Applications Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Loan Applications
          </Typography>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            sx={{ mb: 3 }}
          >
            <Tab label="All" />
            <Tab label="Active" />
            <Tab label="Sanctioned" />
            <Tab label="Closed" />
          </Tabs>

          {filteredApplications.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="body1" color="text.secondary">
                No loan applications found
              </Typography>
              <Button
                component={Link}
                href="/borrower/apply"
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Start Your First Application
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Application ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Tenure</TableCell>
                    <TableCell>Total Repayment</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApplications.map((app) => {
                    const statusColor = getStatusColor(app.status);
                    return (
                      <TableRow key={app._id} hover>
                        <TableCell>{app._id.slice(-8)}</TableCell>
                        <TableCell>
                          ₹{app.loanConfig?.amount?.toLocaleString() || "-"}
                        </TableCell>
                        <TableCell>
                          {app.loanConfig?.tenure || "-"} days
                        </TableCell>
                        <TableCell>
                          ₹{app.loanConfig?.totalRepayment?.toFixed(2) || "-"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={app.status.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: statusColor.bg,
                              color: statusColor.color,
                              fontWeight: "bold",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(app.createdAt).toLocaleDateString()}
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
    </Container>
  );
}
