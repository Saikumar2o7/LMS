"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Alert,
  Slider,
  Paper,
  LinearProgress,
  MenuItem,
} from "@mui/material";
import {
  Person as PersonIcon,
  Description as DescriptionIcon,
  Calculate as CalculateIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";

export default function LoanApplication() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    pan: "",
    dateOfBirth: "",
    monthlySalary: "",
    employmentMode: "Salaried",
    salarySlip: null as File | null,
    loanAmount: 50000,
    tenure: 30,
  });
  const [calculation, setCalculation] = useState({
    simpleInterest: 0,
    totalRepayment: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { token } = useAuth();

  const steps = ["Personal Details", "Document Upload", "Loan Configuration"];

  const handlePersonalDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/loan/personal-details`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            pan: formData.pan,
            dateOfBirth: formData.dateOfBirth,
            monthlySalary: formData.monthlySalary,
            employmentMode: formData.employmentMode,
          }),
        },
      );

      if (response.ok) {
        setActiveStep(1);
      } else {
        const errorData = await response.json();
        setError(errorData.errors?.join("\n") || "Eligibility check failed");
      }
    } catch (err) {
      setError("Failed to submit personal details");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!formData.salarySlip) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);
    setError("");

    const uploadData = new FormData();
    uploadData.append("salarySlip", formData.salarySlip);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/loan/upload-salary-slip`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: uploadData,
        },
      );

      if (response.ok) {
        setActiveStep(2);
      } else {
        setError("Upload failed. Please try again.");
      }
    } catch (err) {
      setError("Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  const calculateInterest = (amount: number, tenure: number) => {
    const rate = 12;
    const si = (amount * rate * tenure) / (365 * 100);
    const total = amount + si;
    setCalculation({ simpleInterest: si, totalRepayment: total });
  };

  const handleLoanConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/loan/configure`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: formData.loanAmount,
            tenure: formData.tenure,
          }),
        },
      );

      if (response.ok) {
        alert("Loan application submitted successfully!");
        window.location.href = "/borrower/dashboard";
      } else {
        setError("Failed to submit application");
      }
    } catch (err) {
      setError("Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) handlePersonalDetails();
    else if (activeStep === 1) handleFileUpload();
    else if (activeStep === 2) handleLoanConfig();
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError("");
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            textAlign="center"
          >
            New Loan Application
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 4 }}
          >
            Fill in the details to apply for a loan
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {activeStep === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                    InputProps={{
                      startAdornment: (
                        <PersonIcon sx={{ mr: 1, color: "action.active" }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="PAN Card Number"
                    placeholder="ABCDE1234F"
                    value={formData.pan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pan: e.target.value.toUpperCase(),
                      })
                    }
                    required
                    helperText="Format: 5 letters, 4 digits, 1 letter"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    required
                    helperText="Date of Birth"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Monthly Salary (₹)"
                    type="number"
                    value={formData.monthlySalary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlySalary: e.target.value,
                      })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Employment Mode"
                    value={formData.employmentMode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employmentMode: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="Salaried">Salaried</MenuItem>
                    <MenuItem value="Self-Employed">Self-Employed</MenuItem>
                    <MenuItem value="Unemployed">Unemployed</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {activeStep === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Box sx={{ textAlign: "center", py: 4 }}>
                <DescriptionIcon
                  sx={{ fontSize: 64, color: "primary.main", mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  Upload Salary Slip
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Please upload your latest salary slip (PDF, JPG, or PNG
                  format, max 5MB)
                </Typography>
                <Button variant="outlined" component="label" sx={{ mb: 2 }}>
                  Choose File
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files) {
                        setFormData({
                          ...formData,
                          salarySlip: e.target.files[0],
                        });
                      }
                    }}
                  />
                </Button>
                {formData.salarySlip && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Selected: {formData.salarySlip.name}
                  </Alert>
                )}
              </Box>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Typography gutterBottom>
                    Loan Amount: ₹{formData.loanAmount.toLocaleString()}
                  </Typography>
                  <Slider
                    value={formData.loanAmount}
                    onChange={(_, val) => {
                      const amount = val as number;
                      setFormData({ ...formData, loanAmount: amount });
                      calculateInterest(amount, formData.tenure);
                    }}
                    min={50000}
                    max={500000}
                    step={10000}
                    marks={[
                      { value: 50000, label: "₹50k" },
                      { value: 250000, label: "₹2.5L" },
                      { value: 500000, label: "₹5L" },
                    ]}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>
                    Tenure: {formData.tenure} days
                  </Typography>
                  <Slider
                    value={formData.tenure}
                    onChange={(_, val) => {
                      const tenure = val as number;
                      setFormData({ ...formData, tenure });
                      calculateInterest(formData.loanAmount, tenure);
                    }}
                    min={30}
                    max={365}
                    step={7}
                    marks={[
                      { value: 30, label: "30d" },
                      { value: 180, label: "180d" },
                      { value: 365, label: "365d" },
                    ]}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: "#f5f5f5" }}>
                    <Typography variant="h6" gutterBottom>
                      Loan Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Principal Amount
                        </Typography>
                        <Typography variant="h6">
                          ₹{formData.loanAmount.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Interest (12% p.a.)
                        </Typography>
                        <Typography variant="h6">
                          ₹{calculation.simpleInterest.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Total Repayment
                        </Typography>
                        <Typography
                          variant="h5"
                          color="primary"
                          fontWeight="bold"
                        >
                          ₹{calculation.totalRepayment.toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              {loading
                ? "Processing..."
                : activeStep === steps.length - 1
                  ? "Submit"
                  : "Continue"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
