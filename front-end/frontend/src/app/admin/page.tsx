"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

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
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "users" || tab === "loans") setActiveTab(tab);
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      applied: "bg-yellow-100 text-yellow-800",
      sanctioned: "bg-blue-100 text-blue-800",
      disbursed: "bg-green-100 text-green-800",
      active: "bg-purple-100 text-purple-800",
      closed: "bg-gray-100 text-gray-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage users, loans, and system settings
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Users</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
                </div>
                <div className="text-4xl opacity-50">👥</div>
              </div>
            </div>
            <div className="stat-card bg-gradient-to-br from-green-500 to-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Loans</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalLoans}</p>
                </div>
                <div className="text-4xl opacity-50">💰</div>
              </div>
            </div>
            <div className="stat-card bg-gradient-to-br from-purple-500 to-purple-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Disbursed</p>
                  <p className="text-3xl font-bold mt-2">
                    {stats.totalDisbursed}
                  </p>
                </div>
                <div className="text-4xl opacity-50">💸</div>
              </div>
            </div>
            <div className="stat-card bg-gradient-to-br from-orange-500 to-orange-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Closed</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalClosed}</p>
                </div>
                <div className="text-4xl opacity-50">✅</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", name: "Overview", icon: "📊" },
              { id: "users", name: "Users", icon: "👥" },
              { id: "loans", name: "Loans", icon: "📋" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Recent Loan Applications
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Borrower
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loans.slice(0, 10).map((loan) => (
                      <tr
                        key={loan._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {loan.personalDetails.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{loan.loanConfig.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`badge ${getStatusColor(loan.status)} capitalize`}
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
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                System Users
              </h2>
              <button
                onClick={() => setShowCreateUser(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Add User</span>
              </button>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {user.fullName?.[0] ||
                                user.email[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {user.fullName || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
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
          </motion.div>
        )}

        {/* Loans Tab */}
        {activeTab === "loans" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Borrower
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Repayment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loans.map((loan) => (
                    <tr
                      key={loan._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
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
                          className={`badge ${getStatusColor(loan.status)} capitalize`}
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
          </motion.div>
        )}

        {/* Create User Modal */}
        {showCreateUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold mb-4">Create New User</h3>
              <form onSubmit={createUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select name="role" className="input-field" required>
                    <option value="borrower">Borrower</option>
                    <option value="sales">Sales</option>
                    <option value="sanction">Sanction</option>
                    <option value="disbursement">Disbursement</option>
                    <option value="collection">Collection</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateUser(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
