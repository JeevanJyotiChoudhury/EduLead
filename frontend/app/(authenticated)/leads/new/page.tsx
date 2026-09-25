"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000";

const sources = [
  "WEBSITE",
  "WALK_IN",
  "PHONE",
  "WHATSAPP",
  "FAIR",
  "CAMPAIGN",
  "OTHER",
];

const formatLabel = (value: string) =>
  value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function NewLeadPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    coursePreference: "",
    source: "WEBSITE",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create lead");
      }

      router.push(`/leads/${data.lead._id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/leads")}
            className="mb-3 text-sm text-blue-600 hover:underline"
          >
            ← Back to Leads
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Add New Lead</h1>

          <p className="mt-1 text-sm text-gray-500">
            Create a new admission lead and start tracking its lifecycle.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Student Name *
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter student name"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone *
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="student@example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Course */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Course Preference *
              </label>

              <input
                name="coursePreference"
                value={form.coursePreference}
                onChange={handleChange}
                placeholder="e.g. B.Tech Computer Science"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Source */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Lead Source *
              </label>

              <select
                name="source"
                value={form.source}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {sources.map((source) => (
                  <option key={source} value={source}>
                    {formatLabel(source)}
                  </option>
                ))}
              </select>
            </div>

            {/* Initial status */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Initial Status
              </label>

              <input
                value="New"
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-gray-500"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Notes
              </label>

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={5}
                placeholder="Add any initial information about the student..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2 md:col-span-2">
              <button
                type="button"
                onClick={() => router.push("/leads")}
                className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create Lead"}
              </button>
            </div>
          </form>
        </div>

        {/* Info */}
        <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            New leads are created with <strong>NEW</strong> status. They can be
            assigned to a counsellor and moved through the admission lifecycle
            from the lead details page.
          </p>
        </div>
      </div>
    </div>
  );
}
