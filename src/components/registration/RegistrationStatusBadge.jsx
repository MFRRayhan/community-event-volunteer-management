export default function RegistrationStatusBadge({ status }) {
  const normalized = (status || "").toLowerCase();

  const styles = {
    registered: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    attended: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
    cancelled: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800",
  };

  const style = styles[normalized] || styles.registered;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${style}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current mr-1.5"></span>
      {normalized || "registered"}
    </span>
  );
}
