"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: string;
  bookingDate: string;
  bookingTime: string;
  notes: string | null;
  status: string;
  paymentStatus?: string;
  amount?: number | null;
  business: {
    businessName: string;
  };
  service?: {
    name: string;
  } | null;
};

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

export default function CustomerBookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchBookings() {
    try {
      const response = await fetch("/api/customer/bookings");
      const data = await response.json();

      if (response.ok) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Fetch customer bookings failed:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border p-6 shadow-sm">
        Loading bookings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold sm:text-2xl">My Bookings</h2>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border p-6 text-sm text-gray-600 shadow-sm">
          You have no bookings yet.
        </div>
      ) : (
        bookings.map((booking) => (
          <div
            key={booking.id}
            className="rounded-2xl border p-4 shadow-sm sm:p-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-bold sm:text-xl">
                  {booking.business.businessName}
                </h3>

                {booking.service?.name ? (
                  <p className="mt-1 text-sm text-gray-600">
                    Service: {booking.service.name}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-wrap items-start justify-start gap-2 sm:justify-end">
                <span className={`${getStatusBadge(booking.status)} inline-flex w-fit whitespace-nowrap`}>
                  {booking.status}
                </span>

                <span className={`${getPaymentBadge(booking.paymentStatus)} inline-flex w-fit whitespace-nowrap`}>
                  Payment: {booking.paymentStatus || "N/A"}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
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
              <p>
                <strong>Notes:</strong> {booking.notes || "No notes"}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}