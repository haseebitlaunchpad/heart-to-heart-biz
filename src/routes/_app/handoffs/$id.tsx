import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DetailLayout, SummaryField } from "@/components/DetailLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLookup } from "@/lib/lookups";
import { writeWorkflowLog, writeIntegrationLog } from "@/lib/logs";
import { ChangesTab, WorkflowTab } from "@/components/RelatedTabs";
import { RecordEditor } from "@/components/RecordEditor";
import { schemas } from "@/lib/recordSchemas";
import { DeleteRecordButton } from "@/components/DeleteRecordButton";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/handoffs/$id")({ component: HandoffDetail });

function HandoffDetail() {
  const { id } = useParams({ from: "/_app/handoffs/$id" });
  const qc = useQueryClient();
  const { data: h, isLoading } = useQuery({
    queryKey: ["handoff", id],
    queryFn: async () => (await supabase.from("handoffs").select("*, accounts(account_name,id), opportunity_catalog(title)").eq("id", id).maybeSingle()).data,
  });
  const { data: items = [] } = useLookup("handoff_checklist_items", { orderBy: "sort_order" });
  const { data: statuses = [] } = useLookup("handoff_statuses");
  const { data: integ = [] } = useLookup("integration_statuses");

  const update = useMutation({
    mutationFn: async (patch: any) => {
      const { error } = await (supabase as any).from("handoffs").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["handoff", id] }),
  });

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!h) return <div className="p-8">Not found.</div>;
  const checklist = (h.checklist_state as any) ?? {};
  const status = (statuses as any[]).find((s) => s.id === h.handoff_status_id);
  const istatus = (integ as any[]).find((s) => s.id === h.integration_status_id);

  async function toggleItem(code: string, v: boolean) {
    const next = { ...checklist, [code]: v };
    await update.mutateAsync({ checklist_state: next });
  }

  async function validate() {
    const required = (items as any[]).filter((i) => i.is_required);
    const missing = required.filter((i) => !checklist[i.code]).map((i) => i.name);
    if (missing.length) { toast.error(`Missing: ${missing.join(", ")}`); return; }
    toast.success("Package valid");
    await writeWorkflowLog({ process: "handoff_validate", objectType: "handoffs", objectId: id, action: "validate", comments: "ok" });
  }

  async function markReady() {
    const ready = (statuses as any[]).find((s) => s.code === "READY");
    await update.mutateAsync({ handoff_status_id: ready?.id });
    await writeWorkflowLog({ process: "handoff_ready", objectType: "handoffs", objectId: id, toStatus: "READY", action: "mark_ready" });
    toast.success("Marked ready");
  }

  async function submit() {
    const submitted = (statuses as any[]).find((s) => s.code === "SUBMITTED");
    const success = Math.random() > 0.3;
    const successStatus = (integ as any[]).find((s) => s.code === (success ? "SUCCESS" : "FAILED"));
    const { data: u } = await supabase.auth.getUser();
    await update.mutateAsync({
      handoff_status_id: submitted?.id, integration_status_id: successStatus?.id,
      submitted_at: new Date().toISOString(), submitted_by: u.user?.id,
      retry_count: ((h as any)?.retry_count ?? 0) + 1,
      failure_reason: success ? null : "Mock integration timeout",
      failed_at: success ? null : new Date().toISOString(),
      package_payload: { catalog: (h as any)?.opportunity_catalog?.title, account: (h as any)?.accounts?.account_name, checklist },
    });
    await writeIntegrationLog({
      name: "senaei_handoff_mock", direction: "outbound", relatedType: "handoffs", relatedId: id,
      status: success ? "success" : "failure",
      request: { handoff_id: id }, response: success ? { ok: true } : null, error: success ? undefined : "Mock timeout",
    });
    await writeWorkflowLog({ process: "handoff_submit", objectType: "handoffs", objectId: id, toStatus: success ? "SUCCESS" : "FAILED", action: "submit_handoff" });
    toast[success ? "success" : "error"](success ? "Handoff submitted" : "Submission failed");
  }

  async function retry() { await submit(); }

  async function markAccepted() {
    const accepted = (statuses as any[]).find((s) => s.code === "ACCEPTED");
    await update.mutateAsync({ handoff_status_id: accepted?.id, accepted_at: new Date().toISOString() });
    await writeWorkflowLog({ process: "handoff_accept", objectType: "handoffs", objectId: id, toStatus: "ACCEPTED", action: "mark_accepted" });
    toast.success("Marked accepted");
  }

  return (
    <DetailLayout
      title={`Handoff ${h.record_number ?? ""}`}
      subtitle={h.opportunity_catalog?.title ?? ""}
      badges={<><StatusBadge label={status?.name} color={status?.color} /><StatusBadge label={istatus?.name} tone="info" /></>}
      actions={<>
        <Button size="sm" variant="outline" onClick={validate}>Validate</Button>
        <Button size="sm" variant="outline" onClick={markReady}>Mark Ready</Button>
        <Button size="sm" onClick={submit}>Submit</Button>
        {h.failed_at && <Button size="sm" variant="outline" onClick={retry}>Retry</Button>}
        <Button size="sm" variant="secondary" onClick={markAccepted}>Mark Accepted</Button>
        <DeleteRecordButton table="handoffs" recordId={id} recordNumber={h.record_number} redirectTo="/handoffs" />
      </>}
      summary={<>
        <SummaryField label="Source Match" value={h.opportunity_match_id ? <Link to={`/matches/${h.opportunity_match_id}` as any} className="text-primary">View match</Link> : "—"} />
        <SummaryField label="Account" value={h.accounts ? <Link to={`/accounts/${h.accounts.id}` as any} className="text-primary">{h.accounts.account_name}</Link> : "—"} />
        <SummaryField label="Submitted" value={h.submitted_at ? new Date(h.submitted_at).toLocaleString() : "—"} />
        <SummaryField label="Accepted" value={h.accepted_at ? new Date(h.accepted_at).toLocaleString() : "—"} />
        <SummaryField label="Retries" value={h.retry_count} />
        <SummaryField label="Failure reason" value={h.failure_reason} />
      </>}
      tabs={[
        { key: "overview", label: "Overview", render: () => <RecordEditor table="handoffs" recordId={id} record={h} sections={schemas.handoffs} queryKey={["handoff", id]} /> },
        { key: "checklist", label: "Checklist", render: () => (
          <div className="space-y-2 max-w-xl">
            {(items as any[]).map((it) => (
              <label key={it.id} className="flex items-start gap-3 p-3 border rounded bg-card cursor-pointer">
                <Checkbox checked={!!checklist[it.code]} onCheckedChange={(v) => toggleItem(it.code, !!v)} />
                <div>
                  <div className="font-medium text-sm">{it.name} {it.is_required && <span className="text-red-500">*</span>}</div>
                  {it.description && <div className="text-xs text-muted-foreground">{it.description}</div>}
                </div>
              </label>
            ))}
          </div>
        )},
        { key: "payload", label: "Package", render: () => <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">{JSON.stringify(h.package_payload, null, 2)}</pre> },
        { key: "changes", label: "Changes", render: () => <ChangesTab objectType="handoffs" objectId={id} /> },
        { key: "workflow", label: "Workflow", render: () => <WorkflowTab objectType="handoffs" objectId={id} /> },
      ]}
    />
  );
}
