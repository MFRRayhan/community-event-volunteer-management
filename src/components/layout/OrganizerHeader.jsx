"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { FiHeart, FiBarChart2, FiPlusCircle } from "react-icons/fi";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function OrganizerHeader({ user }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link href="/" className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
            <FiHeart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>Community Connect</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Role: Organizer
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Organizer Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Welcome back, <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span> ({user?.email})
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <Link
          href="/dashboard/organizer/analytics"
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-semibold text-xs sm:text-sm rounded-xl border border-purple-200 dark:border-purple-800 transition-colors"
        >
          <FiBarChart2 className="w-4 h-4" aria-hidden="true" />
          <span>Analytics</span>
        </Link>
        <Link
          href="/dashboard/organizer/events/create"
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
        >
          <FiPlusCircle className="w-4 h-4" aria-hidden="true" />
          <span>Create Event</span>
        </Link>
        <ThemeToggle />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="px-3.5 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl transition-colors cursor-pointer"
          title="Sign out of your account"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
