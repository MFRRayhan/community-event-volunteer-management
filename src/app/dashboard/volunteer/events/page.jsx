import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/auth";
import { getVolunteerRegistrations } from "@/actions/registration.actions";
import VolunteerRegistrationCard from "@/components/registration/VolunteerRegistrationCard";
import EmptyState from "@/components/shared/EmptyState";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { FiArrowLeft, FiPlus, FiClipboard, FiUsers } from "react-icons/fi";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Volunteer Registrations | Community Connect",
  description: "View and manage all your registered community events and shifts.",
};

export default async function VolunteerEventsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/dashboard/volunteer/events");
  }

  if (session.user.role !== "volunteer") {
    redirect("/dashboard/organizer");
  }

  const registrations = await getVolunteerRegistrations();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/dashboard/volunteer"
              className="hover:text-emerald-600 transition-colors flex items-center gap-1 font-medium"
            >
              <FiArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              My Registrations
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              <FiPlus className="w-4 h-4" /> Find More Events
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Page Title & Intro */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xl">
              <FiClipboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                My Registered Events
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Review your registrations, assigned volunteer roles, and cancel if you are no longer able to attend.
              </p>
            </div>
          </div>
        </div>

        {/* Registrations List */}
        {registrations.length === 0 ? (
          <EmptyState
            icon={<FiUsers className="w-8 h-8 text-slate-400" />}
            title="You haven't registered for any events yet"
            description="Explore upcoming community initiatives and sign up to make a difference in your neighborhood."
            actionHref="/events"
            actionLabel="Discover Community Events"
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Showing {registrations.length} total registrations (including cancelled)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registrations.map((reg) => (
                <VolunteerRegistrationCard key={reg._id} registration={reg} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
