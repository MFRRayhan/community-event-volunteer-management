import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { getOrganizerEvents } from "@/actions/event.actions";
import OrganizerHeader from "@/components/layout/OrganizerHeader";
import StatCard from "@/components/ui/StatCard";
import OrganizerEventsTable from "@/components/events/OrganizerEventsTable";
import EmptyState from "@/components/shared/EmptyState";
import {
  FiCalendar,
  FiSend,
  FiFileText,
  FiCheckCircle,
  FiPlusCircle,
} from "react-icons/fi";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Organizer Dashboard | Community Connect",
  description:
    "Manage your community events, publish drafts, and track volunteer capacity.",
};

export default async function OrganizerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/dashboard/organizer");
  }

  if (session.user.role !== "organizer") {
    redirect("/dashboard/volunteer");
  }

  // Fetch organizer's events from MongoDB
  const events = await getOrganizerEvents();

  // Compute summary metrics
  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === "published").length;
  const draftEvents = events.filter((e) => e.status === "draft").length;
  const closedEvents = events.filter(
    (e) => e.status === "closed" || e.status === "completed",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header with User Info, Create Event CTA & Sign Out */}
        <OrganizerHeader user={session.user} />

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Events"
            value={totalEvents}
            icon={<FiCalendar className="w-6 h-6" />}
            color="emerald"
          />
          <StatCard
            title="Published Events"
            value={publishedEvents}
            icon={<FiSend className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Draft Events"
            value={draftEvents}
            icon={<FiFileText className="w-6 h-6" />}
            color="amber"
          />
          <StatCard
            title="Closed / Completed"
            value={closedEvents}
            icon={<FiCheckCircle className="w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Event List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Your Community Events
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage, publish, edit, or close registration for your
                initiatives.
              </p>
            </div>
          </div>

          {events.length === 0 ? (
            <EmptyState
              title="No events created yet"
              description="Get started by creating your first community event to attract passionate volunteers."
              actionHref="/dashboard/organizer/events/create"
              actionLabel="Create First Event"
              icon={<FiPlusCircle className="w-8 h-8 text-emerald-500" />}
            />
          ) : (
            <OrganizerEventsTable events={events} />
          )}
        </div>
      </div>
    </div>
  );
}
