"use client";

import { useState } from "react";

type InquiryFormProps = {
  businessId: string;
};

export default function InquiryForm({ businessId }: InquiryFormProps) {
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          ...form,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send inquiry");
        return;
      }

      setSuccess("Inquiry sent successfully");
      setForm({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        message: "",
      });
    } catch (error) {
      console.error("Inquiry submit error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-10 rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-2xl font-bold">Send Inquiry</h2>
      <p className="mt-2 text-gray-600">
        Contact this business directly by sending an inquiry.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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

        <div>
          <label className="mb-2 block text-sm font-medium">Message</label>
          <textarea
            value={form.message}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, message: e.target.value }))
            }
            className="min-h-28 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="Write your inquiry message"
            required
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-green-600">{success}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-5 py-3 font-medium text-white disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Inquiry"}
        </button>
      </form>
    </div>
  );
}