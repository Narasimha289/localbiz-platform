"use client";

import { useEffect, useState } from "react";

type Business = {
  id: string;
  businessName: string;
  status: string;
  city: string;
  state: string;
  email: string | null;
  phone: string;
  owner?: {
    name: string | null;
    email: string | null;
  } | null;
};

function getStatusStyles(status: string) {
  const base = "rounded-full border px-3 py-1 text-xs font-medium";

  if (status === "PENDING")
    return `${base} border-yellow-200 bg-yellow-50 text-yellow-700`;
  if (status === "APPROVED")
    return `${base} border-green-200 bg-green-50 text-green-700`;
  if (status === "REJECTED")
    return `${base} border-red-200 bg-red-50 text-red-700`;

  return `${base} border-gray-200 bg-gray-50 text-gray-700`;
}

export default function AdminBusinessesList() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{
    id: string;
    type: "APPROVED" | "REJECTED";
  } | null>(null);

  async function fetchBusinesses() {
    try {
      const response = await fetch("/api/businesses/pending");
      const data = await response.json();

      if (response.ok) {
        setBusinesses(data.businesses || []);
      }
    } catch (error) {
      console.error("Fetch admin businesses failed:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBusinesses();
  }, []);

  async function updateBusinessStatus(
    businessId: string,
    status: "APPROVED" | "REJECTED"
  ) {
    try {
      setActionLoading({ id: businessId, type: status });

      const response = await fetch(
        `/api/businesses/by-id/${businessId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update business");
        return;
      }

      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === businessId ? { ...b, status } : b
        )
      );
    } catch (error) {
      console.error("Update business failed:", error);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border p-6 shadow-sm">
        Loading businesses...
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="rounded-2xl border p-6 shadow-sm">
        <h2 className="text-xl font-bold sm:text-2xl">
          Admin Business Approval
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          No businesses found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold sm:text-2xl">
        Admin Business Approval
      </h2>

      {businesses.map((business) => (
        <div
          key={business.id}
          className="rounded-2xl border p-4 shadow-sm sm:p-6"
        >
          {/* Top */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-bold sm:text-xl">
                {business.businessName}
              </h3>
              <p className="text-sm text-gray-600">
                {business.city}, {business.state}
              </p>
            </div>

            <div className="flex shrink-0">
              <span className={`${getStatusStyles(business.status)} inline-flex w-fit whitespace-nowrap`}>
                {business.status}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
            <p><strong>Phone:</strong> {business.phone}</p>
            <p><strong>Email:</strong> {business.email || "N/A"}</p>
            <p><strong>Owner:</strong> {business.owner?.name || "N/A"}</p>
            <p><strong>Owner Email:</strong> {business.owner?.email || "N/A"}</p>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {business.status !== "APPROVED" && (
              <button
                onClick={() =>
                  updateBusinessStatus(business.id, "APPROVED")
                }
                className="w-full rounded-lg bg-green-600 px-4 py-2 text-white sm:w-auto"
              >
                {actionLoading?.id === business.id &&
                actionLoading?.type === "APPROVED"
                  ? "Updating..."
                  : "Approve"}
              </button>
            )}

            {business.status !== "REJECTED" && (
              <button
                onClick={() =>
                  updateBusinessStatus(business.id, "REJECTED")
                }
                className="w-full rounded-lg bg-red-600 px-4 py-2 text-white sm:w-auto"
              >
                {actionLoading?.id === business.id &&
                actionLoading?.type === "REJECTED"
                  ? "Updating..."
                  : "Reject"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}