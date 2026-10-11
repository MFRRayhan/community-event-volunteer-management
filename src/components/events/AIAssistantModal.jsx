"use client";

import { useState } from "react";
import {
  FiX,
  FiAlertTriangle,
  FiUser,
  FiStar,
  FiCopy,
  FiCheck,
  FiRefreshCw,
} from "react-icons/fi";
import { MdAutoAwesome } from "react-icons/md";

export default function AIAssistantModal({ isOpen, onClose, onApply }) {
  const [idea, setIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedData, setGeneratedData] = useState(null);
  const [copiedPromo, setCopiedPromo] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!idea.trim()) {
      setError("Please enter a short idea for your community event.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/generate-event-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: idea.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate description with AI.");
      }

      setGeneratedData(data);
    } catch (err) {
      setError(err.message || "Failed to generate event content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!generatedData) return;
    onApply(generatedData);
    onClose();
  };

  const copyPromotionalMessage = () => {
    if (!generatedData?.promotionalMessage) return;
    navigator.clipboard.writeText(generatedData.promotionalMessage);
    setCopiedPromo(true);
    setTimeout(() => setCopiedPromo(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl shadow-md">
              <MdAutoAwesome className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                AI Event Description Assistant
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Powered by Google Gemini 1.5 Flash
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Input Prompt Section */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Short Event Idea or Theme
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. Community tree plantation drive in city park. Need 30 volunteers for planting and watering."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Be specific about activity and community impact.</span>
            <button
              type="button"
              disabled={isLoading || !idea.trim()}
              onClick={handleGenerate}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <MdAutoAwesome className="w-4 h-4" />
                  <span>{generatedData ? "Regenerate" : "Generate with AI"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading State Animation */}
        {isLoading && (
          <div className="p-8 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 text-center space-y-3 animate-pulse">
            <div className="inline-block p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400">
              <MdAutoAwesome className="w-6 h-6 mx-auto" />
            </div>
            <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
              Generating event idea...
            </h4>
            <p className="text-xs text-indigo-700 dark:text-indigo-400 max-w-sm mx-auto">
              Gemini is structuring your mission, defining volunteer roles, and preparing compelling copy.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FiAlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </span>
            <button
              onClick={() => setError(null)}
              className="text-xs font-bold hover:underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Display Generated Content */}
        {generatedData && !isLoading && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-300">
            {/* Generated Title */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Generated Event Title
              </label>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white">
                {generatedData.title}
              </div>
            </div>

            {/* Generated Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Generated Description
              </label>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                {generatedData.description}
              </div>
            </div>

            {/* Suggested Roles & Required Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Suggested Roles */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Suggested Roles
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 min-h-[42px]">
                  {generatedData.suggestedRoles && generatedData.suggestedRoles.length > 0 ? (
                    generatedData.suggestedRoles.map((role, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      >
                        <FiUser className="w-3 h-3" /> {role}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">None specified</span>
                  )}
                </div>
              </div>

              {/* Required Skills */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Required Skills
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 min-h-[42px]">
                  {generatedData.requiredSkills && generatedData.requiredSkills.length > 0 ? (
                    generatedData.requiredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        <FiStar className="w-3 h-3" /> {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">None specified</span>
                  )}
                </div>
              </div>
            </div>

            {/* Promotional Message */}
            {generatedData.promotionalMessage && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Promotional Outreach Message
                  </label>
                  <button
                    type="button"
                    onClick={copyPromotionalMessage}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedPromo ? (
                      <span className="inline-flex items-center gap-1">
                        <FiCheck className="w-3.5 h-3.5" /> Copied
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <FiCopy className="w-3.5 h-3.5" /> Copy Message
                      </span>
                    )}
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 italic leading-relaxed">
                  &ldquo;{generatedData.promotionalMessage}&rdquo;
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>

          {generatedData && (
            <>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleGenerate}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FiCheck className="w-3.5 h-3.5" />
                <span>Apply to Form</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
