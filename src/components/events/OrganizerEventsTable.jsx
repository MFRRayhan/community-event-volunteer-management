"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/Badge";
import {
  publishEventAction,
  closeRegistrationAction,
  deleteEventAction,
} from "@/actions/event.actions";
import { FiCheck, FiAlertTriangle, FiMapPin, FiUsers } from "react-icons/fi";

export default function OrganizerEventsTable({ events = [] }) {
  const router = useRouter();
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState({ text: "", type: "" });
  const [filterStatus, setFilterStatus] = useState("all");

  const showFeedback = (text, type = "success") => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage({ text: "", type: "" });
    }, 4000);
  };

  const handlePublish = async (eventId) => {
    if (!confirm("Are you sure you want to publish this event? Volunteers will immediately be able to register.")) {
      return;
    }
    setActionLoadingId(eventId);
    try {
      const res = await publishEventAction(eventId);
      if (res?.success) {
        showFeedback(res.message, "success");
        router.refresh();
      } else {
        showFeedback(res?.message || "Failed to publish event.", "error");
      }
    } catch (err) {
      console.error(err);
      showFeedback("Failed to publish event.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCloseRegistration = async (eventId) => {
    if (!confirm("Are you sure you want to close registration? No new volunteers will be allowed to sign up.")) {
      return;
    }
    setActionLoadingId(eventId);
    try {
      const res = await closeRegistrationAction(eventId);
      if (res?.success) {
        showFeedback(res.message, "success");
        router.refresh();
      } else {
        showFeedback(res?.message || "Failed to close registration.", "error");
      }
    } catch (err) {
      console.error(err);
      showFeedback("Failed to close registration.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (eventId, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }
    setActionLoadingId(eventId);
    try {
      const res = await deleteEventAction(eventId);
      if (res?.success) {
        showFeedback(res.message, "success");
        router.refresh();
      } else {
        showFeedback(res?.message || "Failed to delete event.", "error");
      }
    } catch (err) {
      console.error(err);
      showFeedback("Failed to delete event.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter events by tab
  const filteredEvents = events.filter((ev) => {
    if (filterStatus === "all") return true;
    return ev.status === filterStatus;
  });

  return (
    <div className="space-y-4">
      {/* Toast Feedback Banner */}
      {feedbackMessage.text && (
        <div
          className={`p-4 rounded-xl text-sm font-medium transition-all flex items-center ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
          }`}
        >
          {feedbackMessage.type === "success" ? (
            <FiCheck className="w-4 h-4 inline mr-2 shrink-0" />
          ) : (
            <FiAlertTriangle className="w-4 h-4 inline mr-2 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
          {["all", "published", "draft", "closed"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterStatus === st
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {st} ({st === "all" ? events.length : events.filter((e) => e.status === st).length})
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500">
          Showing {filteredEvents.length} of {events.length} events
        </div>
      </div>

      {/* Events Table / Card Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th scope="col" className="px-6 py-4">
                  Event Title
                </th>
                <th scope="col" className="px-6 py-4">
                  Date & Time
                </th>
                <th scope="col" className="px-6 py-4">
                  Category
                </th>
                <th scope="col" className="px-6 py-4">
                  Status
                </th>
                <th scope="col" className="px-6 py-4">
                  Capacity
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No events match the selected &quot;{filterStatus}&quot; filter.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => {
                  const eventDateStr = event.eventDate
                    ? new Date(event.eventDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Not scheduled";

                  const isBusy = actionLoadingId === event._id;

                  return (
                    <tr
                      key={event._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Title & Location */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                          {event.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 flex items-center gap-1">
                          <FiMapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{event.location}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                        {eventDateStr}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs px-2.5 py-1 rounded-md font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {event.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge status={event.status} />
                      </td>

                      {/* Capacity */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {event.maxVolunteerCapacity}
                        </span>{" "}
                        <span className="text-xs text-slate-400">volunteers</span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          {/* Publish (Only when Draft) */}
                          {event.status === "draft" && (
                            <button
                              type="button"
                              onClick={() => handlePublish(event._id)}
                              disabled={isBusy}
                              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition-colors disabled:opacity-50"
                              title="Publish this event"
                            >
                              Publish
                            </button>
                          )}

                          {/* Close Registration (Only when Published) */}
                          {event.status === "published" && (
                            <button
                              type="button"
                              onClick={() => handleCloseRegistration(event._id)}
                              disabled={isBusy}
                              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800 transition-colors disabled:opacity-50"
                              title="Close registration"
                            >
                              Close
                            </button>
                          )}

                          {/* Volunteers */}
                          <Link
                            href={`/dashboard/organizer/events/${event._id}/registrations`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors"
                            title="Manage registered volunteers"
                          >
                            <FiUsers className="w-3.5 h-3.5" />
                            <span>Volunteers</span>
                          </Link>

                          {/* Edit */}
                          <Link
                            href={`/dashboard/organizer/events/edit/${event._id}`}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                          >
                            Edit
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(event._id, event.title)}
                            disabled={isBusy}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900 transition-colors disabled:opacity-50"
                            title="Delete event"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
