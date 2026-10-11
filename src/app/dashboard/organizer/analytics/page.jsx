import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/auth";
import { getOrganizerAnalytics } from "@/actions/analytics.actions";
import StatCard from "@/components/ui/StatCard";
import OrganizerAnalyticsCharts from "@/components/analytics/OrganizerAnalyticsCharts";
import EmptyState from "@/components/shared/EmptyState";
import ThemeToggle from "@/components/theme/ThemeToggle";
import {
  FiArrowLeft,
  FiPlus,
  FiTrendingUp,
  FiCalendar,
  FiUsers,
  FiTarget,
  FiZap,
  FiBarChart2,
} from "react-icons/fi";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Organizer Analytics | Community Connect",
  description: "Gain visual insights into your community initiatives, categories, and volunteer capacity.",
};

export default async function OrganizerAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/dashboard/organizer/analytics");
  }

  if (session.user.role !== "organizer") {
    redirect("/dashboard/volunteer");
  }

  const analytics = await getOrganizerAnalytics();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/dashboard/organizer"
              className="hover:text-emerald-600 transition-colors flex items-center gap-1 font-medium"
            >
              <FiArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              Event Analytics
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard/organizer/events/create"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <FiPlus className="w-4 h-4" />
              <span>Create New Initiative</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Page Hero Header */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xl">
              <FiTrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Organizer Analytics & Insights
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time data aggregation across your events, volunteer engagement, and category breakdown.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Initiatives"
            value={analytics.summary.totalEvents}
            icon={<FiCalendar className="w-6 h-6" />}
            color="emerald"
          />
          <StatCard
            title="Active Sign-ups"
            value={analytics.summary.activeRegistrations}
            icon={<FiUsers className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Total Capacity"
            value={analytics.summary.totalCapacity}
            icon={<FiTarget className="w-6 h-6" />}
            color="purple"
          />
          <StatCard
            title="Capacity Utilization"
            value={`${analytics.summary.utilizationRate}%`}
            icon={<FiZap className="w-6 h-6" />}
            color="amber"
          />
        </div>

        {/* Main Charts Section */}
        {!analytics.hasData ? (
          <EmptyState
            icon={<FiBarChart2 className="w-8 h-8 text-slate-400" />}
            title="No events to analyze yet"
            description="Create and publish community events to visualize your volunteer turnout and category engagement."
            actionHref="/dashboard/organizer/events/create"
            actionLabel="Create First Event"
          />
        ) : (
          <OrganizerAnalyticsCharts
            eventsByCategory={analytics.eventsByCategory}
            registrationsPerEvent={analytics.registrationsPerEvent}
            statusBreakdown={analytics.statusBreakdown}
          />
        )}
      </div>
    </div>
  );
}
