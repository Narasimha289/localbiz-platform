"use client";

import { useEffect, useState } from "react";

type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
type ActionStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED";

type Booking = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  bookingDate: string;
  bookingTime: string;
  notes: string | null;
  status: BookingStatus;
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
  type: ActionStatus;
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

function ButtonSpinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
  );
}

export default function OwnerBookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "ALL">(
    "ALL"
  );
  const [actionLoading, setActionLoading] = useState<ActionLoadingState>(null);

  async function fetchBookings() {
    try {
      setLoading(true);

      const response = await fetch("/api/owner/bookings");
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to fetch bookings");
        return;
      }

      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Fetch owner bookings failed:", error);
      alert("Something went wrong while fetching bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  async function updateBookingStatus(bookingId: string, status: ActionStatus) {
    if (actionLoading) return;

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
      alert("Something went wrong while updating booking");
    } finally {
      setActionLoading(null);
    }
  }

  function isBookingUpdating(bookingId: string) {
    return actionLoading?.id === bookingId;
  }

  function isSpecificActionUpdating(bookingId: string, status: ActionStatus) {
    return actionLoading?.id === bookingId && actionLoading.type === status;
  }

  function ActionButton({
    bookingId,
    status,
    label,
    className,
  }: {
    bookingId: string;
    status: ActionStatus;
    label: string;
    className: string;
  }) {
    const loadingThisAction = isSpecificActionUpdating(bookingId, status);
    const disabled = isBookingUpdating(bookingId);

    return (
      <button
        type="button"
        onClick={() => updateBookingStatus(bookingId, status)}
        disabled={disabled}
        className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto ${className}`}
      >
        {loadingThisAction && <ButtonSpinner />}
        {loadingThisAction ? "Updating..." : label}
      </button>
    );
  }

  const filteredBookings =
    selectedStatus === "ALL"
      ? bookings
      : bookings.filter((booking) => booking.status === selectedStatus);

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

      <div className="flex flex-wrap gap-2">
        {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map(
          (status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status as BookingStatus | "ALL")}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm ${
                selectedStatus === status
                  ? "bg-slate-900 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
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

              <div className="flex shrink-0 flex-wrap items-start justify-start gap-2 sm:justify-end">
                <span className={`${getStatusBadge(booking.status)} inline-flex w-fit whitespace-nowrap`}>
                  {booking.status}
                </span>

                <span className={`${getPaymentBadge(booking.paymentStatus)} inline-flex w-fit whitespace-nowrap`}>
                  {booking.paymentStatus || "N/A"}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
              <p>
                <strong>Email:</strong> {booking.customerEmail}
              </p>

              <p>
                <strong>Phone:</strong> {booking.customerPhone || "N/A"}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(booking.bookingDate).toLocaleDateString()}
              </p>

              <p>
                <strong>Time:</strong> {booking.bookingTime}
              </p>

              <p>
                <strong>Amount:</strong> ₹{booking.amount ?? 0}
              </p>
            </div>

            <p className="mt-3 text-sm text-gray-600">
              {booking.notes || "No notes"}
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              {booking.status === "PENDING" && (
                <>
                  <ActionButton
                    bookingId={booking.id}
                    status="CONFIRMED"
                    label="Confirm"
                    className="bg-green-600 hover:bg-green-700"
                  />

                  <ActionButton
                    bookingId={booking.id}
                    status="CANCELLED"
                    label="Cancel"
                    className="bg-red-600 hover:bg-red-700"
                  />
                </>
              )}

              {booking.status === "CONFIRMED" && (
                <>
                  <ActionButton
                    bookingId={booking.id}
                    status="COMPLETED"
                    label="Complete"
                    className="bg-blue-600 hover:bg-blue-700"
                  />

                  <ActionButton
                    bookingId={booking.id}
                    status="CANCELLED"
                    label="Cancel"
                    className="bg-red-600 hover:bg-red-700"
                  />
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}