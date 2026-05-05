import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Timeline, TimelineItem } from "@/components/Timeline";
import { RecordRef } from "@/components/RecordRef";
import { FK_TABLE_MAP, isUuid } from "@/lib/recordRefs";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Plus, Pencil } from "lucide-react";
import { writeWorkflowLog } from "@/lib/logs";
import { toast } from "sonner";
import { ActivityDrawer } from "@/components/ActivityDrawer";

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

export function RelatedActivitiesTab({
  relatedId, relatedType,
}: {
  relatedId: string;
  relatedType?: "lead" | "account" | "contact" | "opportunity_match" | "handoff";
}) {
  const qc = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  const complete = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("activities").update({ completed_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      await writeWorkflowLog({ process: "activity_complete", objectType: "activities", objectId: id, action: "complete" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["related-activities", relatedId] });
      toast.success("Marked complete");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const items: TimelineItem[] = (data as any[]).map((r) => ({
    id: r.id,
    title: (
      <div className="flex items-center gap-2">
        <Link to={"/activities/$id" as any} params={{ id: r.id } as any} className="hover:text-primary font-medium flex items-center gap-1">
          {r.subject}
          <Pencil className="h-3 w-3 opacity-50" />
        </Link>
        {!r.completed_at && (
          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => complete.mutate(r.id)}>
            <CheckCircle2 className="h-3 w-3 mr-1" />Complete
          </Button>
        )}
      </div>
    ) as any,
    description: r.description,
    meta: <>
      {r.completed_at ? `Completed ${new Date(r.completed_at).toLocaleString()}` : (r.due_date ? `Due ${new Date(r.due_date).toLocaleString()}` : "Open")}
      {r.owner_id && <> · Owner: <RecordRef table="user_profiles" id={r.owner_id} /></>}
    </> as any,
    timestamp: r.created_at,
  }));

  return (
    <div className="space-y-3">
      {relatedType && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setDrawerOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />Log activity
          </Button>
        </div>
      )}
      <Timeline items={items} />
      {relatedType && (
        <ActivityDrawer open={drawerOpen} onOpenChange={setDrawerOpen} relatedType={relatedType} relatedId={relatedId} />
      )}
    </div>
  );
}
