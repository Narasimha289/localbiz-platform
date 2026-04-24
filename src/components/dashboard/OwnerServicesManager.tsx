"use client";

import { useEffect, useState } from "react";

type Business = {
  id: string;
  businessName: string;
};

type Service = {
  id: string;
  name: string;
  price: number | string;
  duration: number | null;
};

export default function OwnerServicesManager() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    duration: "30",
  });

  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const response = await fetch("/api/owner/businesses");
        const data = await response.json();

        if (response.ok) {
          const ownerBusinesses = data.businesses || [];
          setBusinesses(ownerBusinesses);

          if (ownerBusinesses.length > 0) {
            setSelectedBusinessId(ownerBusinesses[0].id);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingBusinesses(false);
      }
    }

    fetchBusinesses();
  }, []);

  async function fetchServices() {
    if (!selectedBusinessId) return;

    setLoadingServices(true);

    try {
      const response = await fetch(
        `/api/owner/services?businessId=${selectedBusinessId}`
      );
      const data = await response.json();

      if (response.ok) {
        setServices(data.services || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingServices(false);
    }
  }

  useEffect(() => {
    fetchServices();
  }, [selectedBusinessId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedBusinessId) {
      setMessage("Select a business first");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/owner/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: selectedBusinessId,
          ...form,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setServices((prev) => [data.service, ...prev]);
      setForm({ name: "", price: "", duration: "30" });
      setMessage("Service added");
    } catch {
      setMessage("Error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleEditService() {
    if (!editingServiceId) return;

    try {
      setActionLoading(editingServiceId);

      await fetch(`/api/owner/services/${editingServiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          duration: Number(form.duration),
        }),
      });

      setEditingServiceId(null);
      setForm({ name: "", price: "", duration: "30" });
      fetchServices();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteService(id: string) {
    if (!confirm("Delete this service?")) return;

    try {
      setActionLoading(id);

      await fetch(`/api/owner/services/${id}`, {
        method: "DELETE",
      });

      fetchServices();
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="rounded-2xl border p-4 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold sm:text-2xl">Manage Services</h2>

      {/* Select Business */}
      <div className="mt-5">
        <select
          value={selectedBusinessId}
          onChange={(e) => setSelectedBusinessId(e.target.value)}
          className="w-full rounded-xl border px-4 py-3"
        >
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.businessName}
            </option>
          ))}
        </select>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          editingServiceId ? handleEditService() : handleSubmit(e);
        }}
        className="mt-6 space-y-4"
      >
        <input
          placeholder="Service name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-xl border px-4 py-3"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full rounded-xl border px-4 py-3"
          />
          <input
            placeholder="Duration"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button className="w-full sm:w-auto rounded-xl bg-black px-5 py-3 text-white">
            {editingServiceId ? "Update" : "Add Service"}
          </button>

          {editingServiceId && (
            <button
              type="button"
              onClick={() => setEditingServiceId(null)}
              className="w-full sm:w-auto rounded-xl border px-5 py-3"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Services */}
      <div className="mt-8 space-y-4">
        {services.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border p-4 flex flex-col gap-3 sm:flex-row sm:justify-between"
          >
            <div>
              <h4 className="font-semibold">{s.name}</h4>
              <p className="text-sm text-gray-600">
                ₹{s.price} • {s.duration} mins
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => {
                  setEditingServiceId(s.id);
                  setForm({
                    name: s.name,
                    price: String(s.price),
                    duration: String(s.duration || 30),
                  });
                }}
                className="w-full sm:w-auto rounded-xl border px-4 py-2 text-sm"
              >
                Edit
              </button>

              <button
                onClick={() => handleDeleteService(s.id)}
                className="w-full sm:w-auto rounded-xl bg-red-600 px-4 py-2 text-sm text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}