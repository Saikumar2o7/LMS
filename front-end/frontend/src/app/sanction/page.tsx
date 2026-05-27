"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
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
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/sanction/pending`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await response.json();
    setLoans(data);
    setLoading(false);
  };

  const reviewLoan = async (loanId: string, approved: boolean) => {
    let rejectedReason = "";
    if (!approved) {
      rejectedReason = prompt("Enter rejection reason:") || "";
      if (!rejectedReason) return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/sanction/review`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ loanId, approved, rejectedReason }),
      },
    );

    if (response.ok) {
      alert(`Loan ${approved ? "approved" : "rejected"} successfully`);
      fetchLoans();
      setSelectedLoan(null);
    } else {
      alert("Action failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Sanction Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Review and approve loan applications
          </p>
        </div>

        {loans.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-500 text-lg">
              No pending loans for sanction
            </p>
            <p className="text-gray-400">All applications have been reviewed</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {loans.map((loan, index) => (
              <motion.div
                key={loan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {loan.personalDetails.fullName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Loan Application #{loan._id.slice(-6)}
                      </p>
                    </div>
                    <span className="badge bg-yellow-100 text-yellow-800">
                      Pending Review
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Monthly Salary</p>
                      <p className="font-semibold text-lg">
                        ₹{loan.personalDetails.monthlySalary.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Requested Amount</p>
                      <p className="font-semibold text-lg">
                        ₹{loan.loanConfig.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Tenure</p>
                      <p className="font-semibold text-lg">
                        {loan.loanConfig.tenure} days
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Total Repayment</p>
                      <p className="font-semibold text-lg text-green-600">
                        ₹{loan.loanConfig.totalRepayment.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => reviewLoan(loan._id, false)}
                      className="btn-danger px-6"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => reviewLoan(loan._id, true)}
                      className="btn-secondary px-6"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
