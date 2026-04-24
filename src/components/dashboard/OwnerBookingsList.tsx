"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  bookingDate: string;
  bookingTime: string;
  notes: string | null;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  paymentStatus?: string;
  amount?: number | null;
  business: {
    businessName: string;
  };
  service?: {
    name: string;
  } | null;
};

type ActionLoadingState = {
  id: string;
  type: "CONFIRMED" | "CANCELLED" | "COMPLETED";
} | null;

function getStatusBadge(status: string) {
  const base = "rounded-full border px-3 py-1 text-xs font-medium";

  if (status === "PENDING")
    return `${base} bg-yellow-50 text-yellow-700 border-yellow-200`;
  if (status === "CONFIRMED")
    return `${base} bg-blue-50 text-blue-700 border-blue-200`;
  if (status === "COMPLETED")
    return `${base} bg-green-50 text-green-700 border-green-200`;
  if (status === "CANCELLED")
    return `${base} bg-red-50 text-red-700 border-red-200`;

  return `${base} bg-gray-50 text-gray-700 border-gray-200`;
}

function getPaymentBadge(paymentStatus: string | undefined) {
  const base = "rounded-full border px-3 py-1 text-xs font-medium";

  if (paymentStatus === "PAID")
    return `${base} bg-green-50 text-green-700 border-green-200`;
  if (paymentStatus === "PENDING")
    return `${base} bg-yellow-50 text-yellow-700 border-yellow-200`;
  if (paymentStatus === "FAILED")
    return `${base} bg-red-50 text-red-700 border-red-200`;

  return `${base} bg-gray-50 text-gray-700 border-gray-200`;
}

export default function OwnerBookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<ActionLoadingState>(null);

  async function fetchBookings() {
    try {
      const response = await fetch("/api/owner/bookings");
      const data = await response.json();

      if (response.ok) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Fetch owner bookings failed:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  async function updateBookingStatus(
    bookingId: string,
    status: "CONFIRMED" | "CANCELLED" | "COMPLETED"
  ) {
    try {
      setActionLoading({ id: bookingId, type: status });

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update booking");
        return;
      }

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status } : booking
        )
      );
    } catch (error) {
      console.error("Update booking failed:", error);
    } finally {
      setActionLoading(null);
    }
  }

  const filteredBookings =
    selectedStatus === "ALL"
      ? bookings
      : bookings.filter((b) => b.status === selectedStatus);

  if (loading) {
    return (
      <div className="rounded-2xl border p-6 shadow-sm">
        Loading bookings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold sm:text-2xl">Owner Bookings</h2>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`rounded-lg px-3 py-2 text-xs font-medium sm:text-sm ${
                selectedStatus === status
                  ? "bg-black text-white"
                  : "border border-gray-300 text-gray-700"
              }`}
            >
              {status}
            </button>
          )
        )}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="rounded-2xl border p-6 shadow-sm">
          No bookings found.
        </div>
      ) : (
        filteredBookings.map((booking) => (
          <div
            key={booking.id}
            className="rounded-2xl border p-4 shadow-sm sm:p-6"
          >
            {/* Top section */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <div>
                <h3 className="text-lg font-bold sm:text-xl">
                  {booking.customerName}
                </h3>
                <p className="text-sm text-gray-600">
                  {booking.business.businessName}
                </p>
                {booking.service?.name && (
                  <p className="text-sm text-gray-600">
                    {booking.service.name}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={getStatusBadge(booking.status)}>
                  {booking.status}
                </span>
                <span className={getPaymentBadge(booking.paymentStatus)}>
                  {booking.paymentStatus || "N/A"}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
              <p><strong>Email:</strong> {booking.customerEmail}</p>
              <p><strong>Phone:</strong> {booking.customerPhone || "N/A"}</p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(booking.bookingDate).toLocaleDateString()}
              </p>
              <p><strong>Time:</strong> {booking.bookingTime}</p>
              <p><strong>Amount:</strong> ₹{booking.amount ?? 0}</p>
            </div>

            {/* Notes */}
            <p className="mt-3 text-sm text-gray-600">
              {booking.notes || "No notes"}
            </p>

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              {booking.status === "PENDING" && (
                <>
                  <button
                    onClick={() =>
                      updateBookingStatus(booking.id, "CONFIRMED")
                    }
                    className="w-full rounded-lg bg-green-600 px-4 py-2 text-white sm:w-auto"
                  >
                    Confirm
                  </button>

                  <button
                    onClick={() =>
                      updateBookingStatus(booking.id, "CANCELLED")
                    }
                    className="w-full rounded-lg bg-red-600 px-4 py-2 text-white sm:w-auto"
                  >
                    Cancel
                  </button>
                </>
              )}

              {booking.status === "CONFIRMED" && (
                <>
                  <button
                    onClick={() =>
                      updateBookingStatus(booking.id, "COMPLETED")
                    }
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white sm:w-auto"
                  >
                    Complete
                  </button>

                  <button
                    onClick={() =>
                      updateBookingStatus(booking.id, "CANCELLED")
                    }
                    className="w-full rounded-lg bg-red-600 px-4 py-2 text-white sm:w-auto"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}