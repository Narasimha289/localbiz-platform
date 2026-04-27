"use client";

import { useState } from "react";

type ReviewFormProps = {
  businessId: string;
  bookingId: string;
  initialReview?: {
    rating: number;
    comment: string | null;
  } | null;
};

export default function ReviewForm({
  businessId,
  bookingId,
  initialReview = null,
}: ReviewFormProps) {
  const [rating, setRating] = useState<number | null>(
    initialReview?.rating ?? null
  );
  const [hover, setHover] = useState<number | null>(null);

  const [form, setForm] = useState({
    comment: initialReview?.comment ?? "",
  });

  const [hasReview, setHasReview] = useState(Boolean(initialReview));
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const ratingLabels: Record<number, string> = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!rating) {
      setError("Please select a rating");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/reviews", {
        method: hasReview ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          bookingId,
          rating,
          comment: form.comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to save review");
        return;
      }

      setHasReview(true);
      setSuccess(
        hasReview
          ? "Review updated successfully"
          : "Review submitted successfully"
      );
    } catch (error) {
      console.error("Review save error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteReview() {
    const confirmDelete = confirm("Are you sure you want to delete this review?");

    if (!confirmDelete) return;

    setDeleteLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/reviews?bookingId=${bookingId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete review");
        return;
      }

      setHasReview(false);
      setRating(null);
      setForm({ comment: "" });
      setSuccess("Review deleted successfully");
    } catch (error) {
      console.error("Review delete error:", error);
      setError("Something went wrong while deleting review.");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-2xl font-bold">
        {hasReview ? "Edit Your Review" : "Leave a Review"}
      </h2>

      <p className="mt-2 text-gray-600">
        {hasReview
          ? "Update your experience for this completed booking."
          : "Share your experience with this business."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">Rating</label>

          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(null)}
                className={`text-3xl transition ${
                  star <= (hover ?? rating ?? 0)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>

          {!rating && (
            <p className="mt-1 text-xs text-gray-500">Click a star to rate</p>
          )}

          {rating && (
            <p className="mt-1 text-sm font-medium text-gray-700">
              {rating} - {ratingLabels[rating]}
            </p>
          )}
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

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={loading || deleteLoading}
            className="w-full rounded-xl bg-black px-5 py-3 font-medium text-white disabled:opacity-60 sm:w-auto"
          >
            {loading
              ? hasReview
                ? "Updating..."
                : "Submitting..."
              : hasReview
              ? "Update Review"
              : "Submit Review"}
          </button>

          {hasReview && (
            <button
              type="button"
              onClick={handleDeleteReview}
              disabled={loading || deleteLoading}
              className="w-full rounded-xl bg-red-600 px-5 py-3 font-medium text-white disabled:opacity-60 sm:w-auto"
            >
              {deleteLoading ? "Deleting..." : "Delete Review"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}