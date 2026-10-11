import Link from "next/link";
import { FiCalendar, FiMapPin, FiClock, FiArrowRight } from "react-icons/fi";

export default function EventCard({ event }) {
  const isFull = event.availableSlots <= 0;
  const registered = event.registeredCount || 0;
  const capacity = event.maxVolunteerCapacity || 1;
  const fillPercent = Math.min(100, Math.round((registered / capacity) * 100));

  const deadlinePassed = event.registrationDeadline
    ? new Date(event.registrationDeadline) < new Date()
    : false;

  const eventDateStr = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Date TBD";

  const deadlineStr = event.registrationDeadline
    ? new Date(event.registrationDeadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Top Badges */}
        <div className="p-5 pb-3 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {event.category}
          </span>

          <div className="flex items-center gap-1.5">
            {isFull ? (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
                Full
              </span>
            ) : deadlinePassed ? (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Closed
              </span>
            ) : (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {event.availableSlots} spots left
              </span>
            )}
          </div>
        </div>

        {/* Title & Short Description */}
        <div className="px-5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
            <Link href={`/events/${event._id}`}>{event.title}</Link>
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1.5">
            {event.description}
          </p>
        </div>

        {/* Date, Location, and Deadline Info */}
        <div className="px-5 pt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <FiCalendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium text-slate-700 dark:text-slate-300">{eventDateStr}</span>
          </div>
          <div className="flex items-center gap-1.5 line-clamp-1">
            <FiMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          {deadlineStr && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              <FiClock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Deadline: {deadlineStr}</span>
            </div>
          )}
        </div>

        {/* Required Skills */}
        {event.requiredSkills && event.requiredSkills.length > 0 && (
          <div className="px-5 pt-3 flex flex-wrap gap-1.5">
            {event.requiredSkills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                {skill}
              </span>
            ))}
            {event.requiredSkills.length > 3 && (
              <span className="text-[11px] text-slate-400 py-0.5">
                +{event.requiredSkills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Capacity Progress & Action */}
      <div className="p-5 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Capacity</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {registered} / {capacity} volunteers
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
        </div>

        {/* View Details CTA */}
        <Link
          href={`/events/${event._id}`}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white dark:bg-slate-800 dark:hover:bg-emerald-600 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <span>View Details & Volunteer</span>
          <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
