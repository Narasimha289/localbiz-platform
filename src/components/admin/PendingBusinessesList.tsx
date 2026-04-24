"use client";

import { useEffect, useState } from "react";

type Business = {
  id: string;
  businessName: string;
  description: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: string;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

export default function PendingBusinessesList() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function fetchPendingBusinesses() {
    try {
      const response = await fetch("/api/admin/businesses/pending");
      const data = await response.json();

      if (response.ok) {
        setBusinesses(data.businesses || []);
      }
    } catch (error) {
      console.error("Fetch pending businesses failed:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPendingBusinesses();
  }, []);

  async function updateStatus(id: string, status: "APPROVED" | "REJECTED") {
    setActionLoadingId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/businesses/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update business");
        return;
      }

      setBusinesses((prev) => prev.filter((business) => business.id !== id));
      setMessage(data.message || "Status updated successfully");
    } catch (error) {
      console.error("Update status failed:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
        Loading pending businesses...
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Pending Businesses</h2>
        <p className="mt-2 text-gray-600">No pending businesses right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          {message}
        </div>
      ) : null}

      {businesses.map((business) => (
        <div
          key={business.id}
          className="rounded-2xl border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-2xl font-bold">{business.businessName}</h3>
              <p className="mt-2 text-gray-600">{business.description}</p>
            </div>

            <div className="rounded-full border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-800">
              {business.status}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <p><strong>Category:</strong> {business.category.name}</p>
              <p><strong>Phone:</strong> {business.phone}</p>
              <p><strong>Email:</strong> {business.email || "N/A"}</p>
            </div>

            <div>
              <p><strong>Owner:</strong> {business.owner.name}</p>
              <p><strong>Owner Email:</strong> {business.owner.email}</p>
              <p><strong>Created:</strong> {new Date(business.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4">
            <p><strong>Address:</strong> {business.address}, {business.city}, {business.state} - {business.pincode}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => updateStatus(business.id, "APPROVED")}
              disabled={actionLoadingId === business.id}
              className="rounded-xl bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700 disabled:opacity-60"
            >
              {actionLoadingId === business.id ? "Processing..." : "Approve"}
            </button>

            <button
              onClick={() => updateStatus(business.id, "REJECTED")}
              disabled={actionLoadingId === business.id}
              className="rounded-xl bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {actionLoadingId === business.id ? "Processing..." : "Reject"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}