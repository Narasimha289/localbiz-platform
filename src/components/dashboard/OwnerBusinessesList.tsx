"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Business = {
  id: string;
  businessName: string;
  slug: string;
  description: string;
  phone: string;
  email: string | null;
  city: string;
  state: string;
  pincode: string;
  status: string;
  createdAt: string;
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
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

export default function OwnerBusinessesList() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const response = await fetch("/api/owner/businesses");
        const data = await response.json();

        if (response.ok) {
          setBusinesses(data.businesses || []);
        }
      } catch (error) {
        console.error("Fetch owner businesses failed:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBusinesses();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border p-6 shadow-sm">
        Loading your businesses...
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="rounded-2xl border p-6 shadow-sm">
        <h2 className="text-xl font-bold sm:text-2xl">Your Businesses</h2>
        <p className="mt-2 text-sm text-gray-600">
          You have not created any businesses yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold sm:text-2xl">Your Businesses</h2>

      {businesses.map((business) => (
        <div
          key={business.id}
          className="rounded-2xl border p-4 shadow-sm sm:p-6"
        >
          {/* Top Section */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
              {business.imageUrl && (
                <img
                  src={business.imageUrl}
                  alt={business.businessName}
                  className="h-16 w-16 rounded-xl object-cover"
                />
              )}

              <div>
                <h3 className="text-lg font-bold sm:text-xl">
                  {business.businessName}
                </h3>

                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {business.description}
                </p>
              </div>
            </div>

            <div className={`${getStatusStyles(business.status)} inline-flex w-fit shrink-0 whitespace-nowrap`}>
              {business.status}
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
            <p>
              <strong>Category:</strong>{" "}
              {business.category?.name || "N/A"}
            </p>
            <p>
              <strong>Phone:</strong> {business.phone}
            </p>
            <p>
              <strong>Email:</strong> {business.email || "N/A"}
            </p>
            <p>
              <strong>Location:</strong> {business.city}, {business.state}
            </p>
            <p>
              <strong>Pincode:</strong> {business.pincode}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(business.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/businesses/${business.slug}`}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 sm:w-auto"
            >
              View Public Page
            </Link>

            <Link
              href={`/dashboard/businesses/${business.id}/edit`}
              className="w-full rounded-xl bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
            >
              Edit Business
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}