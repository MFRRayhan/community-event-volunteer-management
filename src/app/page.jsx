"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FiHeart,
  FiSearch,
  FiUsers,
  FiCpu,
  FiArrowRight,
} from "react-icons/fi";

import Navbar from "@/components/layout/Navbar";

export default function Home() {
  const { data: session, status } = useSession();

  const isLoggedIn = status === "authenticated";
  const isOrganizer = session?.user?.role === "organizer";
  const isVolunteer = session?.user?.role === "volunteer";

  const dashboardHref = isOrganizer
    ? "/dashboard/organizer"
    : isVolunteer
      ? "/dashboard/volunteer"
      : "/events";

  const dashboardLabel = isOrganizer
    ? "Organizer Dashboard"
    : isVolunteer
      ? "Volunteer Dashboard"
      : "Explore Dashboard";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 transition-colors dark:bg-slate-950">
      <Navbar />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center space-y-12 px-4 py-16 text-center sm:py-24">
        {/* Hero Header */}
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-xs dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 sm:text-sm">
            <FiHeart
              className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <span>Built for Purpose-Driven Communities</span>
          </div>

          <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            Empowering Communities Through{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
              Meaningful Volunteering
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
            Discover local social initiatives, secure volunteer shifts tailored
            to your skills, and empower organizers with AI tools and real-time
            attendance analytics.
          </p>

          {/* Hero CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link
              href="/events"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md sm:text-base"
            >
              <span>Explore Initiatives</span>
              <FiArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            {status === "loading" ? (
              <div
                className="h-12 w-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
                aria-label="Loading authentication status"
                role="status"
              />
            ) : isLoggedIn ? (
              <Link
                href={dashboardHref}
                className="rounded-xl border border-emerald-300 bg-emerald-50 px-6 py-3.5 text-sm font-semibold text-emerald-700 shadow-xs transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 sm:text-base"
              >
                {dashboardLabel}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/50 sm:text-base"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl border border-emerald-300 bg-emerald-50 px-6 py-3.5 text-sm font-semibold text-emerald-700 shadow-xs transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 sm:text-base"
                >
                  Join Platform
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid w-full grid-cols-1 gap-6 pt-6 text-left md:grid-cols-3">
          {/* Feature 1 */}
          <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60">
              <FiSearch
                className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Explore & Filter
            </h3>

            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
              Find initiatives across Environment, Health, Education, and Crisis
              Relief with live capacity meters.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60">
              <FiUsers
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
                aria-hidden="true"
              />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Skill-Based Registration
            </h3>

            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
              Volunteers register by selecting specific skills and track past
              and upcoming commitments seamlessly.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/60">
              <FiCpu
                className="h-5 w-5 text-purple-600 dark:text-purple-400"
                aria-hidden="true"
              />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AI Event Assistant & Analytics
            </h3>

            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
              Draft comprehensive event details with AI assistance and track
              volunteer turnout with Recharts.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <p>
          &copy; {new Date().getFullYear()} Community Connect. Built with
          Next.js, MongoDB & Tailwind CSS.
        </p>
      </footer>
    </div>
  );
}
