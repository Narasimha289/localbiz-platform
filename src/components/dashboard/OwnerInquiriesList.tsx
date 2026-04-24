"use client";

import { useEffect, useState } from "react";

type Inquiry = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  message: string;
  status: string;
  createdAt: string;
  business: {
    id: string;
    businessName: string;
    slug: string;
  };
};

export default function OwnerInquiriesList() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{
    id: string;
    type: "VIEWED" | "RESPONDED";
  } | null>(null);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "NEW" | "VIEWED" | "RESPONDED"
  >("ALL");

  async function fetchInquiries() {
    try {
      const response = await fetch("/api/owner/inquiries");
      const data = await response.json();

      if (response.ok) {
        setInquiries(data.inquiries || []);
      }
    } catch (error) {
      console.error("Fetch owner inquiries failed:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInquiries();
  }, []);

  async function updateInquiryStatus(
    id: string,
    status: "VIEWED" | "RESPONDED"
  ) {
    setActionLoading({ id, type: status });
    setMessage("");

    try {
      const response = await fetch(`/api/owner/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update inquiry");
        return;
      }

      setInquiries((prev) =>
        prev.map((inquiry) =>
          inquiry.id === id ? { ...inquiry, status } : inquiry
        )
      );

      setMessage(data.message || "Inquiry updated successfully");
    } catch (error) {
      console.error("Update inquiry failed:", error);
      setMessage("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  }

  const filteredInquiries =
    statusFilter === "ALL"
      ? inquiries
      : inquiries.filter((i) => i.status === statusFilter);

  const count = (status: string) =>
    inquiries.filter((i) => i.status === status).length;

  if (loading) {
    return (
      <div className="rounded-2xl border p-6 shadow-sm">
        Loading inquiries...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold sm:text-2xl">Owner Inquiries</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "NEW", "VIEWED", "RESPONDED"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as any)}
            className={`rounded-lg px-3 py-2 text-xs font-medium sm:text-sm ${
              statusFilter === status
                ? "bg-black text-white"
                : "border border-gray-300 text-gray-700"
            }`}
          >
            {status}{" "}
            {status !== "ALL" ? `(${count(status)})` : `(${inquiries.length})`}
          </button>
        ))}
      </div>

      {message && (
        <div className="rounded-lg border bg-gray-50 px-4 py-2 text-sm">
          {message}
        </div>
      )}

      {filteredInquiries.length === 0 ? (
        <div className="rounded-2xl border p-6 shadow-sm">
          No inquiries found.
        </div>
      ) : (
        filteredInquiries.map((inquiry) => (
          <div
            key={inquiry.id}
            className="rounded-2xl border p-4 shadow-sm sm:p-6"
          >
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <div>
                <h3 className="text-lg font-bold sm:text-xl">
                  {inquiry.customerName}
                </h3>
                <p className="text-sm text-gray-600">
                  {inquiry.business.businessName}
                </p>
              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                {inquiry.status}
              </span>
            </div>

            {/* Info */}
            <div className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
              <p><strong>Email:</strong> {inquiry.customerEmail}</p>
              <p><strong>Phone:</strong> {inquiry.customerPhone || "N/A"}</p>
              <p>
                <strong>Received:</strong>{" "}
                {new Date(inquiry.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Message */}
            <p className="mt-3 text-sm text-gray-600">
              {inquiry.message}
            </p>

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              {inquiry.status === "NEW" && (
                <>
                  <button
                    onClick={() =>
                      updateInquiryStatus(inquiry.id, "VIEWED")
                    }
                    className="w-full rounded-lg bg-yellow-500 px-4 py-2 text-white sm:w-auto"
                  >
                    Mark Viewed
                  </button>

                  <button
                    onClick={() =>
                      updateInquiryStatus(inquiry.id, "RESPONDED")
                    }
                    className="w-full rounded-lg bg-green-600 px-4 py-2 text-white sm:w-auto"
                  >
                    Mark Responded
                  </button>
                </>
              )}

              {inquiry.status === "VIEWED" && (
                <button
                  onClick={() =>
                    updateInquiryStatus(inquiry.id, "RESPONDED")
                  }
                  className="w-full rounded-lg bg-green-600 px-4 py-2 text-white sm:w-auto"
                >
                  Mark Responded
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}