"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type BusinessData = {
  id: string;
  businessName: string;
  description: string;
  categoryId: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  imageUrl: string;
  openingTime: string;
  closingTime: string;
};

type EditBusinessFormProps = {
  businessId: string;
};

export default function EditBusinessForm({
  businessId,
}: EditBusinessFormProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [saving, setSaving] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState<BusinessData>({
    id: "",
    businessName: "",
    description: "",
    categoryId: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    imageUrl: "",
    openingTime: "09:00",
    closingTime: "20:00",
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();

        if (response.ok) {
          setCategories(data.categories || []);
        } else {
          setError(data.message || "Failed to load categories");
        }
      } catch (err) {
        console.error("Fetch categories failed:", err);
        setError("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    }

    async function fetchBusiness() {
      try {
        const response = await fetch(`/api/owner/businesses/${businessId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load business");
          return;
        }

        const business = data.business;

        setForm({
          id: business.id,
          businessName: business.businessName || "",
          description: business.description || "",
          categoryId: business.categoryId || "",
          phone: business.phone || "",
          email: business.email || "",
          address: business.address || "",
          city: business.city || "",
          state: business.state || "",
          pincode: business.pincode || "",
          imageUrl: business.imageUrl || "",
          openingTime: business.openingTime || "09:00",
          closingTime: business.closingTime || "20:00",
        });

        setImageUrl(business.imageUrl || "");
      } catch (err) {
        console.error("Fetch business failed:", err);
        setError("Failed to load business");
      } finally {
        setLoadingBusiness(false);
      }
    }

    fetchCategories();
    fetchBusiness();
  }, [businessId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let uploadedImageUrl = form.imageUrl || imageUrl || "";

      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          setError(uploadData.message || "Image upload failed");
          return;
        }

        uploadedImageUrl = uploadData.url;
        setImageUrl(uploadedImageUrl);
      }

      const response = await fetch(`/api/owner/businesses/${businessId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName: form.businessName,
          description: form.description,
          categoryId: form.categoryId,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          imageUrl: uploadedImageUrl,
          openingTime: form.openingTime,
          closingTime: form.closingTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update business");
        return;
      }

      setSuccess("Business updated successfully");

      setForm((prev) => ({
        ...prev,
        imageUrl: uploadedImageUrl,
      }));

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1200);
    } catch (err) {
      console.error("Update business failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingBusiness) {
    return (
      <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
        Loading business details...
      </div>
    );
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

      <div>
        <label className="mb-2 block text-sm font-medium">Business Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setImageFile(e.target.files[0]);
            }
          }}
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
        />
      </div>

      {imageUrl ? (
        <div>
          <p className="mb-2 text-sm font-medium">Current Image</p>
          <img
            src={imageUrl}
            alt="Business preview"
            className="h-40 w-full rounded-xl object-cover border border-gray-200"
          />
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-green-600">{success}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving changes..." : "Save Changes"}
      </button>
    </form>
  );
}