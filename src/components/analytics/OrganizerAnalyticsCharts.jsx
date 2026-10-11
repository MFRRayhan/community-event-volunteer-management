"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FiTag, FiUsers, FiPieChart } from "react-icons/fi";

const CATEGORY_COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#14b8a6", // teal
  "#f97316", // orange
];

export default function OrganizerAnalyticsCharts({
  eventsByCategory = [],
  registrationsPerEvent = [],
  statusBreakdown = [],
}) {
  const hasCategoryData = eventsByCategory && eventsByCategory.length > 0;
  const hasRegData = registrationsPerEvent && registrationsPerEvent.length > 0;
  const hasStatusData = statusBreakdown && statusBreakdown.length > 0;

  return (
    <div className="space-y-8">
      {/* Top 2 Primary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Events by Category */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FiTag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Events by Category</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Distribution of your created initiatives across focus areas
            </p>
          </div>

          {hasCategoryData ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventsByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 11 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" name="Initiatives" radius={[6, 6, 0, 0]}>
                    {eventsByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No category data available yet.
            </div>
          )}
        </div>

        {/* Chart 2: Volunteer Registration Statistics Per Event */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FiUsers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Volunteer Capacity & Sign-ups</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active volunteer registrations compared to maximum capacity
            </p>
          </div>

          {hasRegData ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={registrationsPerEvent}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="title"
                    tick={{ fontSize: 11 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val, name) => [val, name === "active" ? "Active Volunteers" : "Max Capacity"]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]?.payload?.fullTitle) {
                        return payload[0].payload.fullTitle;
                      }
                      return label;
                    }}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                  <Bar dataKey="active" name="Active Sign-ups" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" name="Max Capacity" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No registration data available yet.
            </div>
          )}
        </div>
      </div>

      {/* Bonus Chart: Registration Status Distribution */}
      {hasStatusData && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FiPieChart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Overall Volunteer Status Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Ratio of registered, confirmed, attended, and cancelled volunteer shifts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Status Legend Pills */}
            <div className="grid grid-cols-2 gap-3">
              {statusBreakdown.map((item) => (
                <div
                  key={item.name}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3"
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.name}</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {item.value} <span className="text-xs font-normal text-slate-400">shifts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
