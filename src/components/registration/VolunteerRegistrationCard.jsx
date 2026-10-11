"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RegistrationStatusBadge from "./RegistrationStatusBadge";
import { cancelRegistrationAction } from "@/actions/registration.actions";
import { FiCalendar, FiMapPin, FiTool } from "react-icons/fi";

export default function VolunteerRegistrationCard({ registration }) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const event = registration.event || {};
  const isCancelled = registration.status === "cancelled";

  const formattedEventDate = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date TBA";

  const formattedRegDate = registration.registrationDate
    ? new Date(registration.registrationDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  const handleCancel = async () => {
    setIsCancelling(true);
    setFeedback(null);

    try {
      const res = await cancelRegistrationAction(registration._id);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setIsConfirming(false);
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to cancel registration." });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header: Category & Status */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            {event.category || "General"}
          </span>
          <RegistrationStatusBadge status={registration.status} />
        </div>

        {/* Title */}
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            {event._id ? (
              <Link href={`/events/${event._id}`}>{event.title}</Link>
            ) : (
              event.title || "Untitled Event"
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Registered on {formattedRegDate}
          </p>
        </div>

        {/* Key Event Details */}
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FiCalendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {formattedEventDate}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FiMapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="line-clamp-1">{event.location || "Location TBA"}</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <FiTool className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              Role / Skill:{" "}
              <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                {registration.selectedSkill || "General Volunteer"}
              </strong>
            </span>
          </div>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`text-xs p-2.5 rounded-lg border ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800"
            }`}
          >
            {feedback.message}
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        {event._id ? (
          <Link
            href={`/events/${event._id}`}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View Event Details &rarr;
          </Link>
        ) : (
          <span />
        )}

        {!isCancelled && (
          <div>
            {!isConfirming ? (
              <button
                type="button"
                onClick={() => setIsConfirming(true)}
                className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 hover:underline px-2 py-1 rounded transition-colors"
              >
                Cancel Registration
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 p-1.5 rounded-xl border border-red-200 dark:border-red-900">
                <span className="text-xs text-red-700 dark:text-red-300 font-medium px-1">
                  Sure?
                </span>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleCancel}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {isCancelling ? "Cancelling..." : "Yes, Cancel"}
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setIsConfirming(false)}
                  className="px-2 py-1 rounded-lg text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  Keep
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
