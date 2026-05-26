"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Loan {
  _id: string;
  userId: { email: string; fullName: string };
  personalDetails: { fullName: string; monthlySalary: number };
  loanConfig: { amount: number; tenure: number; totalRepayment: number };
  status: string;
  sanctionDetails: { sanctionedDate: string };
}

export default function DisbursementDashboard() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<Loan[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchSanctionedLoans();
    fetchDisbursementHistory();
  }, []);

  const fetchSanctionedLoans = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/disbursement/sanctioned`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      setLoans(data);
    } catch (error) {
      console.error("Failed to fetch sanctioned loans:", error);
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
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  const disburseLoan = async (loanId: string) => {
    const utrNumber = prompt("Enter UTR number for disbursement:");
    if (!utrNumber) return;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/disbursement/disburse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ loanId, utrNumber }),
      },
    );

    if (response.ok) {
      alert("Loan disbursed successfully!");
      fetchSanctionedLoans();
      fetchDisbursementHistory();
    } else {
      const error = await response.json();
      alert(error.error || "Failed to disburse loan");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Disbursement Dashboard</h1>

        {/* Pending Disbursements */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Ready for Disbursement
          </h2>
          <div className="grid gap-6">
            {loans.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No loans ready for disbursement</p>
              </div>
            ) : (
              loans.map((loan) => (
                <div key={loan._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {loan.personalDetails.fullName}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-600">Loan Amount:</p>
                          <p className="font-medium">
                            ₹{loan.loanConfig.amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Monthly Salary:</p>
                          <p className="font-medium">
                            ₹
                            {loan.personalDetails.monthlySalary.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Tenure:</p>
                          <p className="font-medium">
                            {loan.loanConfig.tenure} days
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Repayment:</p>
                          <p className="font-medium">
                            ₹{loan.loanConfig.totalRepayment.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Sanctioned Date:</p>
                          <p className="font-medium">
                            {new Date(
                              loan.sanctionDetails.sanctionedDate,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => disburseLoan(loan._id)}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Disburse Loan
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Disbursement History */}
        {history.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Recent Disbursements
            </h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Borrower
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      UTR Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Disbursed Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((loan) => (
                    <tr key={loan._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {loan.personalDetails.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {loan.userId.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{loan.loanConfig.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {loan.disbursementDetails?.utrNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {loan.disbursementDetails?.disbursedDate
                          ? new Date(
                              loan.disbursementDetails.disbursedDate,
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
