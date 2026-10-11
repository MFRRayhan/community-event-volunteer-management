import { Suspense } from "react";
import { FiUsers, FiSearch } from "react-icons/fi";
import Navbar from "@/components/layout/Navbar";
import EventFilter from "@/components/events/EventFilter";
import EventCard from "@/components/events/EventCard";
import EmptyState from "@/components/shared/EmptyState";
import { getPublishedEvents } from "@/actions/public-event.actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Explore Community Events | Community Connect",
  description: "Browse published community events, filter by category or cause, and find volunteer opportunities.",
};

export default async function PublicEventsPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";
  const category = resolvedParams?.category || "";
  const location = resolvedParams?.location || "";
  const timeframe = resolvedParams?.timeframe || "upcoming";

  const events = await getPublishedEvents({ search, category, location, timeframe });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide">
              <FiUsers className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Volunteer Opportunities</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Explore Community Initiatives
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Find inspiring grassroots events, filter by your favorite cause or location,
              and volunteer your skills to create positive local change.
            </p>
          </div>
        </div>

        {/* Search & Filters (Wrapped in Suspense for useSearchParams) */}
        <Suspense fallback={<div className="h-32 bg-white dark:bg-slate-900 rounded-2xl animate-pulse"></div>}>
          <EventFilter />
        </Suspense>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <div>
            Showing <strong className="text-slate-900 dark:text-white">{events.length}</strong> {timeframe} {events.length === 1 ? "event" : "events"}
          </div>
          {category && category !== "All" && (
            <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
              Category: {category}
            </span>
          )}
        </div>

        {/* Events Grid or Empty State */}
        {events.length === 0 ? (
          <EmptyState
            title="No events match your criteria"
            description="Try adjusting your keyword search, selecting 'All Categories', or switching the timeline toggle."
            actionHref="/events"
            actionLabel="Clear Filters"
            icon={<FiSearch className="w-8 h-8 text-slate-400" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
