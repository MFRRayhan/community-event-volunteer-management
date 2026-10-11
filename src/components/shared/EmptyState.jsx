import Link from "next/link";
import { FiCalendar, FiPlus } from "react-icons/fi";

export default function EmptyState({
  title = "No events found",
  description = "You haven't created any community events yet.",
  actionHref,
  actionLabel,
  icon = <FiCalendar className="w-8 h-8 text-slate-400" />,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center">
      <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          <FiPlus className="w-4 h-4" /> {actionLabel}
        </Link>
      )}
    </div>
  );
}
