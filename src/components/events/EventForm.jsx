"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createEventAction, updateEventAction } from "@/actions/event.actions";
import { validateEventForm } from "@/validators/event.validator";
import AIAssistantModal from "@/components/events/AIAssistantModal";
import { FiAlertTriangle, FiCheck, FiPlus } from "react-icons/fi";
import { MdAutoAwesome } from "react-icons/md";

const CATEGORIES = [
  "Environment",
  "Education",
  "Health",
  "Food Drive",
  "Community Development",
  "Animal Welfare",
  "Arts & Culture",
  "Crisis Relief",
];

const PRESET_SKILLS = [
  "Event Setup",
  "Registration",
  "First Aid",
  "Crowd Control",
  "Logistics",
  "Photography",
  "Social Media",
  "Food Distribution",
  "Teaching",
  "Cleaning",
];

/**
 * Formats a Date object or ISO string into YYYY-MM-DDTHH:mm for datetime-local inputs
 */
function toDatetimeLocalString(dateVal) {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function EventForm({ initialData = null, isEdit = false, eventId = null }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    eventDate: toDatetimeLocalString(initialData?.eventDate),
    location: initialData?.location || "",
    category: initialData?.category || CATEGORIES[0],
    maxVolunteerCapacity: initialData?.maxVolunteerCapacity || "",
    requiredSkills: initialData?.requiredSkills || [],
    registrationDeadline: toDatetimeLocalString(initialData?.registrationDeadline),
  });

  const [customSkillInput, setCustomSkillInput] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  const handleApplyAI = (aiData) => {
    if (!aiData) return;
    setFormData((prev) => {
      const incomingSkills = Array.isArray(aiData.requiredSkills) ? aiData.requiredSkills : [];
      const mergedSkills = Array.from(new Set([...prev.requiredSkills, ...incomingSkills]));
      return {
        ...prev,
        title: aiData.title || prev.title,
        description: aiData.description || prev.description,
        requiredSkills: mergedSkills,
      };
    });

    setFieldErrors((prev) => ({
      ...prev,
      title: "",
      description: "",
      requiredSkills: "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (generalError) setGeneralError("");
  };

  const handleToggleSkill = (skill) => {
    setFormData((prev) => {
      const exists = prev.requiredSkills.includes(skill);
      const updated = exists
        ? prev.requiredSkills.filter((s) => s !== skill)
        : [...prev.requiredSkills, skill];
      return { ...prev, requiredSkills: updated };
    });
    if (fieldErrors.requiredSkills) {
      setFieldErrors((prev) => ({ ...prev, requiredSkills: "" }));
    }
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    if (!formData.requiredSkills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, trimmed],
      }));
    }
    setCustomSkillInput("");
    if (fieldErrors.requiredSkills) {
      setFieldErrors((prev) => ({ ...prev, requiredSkills: "" }));
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    // 1. Client-side validation check
    const validation = validateEventForm(formData);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      let result;
      if (isEdit) {
        result = await updateEventAction(eventId, formData);
      } else {
        result = await createEventAction(formData);
      }

      if (!result?.success) {
        if (result?.errors) {
          setFieldErrors(result.errors);
        }
        setGeneralError(result?.message || "Failed to save event. Please check the inputs.");
        setIsLoading(false);
        return;
      }

      // Success: redirect to organizer dashboard
      router.push("/dashboard/organizer");
      router.refresh();
    } catch (err) {
      console.error("Event form submit error:", err);
      setGeneralError("An unexpected error occurred while saving the event.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* General Error Banner */}
      {generalError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
          <FiAlertTriangle className="w-5 h-5 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Basic Information Section */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            1. General Event Details
          </h2>
          {!isEdit && (
            <button
              type="button"
              onClick={() => setIsAIOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <MdAutoAwesome className="w-3.5 h-3.5" />
              <span>Generate with AI</span>
            </button>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Event Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Annual Riverside Cleanup Initiative"
            disabled={isLoading}
            className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none dark:bg-slate-800 dark:text-white ${
              fieldErrors.title
                ? "border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
                : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900"
            }`}
          />
          {fieldErrors.title && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.title}</p>
          )}
        </div>

        {/* Category & Capacity Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900 outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {fieldErrors.category && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Max Volunteer Capacity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              name="maxVolunteerCapacity"
              value={formData.maxVolunteerCapacity}
              onChange={handleChange}
              placeholder="e.g. 25"
              disabled={isLoading}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none dark:bg-slate-800 dark:text-white ${
                fieldErrors.maxVolunteerCapacity
                  ? "border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
                  : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900"
              }`}
            />
            {fieldErrors.maxVolunteerCapacity && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldErrors.maxVolunteerCapacity}
              </p>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Location / Venue <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Community Center, 124 Park Ave, New York, NY or Virtual Meeting URL"
            disabled={isLoading}
            className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none dark:bg-slate-800 dark:text-white ${
              fieldErrors.location
                ? "border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
                : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900"
            }`}
          />
          {fieldErrors.location && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.location}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Detailed Description <span className="text-red-500">*</span> (min 20 chars)
          </label>
          <textarea
            rows="5"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the goals of this event, volunteer expectations, shift timing, and instructions..."
            disabled={isLoading}
            className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none dark:bg-slate-800 dark:text-white resize-y ${
              fieldErrors.description
                ? "border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
                : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900"
            }`}
          ></textarea>
          <div className="flex justify-between items-center mt-1">
            {fieldErrors.description ? (
              <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.description}</p>
            ) : (
              <span></span>
            )}
            <span className="text-xs text-slate-400">
              {formData.description.length} characters
            </span>
          </div>
        </div>
      </div>

      {/* Schedule & Deadlines Section */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          2. Event Schedule & Deadlines
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Event Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Event Date & Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none dark:bg-slate-800 dark:text-white ${
                fieldErrors.eventDate
                  ? "border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
                  : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900"
              }`}
            />
            {fieldErrors.eventDate && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.eventDate}</p>
            )}
          </div>

          {/* Registration Deadline */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Registration Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="registrationDeadline"
              value={formData.registrationDeadline}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none dark:bg-slate-800 dark:text-white ${
                fieldErrors.registrationDeadline
                  ? "border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
                  : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900"
              }`}
            />
            {fieldErrors.registrationDeadline && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldErrors.registrationDeadline}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Required Skills Section */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          3. Required Volunteer Skills <span className="text-red-500">*</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Select preset skills or add custom skills that volunteers will pick from when registering.
        </p>

        {/* Preset Skills */}
        <div className="flex flex-wrap gap-2">
          {PRESET_SKILLS.map((skill) => {
            const isSelected = formData.requiredSkills.includes(skill);
            return (
              <button
                type="button"
                key={skill}
                onClick={() => handleToggleSkill(skill)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors inline-flex items-center gap-1 ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                }`}
              >
                {isSelected ? <FiCheck className="w-3 h-3" /> : <FiPlus className="w-3 h-3" />}
                <span>{skill}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Skill Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customSkillInput}
            onChange={(e) => setCustomSkillInput(e.target.value)}
            placeholder="Add custom skill (e.g. Audio Engineering)"
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900"
          />
          <button
            type="button"
            onClick={handleAddCustomSkill}
            className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Add Skill
          </button>
        </div>

        {/* Selected Skills Pills */}
        <div className="pt-2">
          <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">
            Selected Skills ({formData.requiredSkills.length}):
          </div>
          {formData.requiredSkills.length === 0 ? (
            <p className="text-sm italic text-slate-400">No skills selected yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {formData.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-500 font-bold ml-1"
                    title="Remove skill"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {fieldErrors.requiredSkills && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{fieldErrors.requiredSkills}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <Link
          href="/dashboard/organizer"
          className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>{isEdit ? "Updating..." : "Creating Event..."}</span>
            </>
          ) : (
            <span>{isEdit ? "Save Changes" : "Save as Draft"}</span>
          )}
        </button>
      </div>

      {/* AI Assistant Modal (Create mode only) */}
      {!isEdit && (
        <AIAssistantModal
          isOpen={isAIOpen}
          onClose={() => setIsAIOpen(false)}
          onApply={handleApplyAI}
        />
      )}
    </form>
  );
}
