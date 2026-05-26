"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Loan {
  _id: string;
  userId: { email: string; fullName: string; phoneNumber?: string };
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
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  const fetchPaymentHistory = async (loanId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/collection/payments/${loanId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      setPaymentHistory(data.payments || []);
      setSelectedLoan(loanId);
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    }
  };

  const recordPayment = async (loanId: string) => {
    const utrNumber = prompt("Enter UTR Number:");
    if (!utrNumber) return;

    const amountStr = prompt("Enter Payment Amount (₹):");
    if (!amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const paymentMethod = prompt(
      "Payment Method (bank_transfer/cheque/cash/online):",
      "bank_transfer",
    );

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/collection/payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          loanId,
          utrNumber,
          amount,
          paymentDate: new Date().toISOString(),
          paymentMethod: paymentMethod || "bank_transfer",
        }),
      },
    );

    if (response.ok) {
      const result = await response.json();
      alert(
        `Payment recorded successfully! Outstanding balance: ₹${result.loan.outstandingBalance.toFixed(2)}`,
      );
      fetchData();
      if (selectedLoan === loanId) {
        fetchPaymentHistory(loanId);
      }
    } else {
      const error = await response.json();
      alert(error.error || "Failed to record payment");
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
        <h1 className="text-3xl font-bold mb-8">Collection Dashboard</h1>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
              <p className="text-sm opacity-90">Total Collected</p>
              <p className="text-3xl font-bold">
                ₹{stats.totalPaymentsCollected?.toFixed(2) || 0}
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
              <p className="text-sm opacity-90">Active Loans</p>
              <p className="text-3xl font-bold">{stats.activeLoans || 0}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
              <p className="text-sm opacity-90">Closed Loans</p>
              <p className="text-3xl font-bold">{stats.fullyPaidLoans || 0}</p>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
              <p className="text-sm opacity-90">Avg Payment</p>
              <p className="text-3xl font-bold">
                ₹{stats.averagePaymentAmount?.toFixed(2) || 0}
              </p>
            </div>
          </div>
        )}

        {/* Active Loans */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Active Loans</h2>
          <div className="grid gap-6">
            {activeLoans.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No active loans</p>
              </div>
            ) : (
              activeLoans.map((loan) => (
                <div
                  key={loan._id}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          {loan.personalDetails.fullName}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-gray-600">Email:</p>
                            <p className="font-medium text-sm">
                              {loan.userId.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total Repayment:</p>
                            <p className="font-medium">
                              ₹{loan.loanConfig.totalRepayment.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total Paid:</p>
                            <p className="font-medium text-green-600">
                              ₹{loan.totalPaid.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Outstanding:</p>
                            <p className="font-bold text-red-600">
                              ₹{loan.outstandingBalance.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 rounded-full h-2 transition-all"
                              style={{
                                width: `${(loan.totalPaid / loan.loanConfig.totalRepayment) * 100}%`,
                              }}
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {(
                              (loan.totalPaid /
                                loan.loanConfig.totalRepayment) *
                              100
                            ).toFixed(1)}
                            % paid
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => recordPayment(loan._id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        Record Payment
                      </button>
                      <button
                        onClick={() => fetchPaymentHistory(loan._id)}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                      >
                        View History
                      </button>
                    </div>
                  </div>

                  {/* Payment History Modal */}
                  {selectedLoan === loan._id && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold">
                          Payment History
                        </h4>
                        <button
                          onClick={() => setSelectedLoan(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                      {paymentHistory.length === 0 ? (
                        <p className="text-gray-500">
                          No payments recorded yet
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                  Date
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                  UTR
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                  Amount
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                  Method
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                  Recorded By
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {paymentHistory.map((payment) => (
                                <tr key={payment._id}>
                                  <td className="px-4 py-2 text-sm">
                                    {new Date(
                                      payment.paymentDate,
                                    ).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-2 text-sm font-mono">
                                    {payment.utrNumber}
                                  </td>
                                  <td className="px-4 py-2 text-sm font-medium">
                                    ₹{payment.amount.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-2 text-sm capitalize">
                                    {payment.paymentMethod || "bank_transfer"}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {payment.recordedBy.email}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Closed Loans Summary */}
        {closedLoans.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Recently Closed Loans
            </h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                      Borrower
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                      Total Repayment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                      Total Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                      Closed Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {closedLoans.slice(0, 10).map((loan) => (
                    <tr key={loan._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {loan.personalDetails.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{loan.loanConfig.totalRepayment.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        ₹{loan.totalPaid.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(loan.updatedAt).toLocaleDateString()}
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
