"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Lead = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  coursePreference: string;
  source: string;
  status: string;
  assignedCounsellor?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  nextFollowUpDate?: string | null;
  createdAt: string;
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

const getStatusClass = (status: string) => {
  switch (status) {
    case "NEW":
      return "bg-blue-100 text-blue-700";

    case "CONTACTED":
      return "bg-purple-100 text-purple-700";

    case "INTERESTED":
      return "bg-yellow-100 text-yellow-700";

    case "FOLLOW_UP":
      return "bg-orange-100 text-orange-700";

    case "CONVERTED":
      return "bg-green-100 text-green-700";

    case "NOT_INTERESTED":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function LeadsPage() {
  const router = useRouter();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");

  const [userRole, setUserRole] = useState("");

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const query = new URLSearchParams();

      if (search) {
        query.append("search", search);
      }

      if (status) {
        query.append("status", status);
      }

      if (source) {
        query.append("source", source);
      }

      const response = await fetch(`${API_URL}/api/leads?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error("Failed to fetch leads", error);
    } finally {
      setLoading(false);
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

    fetchLeads();
  }, []);

  const handleDelete = async (leadId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lead?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/leads/${leadId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete lead");
        return;
      }

      setLeads((currentLeads) =>
        currentLeads.filter((lead) => lead._id !== leadId),
      );
    } catch (error) {
      alert("Failed to delete lead");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setSource("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leads</h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage and track admission leads.
            </p>
          </div>

          <button
            onClick={() => router.push("/leads/new")}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            + Add New Lead
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Search
              </label>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    fetchLeads();
                  }
                }}
                placeholder="Name, phone or email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
              >
                <option value="">All statuses</option>

                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {formatLabel(item)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Source
              </label>

              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
              >
                <option value="">All sources</option>

                {sources.map((item) => (
                  <option key={item} value={item}>
                    {formatLabel(item)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={fetchLeads}
                className="rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white hover:bg-gray-800"
              >
                Search
              </button>

              <button
                onClick={clearFilters}
                className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <p className="text-sm text-gray-500">
              {leads.length} lead
              {leads.length !== 1 ? "s" : ""}
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading leads...
            </div>
          ) : leads.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium text-gray-900">No leads found</p>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your filters or create a new lead.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Lead
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Course
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Source
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Counsellor
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Follow-up
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {lead.name}
                          </p>

                          <p className="text-sm text-gray-500">{lead.phone}</p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {lead.coursePreference}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {formatLabel(lead.source)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            lead.status,
                          )}`}
                        >
                          {formatLabel(lead.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {lead.assignedCounsellor?.name || "Unassigned"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {formatDate(lead.nextFollowUpDate)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => router.push(`/leads/${lead._id}`)}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            View
                          </button>

                          {userRole === "MANAGER" && (
                            <button
                              onClick={() => handleDelete(lead._id)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
