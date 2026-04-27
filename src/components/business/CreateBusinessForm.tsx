"use client";

import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function CreateBusinessForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    businessName: "",
    description: "",
    categoryId: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    openingTime: "09:00",
    closingTime: "20:00",
    image: null as File | null,
  });

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
      } finally {
        setLoadingCategories(false);
      }
    }

    fetchCategories();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      formData.append("businessName", form.businessName);
      formData.append("description", form.description);
      formData.append("categoryId", form.categoryId);
      formData.append("phone", form.phone);
      formData.append("email", form.email);
      formData.append("address", form.address);
      formData.append("city", form.city);
      formData.append("state", form.state);
      formData.append("pincode", form.pincode);
      formData.append("openingTime", form.openingTime);
      formData.append("closingTime", form.closingTime);

      if (form.image) {
        formData.append("image", form.image);
      }

      const response = await fetch("/api/businesses", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create business");
        return;
      }

      setSuccess(
        data.message || "Business created successfully and submitted for approval."
      );

      setForm({
        businessName: "",
        description: "",
        categoryId: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        openingTime: "09:00",
        closingTime: "20:00",
        image: null,
      });

      const imageInput = document.getElementById(
        "business-image"
      ) as HTMLInputElement | null;

      if (imageInput) {
        imageInput.value = "";
      }
    } catch (error) {
      console.error("Create business error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-gray-200 p-6 shadow-sm"
    >
      <div>
        <label className="mb-2 block text-sm font-medium">Business Name</label>
        <input
          type="text"
          value={form.businessName}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, businessName: e.target.value }))
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          placeholder="Enter business name"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Description</label>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          className="min-h-28 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          placeholder="Describe your business"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Business Image</label>
        <input
          id="business-image"
          type="file"
          accept="image/*"
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              image: e.target.files?.[0] || null,
            }))
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
        />
        <p className="mt-1 text-xs text-gray-500">
          Upload a clear image for your business listing.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Category</label>
        <select
          value={form.categoryId}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, categoryId: e.target.value }))
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          required
          disabled={loadingCategories}
        >
          <option value="">
            {loadingCategories ? "Loading categories..." : "Select category"}
          </option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Phone</label>
        <input
          type="text"
          value={form.phone}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, phone: e.target.value }))
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          placeholder="Enter business phone"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Business Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, email: e.target.value }))
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          placeholder="Enter business email"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Address</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, address: e.target.value }))
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          placeholder="Enter address"
          required
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Opening Time</label>
          <input
            type="time"
            value={form.openingTime}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, openingTime: e.target.value }))
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Closing Time</label>
          <input
            type="time"
            value={form.closingTime}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, closingTime: e.target.value }))
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            required
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium">City</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, city: e.target.value }))
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="City"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">State</label>
          <input
            type="text"
            value={form.state}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, state: e.target.value }))
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="State"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Pincode</label>
          <input
            type="text"
            value={form.pincode}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, pincode: e.target.value }))
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="Pincode"
            required
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-green-600">{success}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating business..." : "Create Business"}
      </button>
    </form>
  );
}