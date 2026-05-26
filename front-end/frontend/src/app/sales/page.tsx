"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

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
      setLeads(data);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const contactLead = async (userId: string) => {
    const notes = prompt("Enter notes about this contact:");
    if (notes) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sales/leads/${userId}/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes }),
        },
      );

      if (response.ok) {
        alert("Contact logged successfully");
      }
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sales Dashboard</h1>
          <p className="text-gray-600">
            Track and manage leads who haven't applied for loans yet
          </p>
        </div>

        <div className="grid gap-6">
          {leads.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 text-lg">No leads found</p>
              <p className="text-gray-400">
                All registered users have started loan applications
              </p>
            </div>
          ) : (
            leads.map((lead) => (
              <div
                key={lead._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {lead.fullName || lead.email.split("@")[0]}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Email:</p>
                          <p className="font-medium">{lead.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Phone:</p>
                          <p className="font-medium">
                            {lead.phoneNumber || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Registered:</p>
                          <p className="font-medium">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Last Activity:</p>
                          <p className="font-medium">
                            {new Date(lead.lastActivity).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => contactLead(lead._id)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Contact Lead
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <p className="text-sm opacity-90">Total Leads</p>
            <p className="text-3xl font-bold">{leads.length}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <p className="text-sm opacity-90">Conversion Rate</p>
            <p className="text-3xl font-bold">--%</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <p className="text-sm opacity-90">Active Follow-ups</p>
            <p className="text-3xl font-bold">{leads.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
