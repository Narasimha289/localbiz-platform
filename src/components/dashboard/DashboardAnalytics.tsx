"use client";

import { useEffect, useState } from "react";

type AnalyticsData = Record<string, number>;

function formatLabel(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

function formatValue(key: string, value: number) {
  if (key === "totalRevenue") {
    return `₹${value}`;
  }

  return value;
}

export default function DashboardAnalytics() {
  const [role, setRole] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch("/api/dashboard/analytics");
        const data = await response.json();

        if (response.ok) {
          setRole(data.role);
          setAnalytics(data.analytics);
        }
      } catch (error) {
        console.error("Fetch analytics failed:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
        Loading analytics...
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {role === "ADMIN" ? "Admin Analytics" : "Owner Analytics"}
        </h2>
        <p className="mt-2 text-gray-600">
          Overview of your platform activity and business metrics.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(analytics).map(([key, value]) => (
          <div
            key={key}
            className="rounded-2xl border border-gray-200 p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">
              {formatLabel(key)}
            </p>
            <p className="mt-2 text-3xl font-bold">
              {formatValue(key, value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}