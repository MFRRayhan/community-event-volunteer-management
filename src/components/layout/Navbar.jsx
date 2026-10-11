"use client";

import { useEffect, useRef, useState } from "react";
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
  FiUser,
  FiMail,
  FiLogOut,
  FiChevronDown,
} from "react-icons/fi";

import ThemeToggle from "@/components/theme/ThemeToggle";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef(null);

  const isOrganizer = session?.user?.role === "organizer";
  const isVolunteer = session?.user?.role === "volunteer";

  const user = session?.user;
  const userName = user?.name || "Community Member";
  const userEmail = user?.email || "No email available";
  const userImage = user?.image;
  const userRole = user?.role || "member";

  const userInitial = userName.trim().charAt(0).toUpperCase() || "U";

  const closeMobile = () => setMobileMenuOpen(false);
  const closeProfileMenu = () => setProfileMenuOpen(false);

  const handleLogout = () => {
    closeMobile();
    closeProfileMenu();
    signOut({ callbackUrl: "/login" });
  };

  // Close profile dropdown when clicking outside or pressing Escape.
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        closeProfileMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeProfileMenu();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const linkClass = (isActive) =>
    `transition-colors hover:text-emerald-600 ${
      isActive
        ? "font-semibold text-emerald-600 dark:text-emerald-400"
        : "text-slate-600 dark:text-slate-300"
    }`;

  const mobileLinkClass =
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800";

  const closeMenus = () => {
    closeMobile();
    closeProfileMenu();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            onClick={closeMenus}
            className="flex items-center gap-2 text-xl font-extrabold text-emerald-600 dark:text-emerald-400"
          >
            <FiHeart className="h-5 w-5" aria-hidden="true" />
            <span>Community Connect</span>
          </Link>

          {/* Public Desktop Navigation */}
          {!user && (
            <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
              <Link href="/" className={linkClass(pathname === "/")}>
                Home
              </Link>

              <Link
                href="/events"
                className={linkClass(pathname.startsWith("/events"))}
              >
                Events
              </Link>
            </nav>
          )}

          {/* Volunteer Desktop Navigation */}
          {isVolunteer && (
            <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
              <Link
                href="/events"
                className={linkClass(pathname.startsWith("/events"))}
              >
                Browse Events
              </Link>

              <Link
                href="/dashboard/volunteer/events"
                className={linkClass(
                  pathname === "/dashboard/volunteer/events",
                )}
              >
                My Events
              </Link>

              <Link
                href="/dashboard/volunteer"
                className={linkClass(pathname === "/dashboard/volunteer")}
              >
                Dashboard
              </Link>
            </nav>
          )}

          {/* Organizer Desktop Navigation */}
          {isOrganizer && (
            <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
              <Link
                href="/dashboard/organizer"
                className={linkClass(pathname === "/dashboard/organizer")}
              >
                Dashboard
              </Link>

              <Link
                href="/dashboard/organizer/events/create"
                className={linkClass(
                  pathname === "/dashboard/organizer/events/create",
                )}
              >
                Create Event
              </Link>

              <Link
                href="/dashboard/organizer/analytics"
                className={linkClass(
                  pathname === "/dashboard/organizer/analytics",
                )}
              >
                Analytics
              </Link>

              <Link
                href="/events"
                className={linkClass(pathname.startsWith("/events"))}
              >
                Public View
              </Link>
            </nav>
          )}
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {/* Desktop Login / Register */}
          {!user && (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-emerald-600 dark:text-slate-200"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                Register
              </Link>
            </div>
          )}

          {/* User Profile Dropdown */}
          {user && (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                aria-label="Open user profile menu"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 p-1 pr-2 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                {/* User Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {userImage ? (
                    <Image
                      src={userImage}
                      alt={`${userName}'s profile`}
                      width={48}
                      height={48}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    userInitial
                  )}
                </div>

                <FiChevronDown
                  className={`hidden h-4 w-4 text-slate-500 transition-transform sm:block ${
                    profileMenuOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {/* Dropdown Panel */}
              {profileMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-3 w-72 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
                >
                  {/* Profile Information */}
                  <div className="border-b border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-lg font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {userImage ? (
                          <Image
                            src={userImage}
                            alt={`${userName}'s profile`}
                            width={48}
                            height={48}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          userInitial
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          {userName}
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500 dark:text-slate-400">
                          <FiMail
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="truncate">{userEmail}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {userRole}
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Actions */}
                  <div className="p-2">
                    {isOrganizer && (
                      <Link
                        href="/dashboard/organizer"
                        onClick={closeProfileMenu}
                        role="menuitem"
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <FiGrid
                          className="h-4 w-4 text-emerald-600"
                          aria-hidden="true"
                        />
                        Organizer Dashboard
                      </Link>
                    )}

                    {isVolunteer && (
                      <Link
                        href="/dashboard/volunteer"
                        onClick={closeProfileMenu}
                        role="menuitem"
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <FiUser
                          className="h-4 w-4 text-emerald-600"
                          aria-hidden="true"
                        />
                        Volunteer Dashboard
                      </Link>
                    )}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      <FiLogOut className="h-4 w-4" aria-hidden="true" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="flex cursor-pointer items-center justify-center rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
          >
            {mobileMenuOpen ? (
              <FiX className="h-5 w-5" aria-hidden="true" />
            ) : (
              <FiMenu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="animate-in slide-in-from-top-2 space-y-3 border-t border-slate-200 bg-white px-4 pt-3 pb-6 duration-150 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          {/* Signed-in User Summary */}
          {user && (
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {userImage ? (
                  <img
                    src={userImage}
                    alt={`${userName}'s profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  userInitial
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {userName}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {userEmail}
                </p>
              </div>
            </div>
          )}

          <nav className="flex flex-col gap-1">
            {/* Public Mobile Links */}
            {!user && (
              <>
                <Link
                  href="/"
                  onClick={closeMobile}
                  className={mobileLinkClass}
                >
                  <FiGlobe className="h-4 w-4 text-emerald-600" />
                  Home
                </Link>

                <Link
                  href="/events"
                  onClick={closeMobile}
                  className={mobileLinkClass}
                >
                  <FiSearch className="h-4 w-4 text-emerald-600" />
                  Browse Events
                </Link>

                <div className="flex gap-2 pt-3">
                  <Link
                    href="/login"
                    onClick={closeMobile}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-200"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={closeMobile}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-700"
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
                  className={mobileLinkClass}
                >
                  <FiSearch className="h-4 w-4 text-emerald-600" />
                  Browse Events
                </Link>

                <Link
                  href="/dashboard/volunteer/events"
                  onClick={closeMobile}
                  className={mobileLinkClass}
                >
                  <FiCalendar className="h-4 w-4 text-emerald-600" />
                  My Events
                </Link>

                <Link
                  href="/dashboard/volunteer"
                  onClick={closeMobile}
                  className={mobileLinkClass}
                >
                  <FiUsers className="h-4 w-4 text-emerald-600" />
                  Volunteer Dashboard
                </Link>
              </>
            )}

            {/* Organizer Mobile Links */}
            {isOrganizer && (
              <>
                <Link
                  href="/dashboard/organizer"
                  onClick={closeMobile}
                  className={mobileLinkClass}
                >
                  <FiGrid className="h-4 w-4 text-emerald-600" />
                  Dashboard & Manage Events
                </Link>

                <Link
                  href="/dashboard/organizer/events/create"
                  onClick={closeMobile}
                  className={mobileLinkClass}
                >
                  <FiPlusCircle className="h-4 w-4 text-emerald-600" />
                  Create Event
                </Link>

                <Link
                  href="/dashboard/organizer/analytics"
                  onClick={closeMobile}
                  className={mobileLinkClass}
                >
                  <FiBarChart2 className="h-4 w-4 text-emerald-600" />
                  Analytics
                </Link>

                <Link
                  href="/events"
                  onClick={closeMobile}
                  className={mobileLinkClass}
                >
                  <FiGlobe className="h-4 w-4 text-emerald-600" />
                  Public Events Page
                </Link>
              </>
            )}

            {/* Mobile Logout */}
            {user && (
              <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/70"
                >
                  <FiLogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
