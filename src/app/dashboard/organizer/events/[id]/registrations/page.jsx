import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/auth";
import { getEventRegistrations } from "@/actions/registration.actions";
import OrganizerVolunteerTable from "@/components/events/OrganizerVolunteerTable";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Volunteer Registrations | Organizer Dashboard",
  description: "View and manage volunteer shifts, attendance, and confirmation status.",
};

export default async function OrganizerEventRegistrationsPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/dashboard/organizer");
  }

  // Security check: Only organizers can access this page
  if (session.user.role !== "organizer") {
    redirect("/dashboard/volunteer");
  }

  const { id } = await params;
  const { event, registrations } = await getEventRegistrations(id);

  if (!event) {
    notFound();
  }

  const activeVolunteersCount = registrations.filter(
    (r) => r.status === "registered" || r.status === "confirmed"
  ).length;

  const attendedCount = registrations.filter((r) => r.status === "attended").length;
  const cancelledCount = registrations.filter((r) => r.status === "cancelled").length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/dashboard/organizer"
              className="hover:text-emerald-600 transition-colors flex items-center gap-1 font-medium"
            >
              <span>&larr;</span> Back to Organizer Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              Manage Volunteers
            </span>
          </div>

          <Link
            href={`/events/${event._id}`}
            target="_blank"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View Public Page &rarr;
          </Link>
        </div>

        {/* Event Header Banner */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 capitalize">
                {event.status}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {event.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Volunteer attendance & shift assignment roster
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-center px-2">
                <div className="text-xs text-slate-500">Active / Cap</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeVolunteersCount} / {event.maxVolunteerCapacity}
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="text-center px-2">
                <div className="text-xs text-slate-500">Attended</div>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {attendedCount}
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="text-center px-2">
                <div className="text-xs text-slate-500">Cancelled</div>
                <div className="text-lg font-bold text-red-500">
                  {cancelledCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Volunteer Table */}
        <OrganizerVolunteerTable
          initialRegistrations={registrations}
          eventId={event._id}
        />
      </div>
    </div>
  );
}
