import Link from "next/link";
import {
  FiPlusCircle,
  FiArrowLeft,
  FiCalendar,
  FiImage,
  FiUsers,
  FiMapPin,
} from "react-icons/fi";

import EventForm from "@/components/events/EventForm";
import ThemeToggle from "@/components/theme/ThemeToggle";

export const metadata = {
  title: "Create Event | Organizer Dashboard",
  description:
    "Create a community event, add a poster, and connect volunteers with meaningful activities.",
};

const eventHighlights = [
  {
    icon: FiImage,
    title: "Event Poster",
    description: "Make your event stand out with an attractive poster.",
  },
  {
    icon: FiCalendar,
    title: "Schedule",
    description: "Set the event date and provide clear details.",
  },
  {
    icon: FiUsers,
    title: "Volunteer Capacity",
    description: "Define how many volunteers can participate.",
  },
];

export default function CreateEventPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Page Container */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Breadcrumb and Theme Toggle */}
        <div className="flex items-center justify-between gap-4 mb-7">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm"
          >
            <Link
              href="/dashboard/organizer"
              className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Organizer Dashboard
            </Link>

            <span className="text-slate-300 dark:text-slate-600">/</span>

            <span
              aria-current="page"
              className="font-semibold text-slate-800 dark:text-slate-200"
            >
              Create Event
            </span>
          </nav>

          <ThemeToggle />
        </div>

        {/* Hero Header */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-950 p-6 sm:p-9 lg:p-10 shadow-lg shadow-emerald-950/10 mb-8">
          {/* Decorative Background */}
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-20 w-72 h-72 rounded-full bg-white/5 blur-2xl"
          />

          <div
            aria-hidden="true"
            className="absolute -right-10 -bottom-28 w-72 h-72 rounded-full border border-white/10"
          />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50 mb-4">
                <FiPlusCircle className="w-4 h-4" />
                Organizer Workspace
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                Create a Community Event
              </h1>

              <p className="mt-3 max-w-xl text-sm sm:text-base leading-7 text-emerald-50/85">
                Bring people together for a meaningful cause. Add your event
                details, choose a schedule, and prepare to welcome volunteers.
              </p>
            </div>

            <Link
              href="/dashboard/organizer"
              className="inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </section>

        {/* Event Creation Highlights */}
        <section
          aria-label="Event creation overview"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          {eventHighlights.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900 transition-colors"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Icon className="w-5 h-5" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* Form Section */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-8 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Event Information
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Complete the information below to create your event. New events
              are saved as drafts.
            </p>
          </div>

          <div className="p-5 sm:p-8">
            <EventForm isEdit={false} />
          </div>
        </section>

        {/* Footer Note */}
        <div className="flex items-start gap-3 mt-5 px-1">
          <div className="mt-0.5 text-emerald-600 dark:text-emerald-400">
            <FiMapPin className="w-4 h-4" />
          </div>

          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            Please ensure your event schedule, location, and volunteer
            requirements are accurate before publishing. Clear information helps
            volunteers decide whether to participate.
          </p>
        </div>
      </div>
    </main>
  );
}
