export function StatusBadge({ label, color, tone = "neutral" }: { label?: string | null; color?: string | null; tone?: "neutral" | "success" | "warning" | "danger" | "info" }) {
  if (!label) return <span className="text-muted-foreground text-xs">—</span>;
  const tones: Record<string, string> = {
    neutral: "bg-muted text-muted-foreground",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  };
  const style = color ? { backgroundColor: `${color}22`, color } : undefined;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color ? "" : tones[tone]}`}
      style={style}
    >
      {label}
    </span>
  );
}
