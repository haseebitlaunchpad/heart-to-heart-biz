import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Timeline, TimelineItem } from "@/components/Timeline";
import { RecordRef } from "@/components/RecordRef";
import { FK_TABLE_MAP, isUuid } from "@/lib/recordRefs";

export function ChangesTab({ objectType, objectId }: { objectType: string; objectId: string }) {
  const { data = [] } = useQuery({
    queryKey: ["audit", objectType, objectId],
    queryFn: async () => {
      const { data } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("object_type", objectType)
        .eq("object_id", objectId)
        .order("changed_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });
  const items: TimelineItem[] = (data as any[]).map((r) => ({
    id: r.id,
    title: `${r.action_type.toUpperCase()} ${r.field_name ? `· ${r.field_name}` : ""}`,
    description: r.action_type === "update"
      ? <DiffView old={r.old_value} next={r.new_value} />
      : null,
    meta: r.change_source ? `via ${r.change_source}` : "",
    timestamp: r.changed_at,
  }));
  return <Timeline items={items} />;
}

function DiffView({ old: prev, next }: { old: any; next: any }) {
  if (!prev || !next) return null;
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  const skip = new Set(["updated_at", "created_at"]);
  const diffs: { k: string; a: any; b: any }[] = [];
  keys.forEach((k) => {
    if (skip.has(k)) return;
    if (JSON.stringify(prev[k]) !== JSON.stringify(next[k])) diffs.push({ k, a: prev[k], b: next[k] });
  });
  if (!diffs.length) return null;
  return (
    <div className="text-xs space-y-1">
      {diffs.slice(0, 8).map((d) => (
        <div key={d.k}>
          <span className="text-muted-foreground">{d.k}:</span>{" "}
          <span className="opacity-60 line-through">{renderVal(d.k, d.a)}</span>
          {" → "}
          <span>{renderVal(d.k, d.b)}</span>
        </div>
      ))}
      {diffs.length > 8 && <div className="text-muted-foreground">+ {diffs.length - 8} more</div>}
    </div>
  );
}

function renderVal(field: string, v: any) {
  if (v === null || v === undefined || v === "") return <span className="font-mono">—</span>;
  if (isUuid(v)) {
    const table = FK_TABLE_MAP[field];
    if (table) return <RecordRef table={table} id={v} />;
    return <span className="font-mono text-xs">{v.slice(0, 8)}…</span>;
  }
  if (typeof v === "string") return <span>{v.length > 60 ? v.slice(0, 60) + "…" : v}</span>;
  return <span className="font-mono text-xs">{JSON.stringify(v)}</span>;
}

function stringify(v: any) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return v.length > 40 ? v.slice(0, 40) + "…" : v;
  return JSON.stringify(v);
}

export function WorkflowTab({ objectType, objectId }: { objectType: string; objectId: string }) {
  const { data = [] } = useQuery({
    queryKey: ["workflow", objectType, objectId],
    queryFn: async () => {
      const { data } = await supabase
        .from("workflow_logs")
        .select("*")
        .eq("object_type", objectType)
        .eq("object_id", objectId)
        .order("performed_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });
  const items: TimelineItem[] = (data as any[]).map((r) => ({
    id: r.id,
    title: `${r.process_name} · ${r.action_taken}`,
    description: r.from_status || r.to_status ? `${r.from_status ?? "—"} → ${r.to_status ?? "—"}` : null,
    meta: r.comments,
    timestamp: r.performed_at,
  }));
  return <Timeline items={items} />;
}

export function RelatedActivitiesTab({ relatedId }: { relatedId: string }) {
  const { data = [] } = useQuery({
    queryKey: ["related-activities", relatedId],
    queryFn: async () => {
      const { data } = await supabase
        .from("activities")
        .select("*")
        .eq("related_object_id", relatedId)
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });
  const items: TimelineItem[] = (data as any[]).map((r) => ({
    id: r.id,
    title: r.subject,
    description: r.description,
    meta: r.completed_at ? `Completed ${new Date(r.completed_at).toLocaleString()}` : (r.due_date ? `Due ${new Date(r.due_date).toLocaleString()}` : "Open"),
    timestamp: r.created_at,
  }));
  return <Timeline items={items} />;
}
