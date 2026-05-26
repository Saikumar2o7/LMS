"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Loan {
  _id: string;
  personalDetails: { fullName: string; monthlySalary: number };
  loanConfig: { amount: number; tenure: number; totalRepayment: number };
  status: string;
}

export default function SanctionDashboard() {
  const [loans, setLoans] = useState<Loan[]>([]);
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
  };

  const reviewLoan = async (
    loanId: string,
    approved: boolean,
    rejectedReason?: string,
  ) => {
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
    } else {
      alert("Action failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Sanction Dashboard</h1>

        <div className="grid gap-6">
          {loans.map((loan) => (
            <div key={loan._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">
                    {loan.personalDetails.fullName}
                  </h3>
                  <p className="text-gray-600">
                    Monthly Salary: ₹{loan.personalDetails.monthlySalary}
                  </p>
                  <p className="text-gray-600">
                    Requested Amount: ₹{loan.loanConfig.amount}
                  </p>
                  <p className="text-gray-600">
                    Tenure: {loan.loanConfig.tenure} days
                  </p>
                  <p className="text-gray-600">
                    Total Repayment: ₹{loan.loanConfig.totalRepayment}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      const reason = prompt("Enter rejection reason:");
                      if (reason) reviewLoan(loan._id, false, reason);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => reviewLoan(loan._id, true)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}

          {loans.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No pending loans for sanction
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
