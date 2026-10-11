"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
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
  const [filterStatus, setFilterStatus] = useState("all");

  const confirmAction = async ({
    title,
    text,
    confirmButtonText,
    icon = "warning",
    confirmButtonColor = "#059669",
  }) => {
    const result = await Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText: "Cancel",
      confirmButtonColor,
      cancelButtonColor: "#64748b",
      reverseButtons: true,
      focusCancel: true,
    });

    return result.isConfirmed;
  };

  const showFeedback = (text, type = "success") => {
    return Swal.fire({
      title: type === "success" ? "Success!" : "Something went wrong",
      text,
      icon: type,
      confirmButtonText: "OK",
      confirmButtonColor: type === "success" ? "#059669" : "#dc2626",
    });
  };

  const handleAction = async (eventId, action, title = "") => {
    const actionConfig = {
      publish: {
        title: "Publish Event?",
        text: "Volunteers will immediately be able to register for this event.",
        confirmButtonText: "Yes, publish it!",
        confirmButtonColor: "#059669",
        callback: publishEventAction,
      },
      close: {
        title: "Close Registration?",
        text: "No new volunteers will be allowed to register for this event.",
        confirmButtonText: "Yes, close registration",
        confirmButtonColor: "#d97706",
        callback: closeRegistrationAction,
      },
      delete: {
        title: "Delete Event?",
        text: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
        confirmButtonText: "Yes, delete it!",
        confirmButtonColor: "#dc2626",
      },
    };

    const config = actionConfig[action];

    if (!config) return;

    const confirmed = await confirmAction(config);

    if (!confirmed) return;

    setActionLoadingId(eventId);

    try {
      const result =
        action === "delete"
          ? await deleteEventAction(eventId)
          : await config.callback(eventId);

      if (result?.success) {
        await showFeedback(
          result.message || "Action completed successfully.",
          "success",
        );

        router.refresh();
      } else {
        await showFeedback(
          result?.message || "The action could not be completed.",
          "error",
        );
      }
    } catch (error) {
      console.error(`Failed to ${action} event:`, error);

      await showFeedback(
        error?.message || "An unexpected error occurred. Please try again.",
        "error",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredEvents = events.filter((event) => {
    if (filterStatus === "all") return true;
    return event.status === filterStatus;
  });

  const buttonBase =
    "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
          {["all", "published", "draft", "closed"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                filterStatus === status
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {status} (
              {status === "all"
                ? events.length
                : events.filter((event) => event.status === status).length}
              )
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500">
          Showing {filteredEvents.length} of {events.length} events
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th scope="col" className="px-6 py-4">
                  Event Title
                </th>
                <th scope="col" className="px-6 py-4">
                  Date &amp; Time
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
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-slate-500 dark:text-slate-400"
                  >
                    No events match the selected "{filterStatus}" filter.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => {
                  const eventDateStr = event.eventDate
                    ? new Date(event.eventDate).toLocaleString("en-US", {
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
                        <span className="text-xs text-slate-400">
                          volunteers
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          {event.status === "draft" && (
                            <button
                              type="button"
                              onClick={() => handleAction(event._id, "publish")}
                              disabled={actionLoadingId !== null}
                              className={`${buttonBase} bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800`}
                              title="Publish this event"
                            >
                              {isBusy ? "Processing..." : "Publish"}
                            </button>
                          )}

                          {event.status === "published" && (
                            <button
                              type="button"
                              onClick={() => handleAction(event._id, "close")}
                              disabled={actionLoadingId !== null}
                              className={`${buttonBase} bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800`}
                              title="Close registration"
                            >
                              {isBusy ? "Processing..." : "Close"}
                            </button>
                          )}

                          <Link
                            href={`/dashboard/organizer/events/${event._id}/registrations`}
                            className={`${buttonBase} inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800`}
                            title="Manage registered volunteers"
                          >
                            <FiUsers className="w-3.5 h-3.5" />
                            <span>Volunteers</span>
                          </Link>

                          <Link
                            href={`/dashboard/organizer/events/edit/${event._id}`}
                            className={`${buttonBase} bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700`}
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleAction(event._id, "delete", event.title)
                            }
                            disabled={actionLoadingId !== null}
                            className={`${buttonBase} bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900`}
                            title="Delete event"
                          >
                            {isBusy ? "Processing..." : "Delete"}
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
