"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FiSearch } from "react-icons/fi";

const CATEGORIES = [
  "All",
  "Environment",
  "Education",
  "Health",
  "Food Drive",
  "Animal Care",
  "Community Development",
  "Arts & Culture",
  "Crisis Relief",
];

export default function EventFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from existing URL query parameters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [timeframe, setTimeframe] = useState(searchParams.get("timeframe") || "upcoming");

  // Synchronize state with URL parameters
  const applyFilters = (newFilters = {}) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    const merged = {
      search,
      category,
      location,
      timeframe,
      ...newFilters,
    };

    // Set or delete search
    if (merged.search && merged.search.trim()) {
      current.set("search", merged.search.trim());
    } else {
      current.delete("search");
    }

    // Set or delete category
    if (merged.category && merged.category !== "All") {
      current.set("category", merged.category);
    } else {
      current.delete("category");
    }

    // Set or delete location
    if (merged.location && merged.location.trim()) {
      current.set("location", merged.location.trim());
    } else {
      current.delete("location");
    }

    // Set or delete timeframe
    if (merged.timeframe && merged.timeframe !== "upcoming") {
      current.set("timeframe", merged.timeframe);
    } else {
      current.delete("timeframe");
    }

    const searchStr = current.toString();
    const query = searchStr ? `?${searchStr}` : "";
    router.push(`${pathname}${query}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters({ search });
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setCategory(val);
    applyFilters({ category: val });
  };

  const handleTimeframeChange = (val) => {
    setTimeframe(val);
    applyFilters({ timeframe: val });
  };

  const handleReset = () => {
    setSearch("");
    setCategory("All");
    setLocation("");
    setTimeframe("upcoming");
    router.push(pathname);
  };

  const hasActiveFilters = Boolean(
    search || (category && category !== "All") || location || timeframe !== "upcoming"
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
      {/* Search Input Row */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by title (e.g. tree, cleanup, health)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900 transition-all dark:text-white"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors shrink-0"
        >
          Search
        </button>
      </form>

      {/* Filter Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Category Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 dark:text-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Location
          </label>
          <div className="flex gap-1">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters({ location })}
              placeholder="City or venue name..."
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 dark:text-white"
            />
            <button
              type="button"
              onClick={() => applyFilters({ location })}
              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs rounded-xl font-medium"
              title="Apply location filter"
            >
              Go
            </button>
          </div>
        </div>

        {/* Upcoming / Past Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Timeline
          </label>
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => handleTimeframeChange("upcoming")}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeframe === "upcoming"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => handleTimeframeChange("past")}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeframe === "past"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Past
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Reset Indicator */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500">
            Filters active: {search && `"${search}" `} {category !== "All" && `[${category}] `} {location && `[Location: ${location}] `} {timeframe === "past" && `[Past Events]`}
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
