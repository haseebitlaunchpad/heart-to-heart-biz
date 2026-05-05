import { Link } from "@tanstack/react-router";
import { useRecordRef, routeForTable } from "@/lib/recordRefs";

/** Renders a UUID as `RECORD-NUMBER · Name` link. Shows "—" if id is null. */
export function RecordRef({ table, id }: { table: string | undefined; id: string | undefined | null }) {
  const route = table ? routeForTable(table) : undefined;
  const { data, isLoading } = useRecordRef(table, id ?? undefined);
  if (!id) return <span className="text-muted-foreground">—</span>;
  if (isLoading) return <span className="text-muted-foreground text-xs">…</span>;
  if (!data) return <span className="text-muted-foreground font-mono text-xs">{String(id).slice(0, 8)}…</span>;
  const label = `${data.recordNumber}${data.name ? ` · ${data.name}` : ""}`;
  if (!route) return <span>{label}</span>;
  return <Link to={`${route}/${id}` as any} className="text-primary hover:underline">{label}</Link>;
}
