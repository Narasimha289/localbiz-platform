"use client";

import { useEffect, useMemo, useState } from "react";
import BusinessCard from "@/components/business/BusinessCard";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Business = {
  id: string;
  slug: string;
  businessName: string;
  description: string;
  imageUrl: string | null;
  phone: string;
  email: string | null;
  city: string;
  state: string;
  category?: {
    name: string;
  } | null;
  reviews?: {
    rating: number;
  }[];
};

export default function BusinessFilters() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedCity, setDebouncedCity] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCity(city);
    }, 400);

    return () => clearTimeout(timer);
  }, [city]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    if (category) params.set("category", category);
    if (debouncedCity.trim()) params.set("city", debouncedCity.trim());

    return params.toString();
  }, [debouncedSearch, category, debouncedCity]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();

        if (response.ok) {
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Fetch categories failed:", error);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchBusinesses() {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/businesses${queryString ? `?${queryString}` : ""}`
        );
        const data = await response.json();

        if (response.ok) {
          setBusinesses(data.businesses || []);
        } else {
          setBusinesses([]);
        }
      } catch (error) {
        console.error("Fetch businesses failed:", error);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBusinesses();
  }, [queryString]);

  return (
    <div className="mt-8 space-y-8">
      <div className="rounded-2xl border border-gray-200 p-4 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input
            type="text"
            placeholder="Search business name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black sm:text-base"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black sm:text-base"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Filter by city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black sm:col-span-2 sm:text-base lg:col-span-1"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
          Loading businesses...
        </div>
      ) : businesses.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
          No approved businesses found.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {businesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}
    </div>
  );
}