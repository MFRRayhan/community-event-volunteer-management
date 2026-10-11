import Link from "next/link";
import { FiAlertTriangle, FiEdit2, FiArrowLeft } from "react-icons/fi";
import { getOrganizerEventById } from "@/actions/event.actions";
import EventForm from "@/components/events/EventForm";
import ThemeToggle from "@/components/theme/ThemeToggle";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Event | Organizer Dashboard",
  description: "Update details of an existing community event.",
};

export default async function EditEventPage({ params }) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.id;

  const event = await getOrganizerEventById(eventId);

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-center text-amber-500">
            <FiAlertTriangle className="w-12 h-12" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Event Not Found</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This event does not exist, or you do not have permission to edit it.
          </p>
          <Link
            href="/dashboard/organizer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" /> Return to Organizer Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/organizer" className="hover:text-emerald-600 transition-colors">
              Organizer Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">Edit Event</span>
          </div>
          <ThemeToggle />
        </div>

        {/* Page Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FiEdit2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Edit Event: {event.title}
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Update timing, location, capacity, or required volunteer skills.
            </p>
          </div>
          <Link
            href="/dashboard/organizer"
            className="self-start sm:self-auto px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        {/* Reusable Event Form with Pre-populated Data */}
        <EventForm initialData={event} isEdit={true} eventId={eventId} />
      </div>
    </div>
  );
}
