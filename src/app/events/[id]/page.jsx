import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiAward, FiCalendar, FiMapPin, FiClock, FiSlash, FiCheck } from "react-icons/fi";
import Navbar from "@/components/layout/Navbar";
import VolunteerCTAButton from "@/components/events/VolunteerCTAButton";
import { getPublishedEventById } from "@/actions/public-event.actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const event = await getPublishedEventById(resolvedParams?.id);
  if (!event) {
    return { title: "Event Not Found | Community Connect" };
  }
  return {
    title: `${event.title} | Community Connect`,
    description: event.description.substring(0, 160),
  };
}

export default async function EventDetailsPage({ params }) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.id;

  const event = await getPublishedEventById(eventId);

  // Security: draft or nonexistent events return 404
  if (!event || event.status !== "published") {
    notFound();
  }

  const isFull = event.availableSlots <= 0;
  const deadlinePassed = event.registrationDeadline
    ? new Date(event.registrationDeadline) < new Date()
    : false;

  const eventDateStr = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Date TBD";

  const deadlineStr = event.registrationDeadline
    ? new Date(event.registrationDeadline).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No deadline specified";

  const fillPercent = Math.min(
    100,
    Math.round(((event.registeredCount || 0) / (event.maxVolunteerCapacity || 1)) * 100)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/events" className="hover:text-emerald-600 transition-colors inline-flex items-center gap-1.5">
            <FiArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to All Events</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-medium truncate">
            {event.title}
          </span>
        </div>

        {/* Hero Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {event.category}
            </span>
            {isFull ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
                <FiSlash className="w-3.5 h-3.5" /> Capacity Full
              </span>
            ) : deadlinePassed ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <FiClock className="w-3.5 h-3.5" /> Registration Closed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <FiCheck className="w-3.5 h-3.5" /> Active Opportunity
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {event.title}
          </h1>

          {/* Organizer Attribution */}
          <div className="flex items-center gap-3 pt-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="h-10 w-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {event.organizerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-xs text-slate-500">Organized by</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {event.organizerName}
              </div>
            </div>
          </div>

          {/* Grid Layout: Main Details & Sidebar CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
            {/* Left 2 Columns: Description & Skills */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  About This Initiative
                </h2>
                <div className="text-slate-700 dark:text-slate-300 text-base leading-relaxed whitespace-pre-line">
                  {event.description}
                </div>
              </div>

              {/* Required Skills */}
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Volunteer Skills Needed
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Volunteers with these skills will be prioritized during assignment:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {event.requiredSkills && event.requiredSkills.length > 0 ? (
                    event.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                      >
                        <FiAward className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        <span>{skill}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No specific skills required. All volunteers welcome!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right 1 Column: Key Information Box & CTA */}
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-5">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Event Logistics
                </h3>

                {/* Date */}
                <div className="space-y-1">
                  <div className="text-xs font-medium text-slate-500">Date & Time</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-start gap-2">
                    <FiCalendar className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{eventDateStr}</span>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <div className="text-xs font-medium text-slate-500">Venue / Location</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-start gap-2">
                    <FiMapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{event.location}</span>
                  </div>
                </div>

                {/* Deadline */}
                <div className="space-y-1">
                  <div className="text-xs font-medium text-slate-500">Registration Closes</div>
                  <div className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-start gap-2">
                    <FiClock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{deadlineStr}</span>
                  </div>
                </div>

                {/* Capacity Counter */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Volunteer Slots</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {event.registeredCount || 0} / {event.maxVolunteerCapacity} filled
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isFull
                          ? "bg-red-500"
                          : fillPercent > 75
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${fillPercent}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-right font-medium text-emerald-600 dark:text-emerald-400">
                    {event.availableSlots} spots available
                  </div>
                </div>

                {/* CTA Action Button */}
                <div className="pt-3">
                  <VolunteerCTAButton
                    eventId={event._id}
                    eventTitle={event.title}
                    requiredSkills={event.requiredSkills || []}
                    isFull={isFull}
                    deadlinePassed={deadlinePassed}
                    availableSlots={event.availableSlots}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
