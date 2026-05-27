"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

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
        // Common pattern: { success: true, data: [...] }
        setApplications(data.data);
      } else if (data && Array.isArray(data.applications)) {
        setApplications(data.applications);
      } else {
        console.warn("Unexpected API response format:", data);
        setApplications([]); // fallback
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      applied: "bg-yellow-100 text-yellow-800",
      sanctioned: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800",
      disbursed: "bg-green-100 text-green-800",
      active: "bg-purple-100 text-purple-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Loan Applications</h1>
          <Link
            href="/borrower/apply"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Application
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">
              No loan applications yet
            </p>
            <Link
              href="/borrower/apply"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Start your first application →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications?.map((app) => (
              <div key={app._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(
                        app.status,
                      )}`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Applied on: {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {app.loanConfig ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 text-sm">Loan Amount</p>
                      <p className="font-semibold">
                        ₹{app.loanConfig.amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Tenure</p>
                      <p className="font-semibold">
                        {app.loanConfig.tenure} days
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Total Repayment</p>
                      <p className="font-semibold">
                        ₹{app.loanConfig.totalRepayment.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 mb-4">Application in progress</p>
                )}

                {app.outstandingBalance !== undefined &&
                  app.outstandingBalance > 0 && (
                    <div className="border-t pt-4 mt-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-600 text-sm">
                            Outstanding Balance
                          </p>
                          <p className="font-bold text-red-600">
                            ₹{app.outstandingBalance.toFixed(2)}
                          </p>
                        </div>
                        <div className="w-48 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 rounded-full h-2"
                            style={{
                              width: `${(((app.loanConfig?.totalRepayment || 0) - app.outstandingBalance) / (app.loanConfig?.totalRepayment || 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                {app.status === "rejected" && (
                  <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
                    <p className="text-red-800 text-sm">
                      {/* Note: You'd need to fetch rejection reason from API */}
                      Your application was not approved at this time.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
