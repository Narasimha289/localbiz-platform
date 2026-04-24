"use client";

import { useState, useEffect } from "react";

type BookingFormProps = {
  businessId: string;
  openingTime: string;
  closingTime: string;
  businessSlug: string;
};

type Service = {
  id: string;
  name: string;
  price: number | null;
  duration: number | null;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BookingForm({
  businessId,
  businessSlug,
  openingTime,
  closingTime,
}: BookingFormProps) {
  const [form, setForm] = useState({
    serviceId: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    bookingDate: "",
    bookingTime: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDuration, setSelectedDuration] = useState(30);

  function generateTimeSlots(open: string, close: string, duration: number) {
    const slots: string[] = [];

    const [openHour, openMinute] = open.split(":").map(Number);
    const [closeHour, closeMinute] = close.split(":").map(Number);

    const start = new Date();
    start.setHours(openHour, openMinute, 0, 0);

    const end = new Date();
    end.setHours(closeHour, closeMinute, 0, 0);

    while (start <= end) {
      const slot = start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      slots.push(slot);
      start.setMinutes(start.getMinutes() + duration);
    }

    return slots;
  }

  function isPastTimeSlot(slot: string) {
    if (!form.bookingDate) return false;

    const selectedDate = new Date(form.bookingDate);
    const today = new Date();

    const isToday =
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate();

    if (!isToday) return false;

    const [time, modifier] = slot.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    }

    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }

    const slotDate = new Date();
    slotDate.setHours(hours, minutes, 0, 0);

    return slotDate <= today;
  }

  async function loadRazorpayScript() {
    return new Promise<boolean>((resolve) => {
      if (document.getElementById("razorpay-checkout-script")) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.id = "razorpay-checkout-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  }

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch(`/api/businesses/${businessSlug}/services`);
        const data = await res.json();

        if (res.ok) {
          const fetchedServices: Service[] = data.services || [];
          setServices(fetchedServices);

          if (fetchedServices.length > 0 && !form.serviceId) {
            const firstService = fetchedServices[0];
            setSelectedDuration(firstService.duration || 30);
          }
        }
      } catch (err) {
        console.error("Fetch services failed:", err);
      }
    }

    fetchServices();
  }, [businessSlug, form.serviceId]);

  useEffect(() => {
    if (!form.bookingDate) return;

    async function fetchAvailability() {
      try {
        const res = await fetch(
          `/api/bookings/availability?businessId=${businessId}&date=${form.bookingDate}`
        );

        const data = await res.json();

        if (res.ok) {
          setBookedSlots(data.bookedSlots || []);
        }
      } catch (err) {
        console.error("Availability fetch failed:", err);
      }
    }

    fetchAvailability();
  }, [form.bookingDate, businessId]);

  const timeSlots = generateTimeSlots(
    openingTime,
    closingTime,
    selectedDuration
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        setError("Failed to load Razorpay. Please try again.");
        setLoading(false);
        return;
      }

      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          serviceId: form.serviceId,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          bookingDate: form.bookingDate,
          bookingTime: form.bookingTime,
          notes: form.notes,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        setError(orderData.message || "Failed to create payment order");
        setLoading(false);
        return;
      }

      const selectedService = services.find(
        (service) => service.id === form.serviceId
      );

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "LocalBiz",
        description: selectedService
          ? `Booking for ${selectedService.name}`
          : "Business Booking",
        order_id: orderData.order.id,

        prefill: {
          name: form.customerName,
          email: form.customerEmail,
          contact: form.customerPhone,
        },

        notes: {
          businessId,
          serviceId: form.serviceId,
          bookingDate: form.bookingDate,
          bookingTime: form.bookingTime,
        },

        theme: {
          color: "#000000",
        },

        method: {
          card: false,
          upi: true,
          netbanking: true,
          wallet: false,
          emi: false,
          paylater: false,
        },

        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payments/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpayOrderId: orderData.order.id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(
                verifyData.message || "Payment verification failed"
              );
            }

            setSuccess("Payment successful and booking confirmed");
            setForm({
              serviceId: "",
              customerName: "",
              customerEmail: "",
              customerPhone: "",
              bookingDate: "",
              bookingTime: "",
              notes: "",
            });
            setSelectedDuration(30);
            setBookedSlots([]);
          } catch (err: any) {
            console.error("Payment verification error:", err);
            setError(
              err.message || "Payment succeeded but verification failed"
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment submit error:", error);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-10 rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-2xl font-bold">Book Now</h2>
      <p className="mt-2 text-gray-600">
        Submit a booking request for this business.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Select Service
          </label>

          <select
            value={form.serviceId}
            onChange={(e) => {
              const selectedId = e.target.value;

              const selectedService = services.find(
                (service) => service.id === selectedId
              );

              setForm((prev) => ({
                ...prev,
                serviceId: selectedId,
                bookingTime: "",
              }));

              if (selectedService) {
                setSelectedDuration(selectedService.duration || 30);
              } else {
                setSelectedDuration(30);
              }
            }}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            required
          >
            <option value="">Select a service</option>

            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - ₹{service.price ?? 0} (
                {service.duration || 30} mins)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Your Name</label>
          <input
            type="text"
            value={form.customerName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, customerName: e.target.value }))
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="Enter your name"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Your Email</label>
          <input
            type="email"
            value={form.customerEmail}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, customerEmail: e.target.value }))
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Phone Number</label>
          <input
            type="text"
            value={form.customerPhone}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, customerPhone: e.target.value }))
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="Enter your phone number"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Booking Date
            </label>
            <input
              type="date"
              value={form.bookingDate}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  bookingDate: e.target.value,
                  bookingTime: "",
                }))
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Booking Time Slot
            </label>
            <select
              value={form.bookingTime}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bookingTime: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              required
              disabled={!form.serviceId}
            >
              <option value="">
                {form.serviceId ? "Select a time slot" : "Select a service first"}
              </option>

              {timeSlots.map((slot) => {
                const isBooked = bookedSlots.includes(slot);
                const isPast = isPastTimeSlot(slot);

                return (
                  <option
                    key={slot}
                    value={slot}
                    disabled={isBooked || isPast}
                  >
                    {slot} {isBooked ? "(Booked)" : isPast ? "(Unavailable)" : ""}
                  </option>
                );
              })}
            </select>

            <p className="mt-2 text-xs text-gray-500">
              Slots are generated based on selected service duration.
            </p>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, notes: e.target.value }))
            }
            className="min-h-28 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="Add extra details for your booking"
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-green-600">{success}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-5 py-3 font-medium text-white disabled:opacity-60"
        >
          {loading ? "Processing Payment..." : "Pay & Book Now"}
        </button>
      </form>
    </div>
  );
}