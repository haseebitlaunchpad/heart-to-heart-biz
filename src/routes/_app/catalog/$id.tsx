import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DetailLayout, SummaryField } from "@/components/DetailLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLookup } from "@/lib/lookups";
import { writeWorkflowLog } from "@/lib/logs";
import { ChangesTab, WorkflowTab } from "@/components/RelatedTabs";
import { RecordEditor } from "@/components/RecordEditor";
import { schemas } from "@/lib/recordSchemas";
import { DeleteRecordButton } from "@/components/DeleteRecordButton";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/catalog/$id")({ component: CatalogDetail });

function CatalogDetail() {
  const { id } = useParams({ from: "/_app/catalog/$id" });
  const qc = useQueryClient();
  const { data: c, isLoading } = useQuery({
    queryKey: ["catalog", id],
    queryFn: async () => (await supabase.from("opportunity_catalog").select("*").eq("id", id).maybeSingle()).data,
  });
  useLookup("match_statuses");
  const update = useMutation({
    mutationFn: async (patch: any) => {
      const { error } = await (supabase as any).from("opportunity_catalog").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog", id] }),
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!c) return <div className="p-8">Not found.</div>;

  async function setStatus(code: "draft" | "published" | "suspended" | "archived") {
    await update.mutateAsync({ ...(code === "archived" ? { is_archived: true } : {}) });
    await writeWorkflowLog({ process: "catalog_state", objectType: "opportunity_catalog", objectId: id, toStatus: code, action: code });
    toast.success(`Set to ${code}`);
  }

  return (
    <DetailLayout
      title={c.title}
      subtitle={`${c.record_number ?? ""}`}
      badges={<><StatusBadge label={c.is_archived ? "Archived" : "Active"} tone={c.is_archived ? "danger" : "success"} /></>}
      actions={<>
        <Button size="sm" variant="outline" onClick={() => setStatus("draft")}>Save Draft</Button>
        <Button size="sm" onClick={() => setStatus("published")}>Publish</Button>
        <Button size="sm" variant="outline" onClick={() => setStatus("suspended")}>Suspend</Button>
        <Button size="sm" variant="destructive" onClick={() => setStatus("archived")}>Archive</Button>
        <DeleteRecordButton table="opportunity_catalog" recordId={id} recordNumber={c.record_number} redirectTo="/catalog" />
      </>}
      summary={<>
        <SummaryField label="Type" value={c.journey_area} />
        <SummaryField label="Min Investment" value={c.min_investment} />
        <SummaryField label="Max Investment" value={c.max_investment} />
        <SummaryField label="Capacity" value={c.capacity} />
        <SummaryField label="Available from" value={c.available_from} />
        <SummaryField label="Expires" value={c.expiry_date} />
      </>}
      tabs={[
        { key: "general", label: "General", render: () => <RecordEditor table="opportunity_catalog" recordId={id} record={c} sections={schemas.opportunity_catalog} queryKey={["catalog", id]} /> },
        { key: "eligibility", label: "Eligibility", render: () => (
          <div className="space-y-2 text-sm">
            <div><b>Required CR:</b> {c.required_cr ? "Yes" : "No"}</div>
            <div><b>Eligible investor:</b> {c.eligible_investor_type ?? "—"}</div>
            <div><b>Eligible nationality:</b> {c.eligible_nationality_type ?? "—"}</div>
            <div><b>Required documents:</b> {(c.required_documents ?? []).join(", ") || "—"}</div>
            <div><b>Exclusion:</b> {c.exclusion_criteria ?? "—"}</div>
          </div>
        )},
        { key: "paths", label: "Paths", render: () => (
          <div className="space-y-2 text-sm">
            <div><b>Path A:</b> {c.path_a_description ?? "—"}</div>
            <div><b>Path B:</b> {c.path_b_description ?? "—"}</div>
            <div><b>Path C:</b> {c.path_c_description ?? "—"}</div>
          </div>
        )},
        { key: "matches", label: "Related Matches", render: () => <Matches catalogId={id} /> },
        { key: "documents", label: "Documents", render: () => <div className="text-sm text-muted-foreground">No documents.</div> },
        { key: "changes", label: "Changes", render: () => <ChangesTab objectType="opportunity_catalog" objectId={id} /> },
        { key: "workflow", label: "Workflow", render: () => <WorkflowTab objectType="opportunity_catalog" objectId={id} /> },
      ]}
    />
  );
}

function General({ c, update }: { c: any; update: (p: any) => Promise<any> }) {
  const [f, setF] = useState({ title: c.title, description: c.description ?? "", min_investment: c.min_investment ?? "", max_investment: c.max_investment ?? "", capacity: c.capacity ?? "" });
  return (
    <div className="grid md:grid-cols-2 gap-3 max-w-3xl">
      <div className="md:col-span-2"><Label>Title</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
      <div className="md:col-span-2"><Label>Description</Label><Textarea rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
      <div><Label>Min investment</Label><Input value={f.min_investment} onChange={(e) => setF({ ...f, min_investment: e.target.value })} /></div>
      <div><Label>Max investment</Label><Input value={f.max_investment} onChange={(e) => setF({ ...f, max_investment: e.target.value })} /></div>
      <div><Label>Capacity</Label><Input value={f.capacity} onChange={(e) => setF({ ...f, capacity: e.target.value })} /></div>
      <div className="md:col-span-2"><Button onClick={async () => { await update({ ...f, min_investment: f.min_investment || null, max_investment: f.max_investment || null, capacity: f.capacity || null }); toast.success("Saved"); }}>Save</Button></div>
    </div>
  );
}

function Matches({ catalogId }: { catalogId: string }) {
  const { data = [] } = useQuery({ queryKey: ["catalog-matches", catalogId], queryFn: async () => (await supabase.from("opportunity_matches").select("*").eq("catalog_opportunity_id", catalogId).limit(50)).data ?? [] });
  if (!data.length) return <div className="text-sm text-muted-foreground p-6 text-center">No matches.</div>;
  return (
    <div className="space-y-2">
      {(data as any[]).map((m) => (
        <Link key={m.id} to={`/matches/${m.id}` as any} className="block bg-card border rounded p-3 hover:border-primary text-sm">
          {m.record_number} · {m.eligibility_result ?? "pending"}
        </Link>
      ))}
    </div>
  );
}
