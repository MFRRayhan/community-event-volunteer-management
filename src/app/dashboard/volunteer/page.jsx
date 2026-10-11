import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/auth";
import { getVolunteerRegistrations } from "@/actions/registration.actions";
import VolunteerHeader from "@/components/layout/VolunteerHeader";
import StatCard from "@/components/ui/StatCard";
import VolunteerRegistrationCard from "@/components/registration/VolunteerRegistrationCard";
import EmptyState from "@/components/shared/EmptyState";
import {
  FiClipboard,
  FiClock,
  FiAward,
  FiCalendar,
  FiUsers,
  FiArchive,
} from "react-icons/fi";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Volunteer Dashboard | Community Connect",
  description: "Track your community volunteer commitments, upcoming shifts, and registered events.",
};

export default async function VolunteerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/dashboard/volunteer");
  }

  // Security enforcement: Organizers cannot access volunteer dashboard
  if (session.user.role !== "volunteer") {
    redirect("/dashboard/organizer");
  }

  // Fetch all registrations for this volunteer
  const registrations = await getVolunteerRegistrations();

  const now = new Date();

  // Calculate statistics
  const totalRegistered = registrations.length;

  const upcomingRegistrations = registrations.filter((r) => {
    if (r.status === "cancelled") return false;
    if (!r.event?.eventDate) return true;
    return new Date(r.event.eventDate) >= now;
  });

  const completedRegistrations = registrations.filter((r) => {
    if (r.status === "attended") return true;
    if (r.status === "cancelled") return false;
    if (!r.event?.eventDate) return false;
    return new Date(r.event.eventDate) < now;
  });

  const pastOrCancelledRegistrations = registrations.filter(
    (r) => !upcomingRegistrations.some((u) => u._id === r._id)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <VolunteerHeader user={session.user} />

        {/* 3 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Registered Events"
            value={totalRegistered}
            icon={<FiClipboard className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Upcoming Events"
            value={upcomingRegistrations.length}
            icon={<FiClock className="w-6 h-6" />}
            color="emerald"
          />
          <StatCard
            title="Completed Events"
            value={completedRegistrations.length}
            icon={<FiAward className="w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Section 1: Upcoming Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiCalendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Upcoming Volunteer Shifts</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active initiatives scheduled for the coming days and weeks.
              </p>
            </div>
            {upcomingRegistrations.length > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {upcomingRegistrations.length} scheduled
              </span>
            )}
          </div>

          {upcomingRegistrations.length === 0 ? (
            <EmptyState
              icon={<FiUsers className="w-8 h-8 text-slate-400" />}
              title="No upcoming volunteer events"
              description="You don't have any upcoming shifts scheduled. Discover published community initiatives and register now!"
              actionHref="/events"
              actionLabel="Explore Community Events"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingRegistrations.map((reg) => (
                <VolunteerRegistrationCard key={reg._id} registration={reg} />
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Past / Other Events */}
        {pastOrCancelledRegistrations.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiArchive className="w-5 h-5 text-slate-500" />
                  <span>Past & Cancelled Registrations</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Archived records of completed, attended, or cancelled initiatives.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {pastOrCancelledRegistrations.length} recorded
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastOrCancelledRegistrations.map((reg) => (
                <VolunteerRegistrationCard key={reg._id} registration={reg} />
              ))}
            </div>
          </div>
        )}

        {/* Quick Explore Banner if few registrations */}
        {totalRegistered > 0 && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="text-lg font-bold">Want to give more to your community?</h3>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                Explore upcoming cleanups, food distribution drives, workshops, and youth mentoring.
              </p>
            </div>
            <Link
              href="/events"
              className="px-5 py-2.5 rounded-xl bg-white text-emerald-700 font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-colors whitespace-nowrap self-start sm:self-auto shadow-xs"
            >
              Browse All Events &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
