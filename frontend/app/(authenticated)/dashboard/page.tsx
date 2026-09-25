"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
  updatedAt: string;
};

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const statusLabels: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  FOLLOW_UP: "Follow Up",
  CONVERTED: "Converted",
  NOT_INTERESTED: "Not Interested",
};

const sourceLabels: Record<string, string> = {
  WEBSITE: "Website",
  WALK_IN: "Walk-in",
  PHONE: "Phone",
  WHATSAPP: "WhatsApp",
  FAIR: "Fair",
  CAMPAIGN: "Campaign",
  OTHER: "Other",
};

function formatStatus(status: string) {
  return statusLabels[status] || status;
}

function formatSource(source: string) {
  return sourceLabels[source] || source;
}

function isOverdue(date?: string | null) {
  if (!date) return false;

  return new Date(date).getTime() < new Date().getTime();
}

function getAgeInDays(createdAt: string) {
  const created = new Date(createdAt).getTime();
  const now = new Date().getTime();

  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
}

function getAgeBucket(age: number) {
  if (age <= 3) return "0-3";
  if (age <= 7) return "4-7";
  if (age <= 15) return "8-15";
  return "15+";
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const response = await fetch(`${API_URL}/leads`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch leads");
        }

        setLeads(data.leads || data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const stats = useMemo(() => {
    const total = leads.length;

    const newLeads = leads.filter((lead) => lead.status === "NEW").length;

    const followUps = leads.filter(
      (lead) => lead.status === "FOLLOW_UP",
    ).length;

    const converted = leads.filter(
      (lead) => lead.status === "CONVERTED",
    ).length;

    const notInterested = leads.filter(
      (lead) => lead.status === "NOT_INTERESTED",
    ).length;

    const overdue = leads.filter(
      (lead) =>
        lead.nextFollowUpDate &&
        isOverdue(lead.nextFollowUpDate) &&
        lead.status !== "CONVERTED" &&
        lead.status !== "NOT_INTERESTED",
    ).length;

    const conversionRate =
      total > 0 ? ((converted / total) * 100).toFixed(1) : "0.0";

    return {
      total,
      newLeads,
      followUps,
      converted,
      notInterested,
      overdue,
      conversionRate,
    };
  }, [leads]);

  const statusCounts = useMemo(() => {
    const statuses = [
      "NEW",
      "CONTACTED",
      "INTERESTED",
      "FOLLOW_UP",
      "CONVERTED",
      "NOT_INTERESTED",
    ];

    return statuses.map((status) => ({
      status,
      count: leads.filter((lead) => lead.status === status).length,
    }));
  }, [leads]);

  const sourceCounts = useMemo(() => {
    const sources = [
      "WEBSITE",
      "WALK_IN",
      "PHONE",
      "WHATSAPP",
      "FAIR",
      "CAMPAIGN",
      "OTHER",
    ];

    return sources.map((source) => ({
      source,
      count: leads.filter((lead) => lead.source === source).length,
    }));
  }, [leads]);

  const ageingCounts = useMemo(() => {
    const buckets = {
      "0-3": 0,
      "4-7": 0,
      "8-15": 0,
      "15+": 0,
    };

    leads.forEach((lead) => {
      const bucket = getAgeBucket(getAgeInDays(lead.createdAt));

      if (bucket in buckets) {
        buckets[bucket as keyof typeof buckets]++;
      }
    });

    return buckets;
  }, [leads]);

  const recentLeads = useMemo(() => {
    return [...leads]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [leads]);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-sm text-slate-500">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-700">
            Failed to load dashboard
          </h2>

          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview of admission leads and follow-ups
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/leads"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View Leads
          </Link>

          <Link
            href="/leads/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add Lead
          </Link>
        </div>
      </div>

      {/* Main Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Leads" value={stats.total} />

        <StatCard title="New" value={stats.newLeads} />

        <StatCard title="Follow-ups" value={stats.followUps} />

        <StatCard title="Converted" value={stats.converted} />

        <StatCard
          title="Overdue"
          value={stats.overdue}
          danger={stats.overdue > 0}
        />

        <StatCard title="Conversion Rate" value={`${stats.conversionRate}%`} />
      </div>

      {/* Status + Source */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Leads by Status */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Leads by Status
          </h2>

          <div className="mt-5 space-y-4">
            {statusCounts.map((item) => {
              const percentage =
                stats.total > 0 ? (item.count / stats.total) * 100 : 0;

              return (
                <div key={item.status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      {formatStatus(item.status)}
                    </span>

                    <span className="font-semibold text-slate-900">
                      {item.count}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Leads by Source */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Leads by Source
          </h2>

          <div className="mt-5 space-y-4">
            {sourceCounts.map((item) => {
              const percentage =
                stats.total > 0 ? (item.count / stats.total) * 100 : 0;

              return (
                <div key={item.source}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      {formatSource(item.source)}
                    </span>

                    <span className="font-semibold text-slate-900">
                      {item.count}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Ageing + Follow-up Overview */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Ageing */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Lead Ageing</h2>

          <p className="mt-1 text-sm text-slate-500">
            How long leads have been in the system
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <AgeingCard label="0-3 Days" value={ageingCounts["0-3"]} />

            <AgeingCard label="4-7 Days" value={ageingCounts["4-7"]} />

            <AgeingCard label="8-15 Days" value={ageingCounts["8-15"]} />

            <AgeingCard label="15+ Days" value={ageingCounts["15+"]} />
          </div>
        </section>

        {/* Follow-up Overview */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Follow-up Overview
          </h2>

          <div className="mt-5 space-y-4">
            <OverviewRow label="Pending Follow-ups" value={stats.followUps} />

            <OverviewRow
              label="Overdue Follow-ups"
              value={stats.overdue}
              danger={stats.overdue > 0}
            />

            <OverviewRow label="Converted Leads" value={stats.converted} />

            <OverviewRow label="Not Interested" value={stats.notInterested} />
          </div>
        </section>
      </div>

      {/* Recent Leads */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Leads
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest admission enquiries
            </p>
          </div>

          <Link
            href="/leads"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            No leads available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3 font-medium">Lead</th>

                  <th className="px-6 py-3 font-medium">Course</th>

                  <th className="px-6 py-3 font-medium">Source</th>

                  <th className="px-6 py-3 font-medium">Status</th>

                  <th className="px-6 py-3 font-medium">Follow-up</th>

                  <th className="px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {recentLeads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {lead.name}
                        </p>

                        <p className="text-xs text-slate-500">{lead.phone}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {lead.coursePreference}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatSource(lead.source)}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={lead.status} />
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {lead.nextFollowUpDate ? (
                        <span
                          className={
                            isOverdue(lead.nextFollowUpDate) &&
                            lead.status !== "CONVERTED" &&
                            lead.status !== "NOT_INTERESTED"
                              ? "font-medium text-red-600"
                              : "text-slate-600"
                          }
                        >
                          {new Date(lead.nextFollowUpDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        href={`/leads/${lead._id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  danger = false,
}: {
  title: string;
  value: string | number;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>

      <p
        className={`mt-2 text-2xl font-bold ${
          danger ? "text-red-600" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function AgeingCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function OverviewRow({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-600">{label}</span>

      <span
        className={`text-lg font-semibold ${
          danger ? "text-red-600" : "text-slate-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    NEW: "bg-blue-50 text-blue-700",
    CONTACTED: "bg-slate-100 text-slate-700",
    INTERESTED: "bg-purple-50 text-purple-700",
    FOLLOW_UP: "bg-amber-50 text-amber-700",
    CONVERTED: "bg-green-50 text-green-700",
    NOT_INTERESTED: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}
