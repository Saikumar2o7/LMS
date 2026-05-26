"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

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
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const { token } = useAuth();

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
      alert("User created successfully");
      setShowCreateUser(false);
      fetchData();
    } else {
      const error = await response.json();
      alert(error.error || "Failed to create user");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Total Loans</p>
              <p className="text-3xl font-bold">{stats.totalLoans}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Disbursed Loans</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.totalDisbursed}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Closed Loans</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalClosed}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab("loans")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "loans"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Loans
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Loans</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                        Borrower
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loans.slice(0, 10).map((loan) => (
                      <tr key={loan._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {loan.personalDetails.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{loan.loanConfig.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${loan.status === "applied" ? "bg-yellow-100 text-yellow-800" : ""}
                            ${loan.status === "sanctioned" ? "bg-blue-100 text-blue-800" : ""}
                            ${loan.status === "disbursed" ? "bg-green-100 text-green-800" : ""}
                            ${loan.status === "closed" ? "bg-gray-100 text-gray-800" : ""}
                            ${loan.status === "rejected" ? "bg-red-100 text-red-800" : ""}
                          `}
                          >
                            {loan.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(loan.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">System Users</h2>
              <button
                onClick={() => setShowCreateUser(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + Create User
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.fullName || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Loans Tab */}
        {activeTab === "loans" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                    Borrower
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                    Total Repayment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loans.map((loan) => (
                  <tr key={loan._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {loan.personalDetails.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{loan.loanConfig.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{loan.loanConfig.totalRepayment.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                        ${loan.status === "applied" ? "bg-yellow-100 text-yellow-800" : ""}
                        ${loan.status === "sanctioned" ? "bg-blue-100 text-blue-800" : ""}
                        ${loan.status === "disbursed" ? "bg-green-100 text-green-800" : ""}
                        ${loan.status === "active" ? "bg-purple-100 text-purple-800" : ""}
                        ${loan.status === "closed" ? "bg-gray-100 text-gray-800" : ""}
                        ${loan.status === "rejected" ? "bg-red-100 text-red-800" : ""}
                      `}
                      >
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(loan.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Create New User</h3>
              <form onSubmit={createUser}>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full p-2 border rounded"
                    required
                  />
                  <select
                    name="role"
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="borrower">Borrower</option>
                    <option value="sales">Sales</option>
                    <option value="sanction">Sanction</option>
                    <option value="disbursement">Disbursement</option>
                    <option value="collection">Collection</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateUser(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
