"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  FiHeart,
  FiMenu,
  FiX,
  FiSearch,
  FiCalendar,
  FiUsers,
  FiGrid,
  FiPlusCircle,
  FiBarChart2,
  FiGlobe,
} from "react-icons/fi";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isOrganizer = session?.user?.role === "organizer";
  const isVolunteer = session?.user?.role === "volunteer";

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            onClick={closeMobile}
            className="flex items-center gap-2 font-extrabold text-xl text-emerald-600 dark:text-emerald-400"
          >
            <FiHeart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>Community Connect</span>
          </Link>

          {/* Desktop Nav - Public */}
          {!session?.user && (
            <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
              <Link
                href="/"
                className={`transition-colors hover:text-emerald-600 ${
                  pathname === "/" ? "text-emerald-600 font-semibold" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                Home
              </Link>
              <Link
                href="/events"
                className={`transition-colors hover:text-emerald-600 ${
                  pathname.startsWith("/events") ? "text-emerald-600 font-semibold" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                Events
              </Link>
            </nav>
          )}

          {/* Desktop Nav - Volunteer */}
          {isVolunteer && (
            <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
              <Link
                href="/events"
                className={`transition-colors hover:text-emerald-600 ${
                  pathname.startsWith("/events") ? "text-emerald-600 font-semibold" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                Browse Events
              </Link>
              <Link
                href="/dashboard/volunteer/events"
                className={`transition-colors hover:text-emerald-600 ${
                  pathname === "/dashboard/volunteer/events" ? "text-emerald-600 font-semibold" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                My Events
              </Link>
              <Link
                href="/dashboard/volunteer"
                className={`transition-colors hover:text-emerald-600 ${
                  pathname === "/dashboard/volunteer" ? "text-emerald-600 font-semibold" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                Dashboard
              </Link>
            </nav>
          )}

          {/* Desktop Nav - Organizer */}
          {isOrganizer && (
            <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
              <Link
                href="/dashboard/organizer"
                className={`transition-colors hover:text-emerald-600 ${
                  pathname === "/dashboard/organizer" ? "text-emerald-600 font-semibold" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/organizer/events/create"
                className={`transition-colors hover:text-emerald-600 ${
                  pathname === "/dashboard/organizer/events/create" ? "text-emerald-600 font-semibold" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                Create Event
              </Link>
              <Link
                href="/dashboard/organizer/analytics"
                className={`transition-colors hover:text-emerald-600 ${
                  pathname === "/dashboard/organizer/analytics" ? "text-emerald-600 font-semibold" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                Analytics
              </Link>
              <Link
                href="/events"
                className={`transition-colors hover:text-emerald-600 ${
                  pathname.startsWith("/events") ? "text-emerald-600 font-semibold" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                Public View
              </Link>
            </nav>
          )}
        </div>

        {/* Right side controls: Theme toggle, Auth / Profile, Mobile burger */}
        <div className="flex items-center gap-2.5">
          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Desktop Auth */}
          {session?.user ? (
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-xs px-2 py-0.5 rounded-full uppercase font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {session.user.role}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900 cursor-pointer font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center"
          >
            {mobileMenuOpen ? (
              <FiX className="w-5 h-5" aria-hidden="true" />
            ) : (
              <FiMenu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
          {session?.user && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="text-xs">
                <span className="text-slate-500">Signed in as </span>
                <strong className="text-slate-900 dark:text-white">{session.user.name}</strong>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                {session.user.role}
              </span>
            </div>
          )}

          <nav className="flex flex-col space-y-2 text-sm font-medium">
            {/* Public Mobile Links */}
            {!session?.user && (
              <>
                <Link
                  href="/"
                  onClick={closeMobile}
                  className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  Home
                </Link>
                <Link
                  href="/events"
                  onClick={closeMobile}
                  className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  Events
                </Link>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={closeMobile}
                    className="w-full text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobile}
                    className="w-full text-center py-2.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-xs"
                  >
                    Register
                  </Link>
                </div>
              </>
            )}

            {/* Volunteer Mobile Links */}
            {isVolunteer && (
              <>
                <Link
                  href="/events"
                  onClick={closeMobile}
                  className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-2"
                >
                  <FiSearch className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>Browse Events</span>
                </Link>
                <Link
                  href="/dashboard/volunteer/events"
                  onClick={closeMobile}
                  className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-2"
                >
                  <FiCalendar className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>My Events</span>
                </Link>
                <Link
                  href="/dashboard/volunteer"
                  onClick={closeMobile}
                  className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-2"
                >
                  <FiUsers className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>Volunteer Dashboard</span>
                </Link>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      closeMobile();
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}

            {/* Organizer Mobile Links */}
            {isOrganizer && (
              <>
                <Link
                  href="/dashboard/organizer"
                  onClick={closeMobile}
                  className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-2"
                >
                  <FiGrid className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>Dashboard & Manage Events</span>
                </Link>
                <Link
                  href="/dashboard/organizer/events/create"
                  onClick={closeMobile}
                  className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-2"
                >
                  <FiPlusCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>Create Event</span>
                </Link>
                <Link
                  href="/dashboard/organizer/analytics"
                  onClick={closeMobile}
                  className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-2"
                >
                  <FiBarChart2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>Analytics</span>
                </Link>
                <Link
                  href="/events"
                  onClick={closeMobile}
                  className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-2"
                >
                  <FiGlobe className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>Public Events Page</span>
                </Link>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      closeMobile();
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
