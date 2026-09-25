"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "MANAGER" | "COUNSELLOR";
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/login");
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/dashboard" className="text-2xl font-bold text-slate-900">
          Edu<span className="text-blue-600">Lead</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-2 md:flex">
          <Link
            href="/dashboard"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              isActive("/dashboard")
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/leads"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              isActive("/leads")
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            Leads
          </Link>

          <Link
            href="/leads/new"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              pathname === "/leads/new"
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            Add Lead
          </Link>
        </nav>

        {/* User Information */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {user.name}
              </p>

              <p className="text-xs text-slate-500">
                {user.role === "MANAGER" ? "Manager" : "Counsellor"}
              </p>
            </div>
          )}

          {/* User Avatar */}
          {user && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {user.name
                .split(" ")
                .map((part) => part.charAt(0))
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="border-t border-slate-100 px-6 py-2 md:hidden">
        <nav className="flex gap-2 overflow-x-auto">
          <Link
            href="/dashboard"
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
              isActive("/dashboard")
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600"
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/leads"
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
              isActive("/leads") ? "bg-blue-50 text-blue-600" : "text-slate-600"
            }`}
          >
            Leads
          </Link>

          <Link
            href="/leads/new"
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
              pathname === "/leads/new"
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600"
            }`}
          >
            Add Lead
          </Link>
        </nav>
      </div>
    </header>
  );
}
