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
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  IconButton,
} from "@mui/material";
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";

interface Lead {
  _id: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  createdAt: string;
  applicationCount: number;
  lastActivity: string;
}

export default function SalesDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [contactNotes, setContactNotes] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sales/leads`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();

      // Handle different API response formats
      let leadsArray = [];
      if (Array.isArray(data)) {
        leadsArray = data;
      } else if (data && Array.isArray(data.data)) {
        leadsArray = data.data;
      } else if (data && Array.isArray(data.leads)) {
        leadsArray = data.leads;
      } else {
        leadsArray = [];
      }

      setLeads(leadsArray);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = (lead: Lead) => {
    setSelectedLead(lead);
    setContactDialogOpen(true);
  };

  const handleContactSubmit = async () => {
    if (!selectedLead || !contactNotes) return;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/sales/leads/${selectedLead._id}/contact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: contactNotes }),
      },
    );

    if (response.ok) {
      alert("Contact logged successfully");
      setContactDialogOpen(false);
      setContactNotes("");
      setSelectedLead(null);
      fetchLeads();
    } else {
      alert("Failed to log contact");
    }
  };

  const stats = {
    totalLeads: Array.isArray(leads) ? leads.length : 0,
    activeFollowups: Array.isArray(leads)
      ? leads.filter((l) => l?.applicationCount === 0).length
      : 0,
    conversionRate:
      Array.isArray(leads) && leads.length > 0
        ? (
            (leads.filter((l) => l?.applicationCount > 0).length /
              leads.length) *
            100
          ).toFixed(1)
        : "0",
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
          Sales Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track and manage leads who haven't applied for loans yet
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
                    <Typography variant="h6">Total Leads</Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {stats.totalLeads}
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
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
                    <Typography variant="h6">Active Follow-ups</Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {stats.activeFollowups}
                    </Typography>
                  </Box>
                  <PhoneIcon sx={{ fontSize: 48, opacity: 0.8 }} />
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
                    <Typography variant="h6">Conversion Rate</Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {stats.conversionRate}%
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Leads Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Lead Management
          </Typography>
          {leads.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <PeopleIcon
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary">
                No leads found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All registered users have started loan applications
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    <TableCell>Lead</TableCell>
                    <TableCell>Contact Info</TableCell>
                    <TableCell>Registered</TableCell>
                    <TableCell>Last Activity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead._id} hover>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            {lead.fullName?.[0] || lead.email[0].toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {lead.fullName || lead.email.split("@")[0]}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ID: {lead._id.slice(-8)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{lead.email}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {lead.phoneNumber || "No phone"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <AccessTimeIcon
                            sx={{ fontSize: 14, color: "text.secondary" }}
                          />
                          <Typography variant="body2">
                            {new Date(lead.lastActivity).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {lead.applicationCount === 0 ? (
                          <Chip label="New Lead" size="small" color="warning" />
                        ) : (
                          <Chip label="Applied" size="small" color="success" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleContactClick(lead)}
                          startIcon={<PhoneIcon />}
                        >
                          Contact
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Contact Dialog */}
      <Dialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
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
            <Typography variant="h6">Contact Lead</Typography>
            <IconButton onClick={() => setContactDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Lead:{" "}
              <strong>{selectedLead?.fullName || selectedLead?.email}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Email: <strong>{selectedLead?.email}</strong>
            </Typography>
          </Box>
          <TextField
            fullWidth
            label="Contact Notes"
            multiline
            rows={4}
            value={contactNotes}
            onChange={(e) => setContactNotes(e.target.value)}
            placeholder="Record your conversation details here..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleContactSubmit} variant="contained">
            Save Contact
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
