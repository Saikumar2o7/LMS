"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoanApplication() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    pan: "",
    dateOfBirth: "",
    monthlySalary: "",
    employmentMode: "Salaried",
    salarySlip: null,
    loanAmount: 50000,
    tenure: 30,
  });
  const [calculation, setCalculation] = useState({
    simpleInterest: 0,
    totalRepayment: 0,
  });
  const { token } = useAuth();

  const handlePersonalDetails = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/loan/personal-details`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      },
    );

    if (response.ok) {
      setStep(2);
    } else {
      const error = await response.json();
      alert(error.errors?.join("\n") || "Eligibility check failed");
    }
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("salarySlip", file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/loan/upload-salary-slip`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      },
    );

    if (response.ok) {
      setStep(3);
    } else {
      alert("Upload failed");
    }
  };

  const calculateInterest = (amount: number, tenure: number) => {
    const rate = 12;
    const si = (amount * rate * tenure) / (365 * 100);
    const total = amount + si;
    setCalculation({ simpleInterest: si, totalRepayment: total });
  };

  const handleLoanConfig = async () => {
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
    } else {
      alert("Failed to submit application");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-1/4 h-2 rounded-full mx-1 ${
                    step >= i ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <h2 className="text-2xl font-bold text-center">
              Step {step}:{" "}
              {step === 1
                ? "Personal Details"
                : step === 2
                  ? "Upload Salary Slip"
                  : step === 3
                    ? "Loan Configuration"
                    : "Review"}
            </h2>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-3 border rounded"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="PAN Card (e.g., ABCPK1234F)"
                className="w-full p-3 border rounded"
                value={formData.pan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pan: e.target.value.toUpperCase(),
                  })
                }
              />
              <input
                type="date"
                className="w-full p-3 border rounded"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Monthly Salary (₹)"
                className="w-full p-3 border rounded"
                value={formData.monthlySalary}
                onChange={(e) =>
                  setFormData({ ...formData, monthlySalary: e.target.value })
                }
              />
              <select
                className="w-full p-3 border rounded"
                value={formData.employmentMode}
                onChange={(e) =>
                  setFormData({ ...formData, employmentMode: e.target.value })
                }
              >
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Unemployed">Unemployed</option>
              </select>
              <button
                onClick={handlePersonalDetails}
                className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  e.target.files && handleFileUpload(e.target.files[0])
                }
                className="w-full p-3 border rounded"
              />
              <p className="text-sm text-gray-500">
                Max size: 5MB. Allowed formats: PDF, JPG, PNG
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block mb-2">
                  Loan Amount: ₹{formData.loanAmount.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="50000"
                  max="500000"
                  step="10000"
                  value={formData.loanAmount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFormData({ ...formData, loanAmount: val });
                    calculateInterest(val, formData.tenure);
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block mb-2">
                  Tenure: {formData.tenure} days
                </label>
                <input
                  type="range"
                  min="30"
                  max="365"
                  step="1"
                  value={formData.tenure}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFormData({ ...formData, tenure: val });
                    calculateInterest(formData.loanAmount, val);
                  }}
                  className="w-full"
                />
              </div>

              <div className="bg-gray-100 p-4 rounded">
                <h3 className="font-bold mb-2">Loan Summary</h3>
                <p>Principal Amount: ₹{formData.loanAmount.toLocaleString()}</p>
                <p>
                  Interest (12% p.a.): ₹{calculation.simpleInterest.toFixed(2)}
                </p>
                <p className="font-bold text-lg">
                  Total Repayment: ₹{calculation.totalRepayment.toFixed(2)}
                </p>
              </div>

              <button
                onClick={handleLoanConfig}
                className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700"
              >
                Submit Application
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
