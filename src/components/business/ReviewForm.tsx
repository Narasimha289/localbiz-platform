"use client";

import { useState } from "react";

type ReviewFormProps = {
  businessId: string;
};

export default function ReviewForm({ businessId }: ReviewFormProps) {
  const [form, setForm] = useState({
    rating: "5",
    comment: "",
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
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          rating: Number(form.rating),
          comment: form.comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to submit review");
        return;
      }

      setSuccess("Review submitted successfully");
      setForm({
        rating: "5",
        comment: "",
      });
    } catch (error) {
      console.error("Review submit error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-10 rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-2xl font-bold">Leave a Review</h2>
      <p className="mt-2 text-gray-600">
        Share your experience with this business.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">Rating</label>
          <select
            value={form.rating}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, rating: e.target.value }))
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            required
          >
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Very Good</option>
            <option value="3">3 - Good</option>
            <option value="2">2 - Fair</option>
            <option value="1">1 - Poor</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Comment</label>
          <textarea
            value={form.comment}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, comment: e.target.value }))
            }
            className="min-h-28 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="Write your review"
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-green-600">{success}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-5 py-3 font-medium text-white disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}