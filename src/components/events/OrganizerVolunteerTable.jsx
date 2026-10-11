"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RegistrationStatusBadge from "@/components/registration/RegistrationStatusBadge";
import { updateRegistrationStatusAction } from "@/actions/registration.actions";
import { FiX, FiTool } from "react-icons/fi";

export default function OrganizerVolunteerTable({ initialRegistrations = [] }) {
  const router = useRouter();
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [updatingId, setUpdatingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const handleStatusChange = async (registrationId, newStatus) => {
    setUpdatingId(registrationId);
    setFeedback(null);

    try {
      const res = await updateRegistrationStatusAction({
        registrationId,
        status: newStatus,
      });

      if (res.success) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r._id === registrationId ? { ...r, status: newStatus } : r
          )
        );
        setFeedback({ type: "success", message: res.message });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to update status." });
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = registrations.filter((reg) => {
    if (filterStatus !== "all" && reg.status !== filterStatus) {
      return false;
    }
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const matchName = (reg.volunteerName || "").toLowerCase().includes(query);
      const matchEmail = (reg.volunteerEmail || "").toLowerCase().includes(query);
      const matchSkill = (reg.selectedSkill || "").toLowerCase().includes(query);
      return matchName || matchEmail || matchSkill;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search volunteers by name, email, or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-medium text-slate-500 whitespace-nowrap">
            Filter Status:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Registrations</option>
            <option value="registered">Registered</option>
            <option value="confirmed">Confirmed</option>
            <option value="attended">Attended</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            aria-label="Close feedback"
            className="text-xs hover:opacity-70 font-bold ml-2 p-1"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Volunteers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th scope="col" className="px-6 py-4">Volunteer</th>
                <th scope="col" className="px-6 py-4">Selected Skill</th>
                <th scope="col" className="px-6 py-4">Registration Date</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No volunteers found matching your query.
                  </td>
                </tr>
              ) : (
                filtered.map((reg) => {
                  const regDateStr = reg.registrationDate
                    ? new Date(reg.registrationDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  const isUpdating = updatingId === reg._id;

                  return (
                    <tr
                      key={reg._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Volunteer Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-sm border border-emerald-200 dark:border-emerald-800">
                            {(reg.volunteerName || "V").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {reg.volunteerName || "Unknown Volunteer"}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {reg.volunteerEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Selected Skill */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          <FiTool className="w-3 h-3 mr-1.5 text-slate-500 shrink-0" />
                          <span>{reg.selectedSkill || "General Volunteer"}</span>
                        </span>
                      </td>

                      {/* Registration Date */}
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {regDateStr}
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <RegistrationStatusBadge status={reg.status} />
                      </td>

                      {/* Status Selector */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {isUpdating && (
                            <span className="h-3 w-3 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                          )}
                          <select
                            disabled={isUpdating}
                            value={reg.status}
                            onChange={(e) =>
                              handleStatusChange(reg._id, e.target.value)
                            }
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden disabled:opacity-50"
                          >
                            <option value="registered">registered</option>
                            <option value="confirmed">confirmed</option>
                            <option value="attended">attended</option>
                            <option value="cancelled">cancelled</option>
                          </select>
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
