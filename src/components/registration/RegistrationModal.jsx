"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerForEventAction } from "@/actions/registration.actions";
import { FiX, FiHeart, FiCheck, FiAlertTriangle } from "react-icons/fi";

export default function RegistrationModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  requiredSkills = [],
}) {
  const router = useRouter();
  const [selectedSkill, setSelectedSkill] = useState(requiredSkills[0] || "General Support");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await registerForEventAction({
        eventId,
        selectedSkill,
      });

      if (!result?.success) {
        setErrorMessage(result?.message || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Successfully registered! Redirecting to your dashboard...");
      router.refresh();

      setTimeout(() => {
        onClose();
        router.push("/dashboard/volunteer");
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMessage("An unexpected error occurred while registering.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close dialog"
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg p-1 rounded-full cursor-pointer"
          title="Close dialog"
        >
          <FiX className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <FiHeart className="w-3.5 h-3.5" />
            <span>Volunteer Sign-Up</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Confirm Your Participation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
            {eventTitle}
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <FiCheck className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
            <FiAlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Select Your Preferred Skill / Role
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              disabled={isLoading || Boolean(successMessage)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900"
            >
              {requiredSkills && requiredSkills.length > 0 ? (
                requiredSkills.map((sk) => (
                  <option key={sk} value={sk}>
                    {sk}
                  </option>
                ))
              ) : (
                <option value="General Support">General Support</option>
              )}
              <option value="General Volunteer">General Volunteer (Any Area Needed)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              The organizer will assign shifts and tasks based on this skill.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || Boolean(successMessage)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Registering...</span>
                </>
              ) : (
                <span>Confirm Registration</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
