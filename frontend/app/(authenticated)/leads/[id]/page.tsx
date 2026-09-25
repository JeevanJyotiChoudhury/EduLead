"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Lead = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  coursePreference: string;
  source: string;
  status: string;
  notes?: string;
  assignedCounsellor?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  lastContactedAt?: string | null;
  nextFollowUpDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

type Counsellor = {
  _id: string;
  name: string;
  email: string;
};

type FollowUp = {
  _id: string;
  date: string;
  notes: string;
  outcome?: string;
  nextFollowUpDate?: string | null;
  counsellor?: {
    name: string;
  };
};

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

const statuses = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "FOLLOW_UP",
  "CONVERTED",
  "NOT_INTERESTED",
];

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

const formatDate = (date?: string | null) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  const [userRole, setUserRole] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    coursePreference: "",
    source: "WEBSITE",
    status: "NEW",
    notes: "",
    nextFollowUpDate: "",
  });

  const [selectedCounsellor, setSelectedCounsellor] = useState("");

  const [followUpForm, setFollowUpForm] = useState({
    date: "",
    notes: "",
    outcome: "",
    nextFollowUpDate: "",
  });

  const fetchLead = async () => {
    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/api/leads/${leadId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch lead");
      }

      setLead(data.lead);

      setForm({
        name: data.lead.name || "",
        phone: data.lead.phone || "",
        email: data.lead.email || "",
        coursePreference: data.lead.coursePreference || "",
        source: data.lead.source || "WEBSITE",
        status: data.lead.status || "NEW",
        notes: data.lead.notes || "",
        nextFollowUpDate: data.lead.nextFollowUpDate
          ? data.lead.nextFollowUpDate.substring(0, 10)
          : "",
      });

      setSelectedCounsellor(data.lead.assignedCounsellor?._id || "");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchCounsellors = async () => {
    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/api/leads/counsellors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setCounsellors(data.counsellors || []);
      }
    } catch (error) {
      console.error("Failed to fetch counsellors", error);
    }
  };

  const fetchFollowUps = async () => {
    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/api/leads/${leadId}/followups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setFollowUps(data.followUps || []);
      }
    } catch (error) {
      console.error("Failed to fetch follow-ups", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      setUserRole(user.role || "");
    } catch {
      router.push("/login");
      return;
    }

    fetchLead();
    fetchFollowUps();
  }, [leadId]);

  useEffect(() => {
    if (userRole === "MANAGER") {
      fetchCounsellors();
    }
  }, [userRole]);

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

  const updateLead = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/api/leads/${leadId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          coursePreference: form.coursePreference,
          source: form.source,
          status: form.status,
          notes: form.notes,
          nextFollowUpDate: form.nextFollowUpDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update lead");
      }

      await fetchLead();

      alert("Lead updated successfully");
    } catch (err: any) {
      setError(err.message || "Failed to update lead");
    } finally {
      setSaving(false);
    }
  };

  const assignCounsellor = async () => {
    if (!selectedCounsellor) {
      alert("Please select a counsellor");
      return;
    }

    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/api/leads/${leadId}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          counsellorId: selectedCounsellor,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to assign counsellor");
      }

      await fetchLead();

      alert("Counsellor assigned successfully");
    } catch (err: any) {
      setError(err.message || "Failed to assign counsellor");
    }
  };

  const addFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!followUpForm.date || !followUpForm.notes) {
      alert("Follow-up date and notes are required");
      return;
    }

    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/api/leads/${leadId}/followups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: followUpForm.date,
          notes: followUpForm.notes,
          outcome: followUpForm.outcome,
          nextFollowUpDate: followUpForm.nextFollowUpDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add follow-up");
      }

      setFollowUpForm({
        date: "",
        notes: "",
        outcome: "",
        nextFollowUpDate: "",
      });

      await fetchLead();
      await fetchFollowUps();

      alert("Follow-up added successfully");
    } catch (err: any) {
      setError(err.message || "Failed to add follow-up");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading lead...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <button
          onClick={() => router.push("/leads")}
          className="text-blue-600 hover:underline"
        >
          ← Back to Leads
        </button>

        <div className="mt-8 rounded-xl bg-white p-8 shadow-sm">
          <p className="text-red-600">{error || "Lead not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              onClick={() => router.push("/leads")}
              className="mb-2 text-sm text-blue-600 hover:underline"
            >
              ← Back to Leads
            </button>

            <h1 className="text-3xl font-bold text-gray-900">{lead.name}</h1>

            <p className="mt-1 text-sm text-gray-500">
              Lead created on {formatDate(lead.createdAt)}
            </p>
          </div>

          <span className="inline-flex w-fit rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            {formatLabel(lead.status)}
          </span>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Lead Information */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                Lead Information
              </h2>

              <form onSubmit={updateLead} className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Name
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Course Preference
                  </label>

                  <input
                    name="coursePreference"
                    value={form.coursePreference}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Source
                  </label>

                  <select
                    name="source"
                    value={form.source}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
                  >
                    {sources.map((source) => (
                      <option key={source} value={source}>
                        {formatLabel(source)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {formatLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Next Follow-up Date
                  </label>

                  <input
                    type="date"
                    name="nextFollowUpDate"
                    value={form.nextFollowUpDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right column */}
          <div>
            {/* Assignment - Manager only */}
            {userRole === "MANAGER" && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-semibold text-gray-900">
                  Assignment
                </h2>

                <p className="mb-2 text-sm text-gray-500">Current Counsellor</p>

                <p className="mb-5 font-medium text-gray-900">
                  {lead.assignedCounsellor?.name || "Not assigned"}
                </p>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Assign Counsellor
                </label>

                <select
                  value={selectedCounsellor}
                  onChange={(e) => setSelectedCounsellor(e.target.value)}
                  className="mb-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
                >
                  <option value="">Select counsellor</option>

                  {counsellors.map((counsellor) => (
                    <option key={counsellor._id} value={counsellor._id}>
                      {counsellor.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={assignCounsellor}
                  className="w-full rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white hover:bg-gray-800"
                >
                  Assign
                </button>
              </div>
            )}

            {/* Summary */}
            <div
              className={`rounded-xl bg-white p-6 shadow-sm ${
                userRole === "MANAGER" ? "mt-6" : ""
              }`}
            >
              <h2 className="mb-5 text-xl font-semibold text-gray-900">
                Lead Summary
              </h2>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{lead.phone}</p>
                </div>

                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">
                    {lead.email || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Source</p>
                  <p className="font-medium text-gray-900">
                    {formatLabel(lead.source)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Counsellor</p>
                  <p className="font-medium text-gray-900">
                    {lead.assignedCounsellor?.name || "Unassigned"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Last Contacted</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(lead.lastContactedAt)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Next Follow-up</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(lead.nextFollowUpDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Follow-up */}
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Add Follow-up
          </h2>

          <form onSubmit={addFollowUp} className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Follow-up Date
              </label>

              <input
                type="date"
                value={followUpForm.date}
                onChange={(e) =>
                  setFollowUpForm({
                    ...followUpForm,
                    date: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Next Follow-up
              </label>

              <input
                type="date"
                value={followUpForm.nextFollowUpDate}
                onChange={(e) =>
                  setFollowUpForm({
                    ...followUpForm,
                    nextFollowUpDate: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Outcome
              </label>

              <input
                value={followUpForm.outcome}
                onChange={(e) =>
                  setFollowUpForm({
                    ...followUpForm,
                    outcome: e.target.value,
                  })
                }
                placeholder="Interested, callback requested..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Notes
              </label>

              <textarea
                value={followUpForm.notes}
                onChange={(e) =>
                  setFollowUpForm({
                    ...followUpForm,
                    notes: e.target.value,
                  })
                }
                rows={3}
                placeholder="Describe the interaction..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                required
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white hover:bg-green-700"
              >
                Add Follow-up
              </button>
            </div>
          </form>
        </div>

        {/* Follow-up history */}
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Follow-up History
          </h2>

          {followUps.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">
              No follow-ups recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {followUps.map((followUp) => (
                <div
                  key={followUp._id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatDate(followUp.date)}
                      </p>

                      <p className="text-sm text-gray-500">
                        By {followUp.counsellor?.name || "Unknown"}
                      </p>
                    </div>

                    {followUp.nextFollowUpDate && (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                        Next: {formatDate(followUp.nextFollowUpDate)}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm text-gray-700">{followUp.notes}</p>

                  {followUp.outcome && (
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Outcome:</span>{" "}
                      {followUp.outcome}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
