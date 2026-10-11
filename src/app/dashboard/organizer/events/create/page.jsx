import Link from "next/link";
import { FiPlusCircle, FiArrowLeft } from "react-icons/fi";
import EventForm from "@/components/events/EventForm";
import ThemeToggle from "@/components/theme/ThemeToggle";

export const metadata = {
  title: "Create Event | Organizer Dashboard",
  description: "Create and publish a new community event for volunteers.",
};

export default function CreateEventPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/organizer" className="hover:text-emerald-600 transition-colors">
              Organizer Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">Create Event</span>
          </div>
          <ThemeToggle />
        </div>

        {/* Page Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FiPlusCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Create New Community Event
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Provide event details, dates, and volunteer requirements. New events are saved as drafts.
            </p>
          </div>
          <Link
            href="/dashboard/organizer"
            className="self-start sm:self-auto px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        {/* Event Form */}
        <EventForm isEdit={false} />
      </div>
    </div>
  );
}
