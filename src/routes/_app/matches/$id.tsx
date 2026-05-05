import { createFileRoute, useParams, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DetailLayout, SummaryField } from "@/components/DetailLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { ApprovalActions } from "@/components/ApprovalActions";
import { Button } from "@/components/ui/button";
import { useLookup } from "@/lib/lookups";
import { writeWorkflowLog } from "@/lib/logs";
import { promoteMatchToHandoff } from "@/lib/conversions";
import { ChangesTab, WorkflowTab, RelatedActivitiesTab } from "@/components/RelatedTabs";
import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";

export const Route = createFileRoute("/_app/matches/$id")({ component: MatchDetail });

function MatchDetail() {
  const { id } = useParams({ from: "/_app/matches/$id" });
  const qc = useQueryClient();
  const { data: m, isLoading } = useQuery({
    queryKey: ["match", id],
    queryFn: async () => (await supabase.from("opportunity_matches").select("*, opportunity_catalog(*), leads(id,lead_name), accounts(id,account_name)").eq("id", id).maybeSingle()).data,
  });
  const { data: matchStatuses = [] } = useLookup("match_statuses", { orderBy: "sort_order" });
  const { data: approvalStatuses = [] } = useLookup("approval_statuses");

  const update = useMutation({
    mutationFn: async (patch: any) => {
      const { error } = await (supabase as any).from("opportunity_matches").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["match", id] }),
  });

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!m) return <div className="p-8">Not found.</div>;

  const ms = (matchStatuses as any[]).find((s) => s.id === m.match_status_id);
  const aps = (approvalStatuses as any[]).find((s) => s.id === m.approval_status_id);

  async function runEligibility() {
    const cat: any = (m as any)?.opportunity_catalog;
    const missing: string[] = [];
    if (cat?.required_cr && !(m as any)?.accounts?.id) missing.push("CR/account required");
    const result = missing.length ? "ineligible" : "eligible";
    await update.mutateAsync({ eligibility_result: result, missing_requirements: missing });
    await writeWorkflowLog({ process: "match_eligibility", objectType: "opportunity_matches", objectId: id, toStatus: result, action: "run_eligibility" });
    toast.success(`Eligibility: ${result}`);
  }

  async function submit() {
    const submitted = (matchStatuses as any[]).find((s) => s.code === "SUBMITTED") ?? (matchStatuses as any[])[0];
    const pending = (approvalStatuses as any[]).find((s) => s.code === "PENDING");
    const { data: u } = await supabase.auth.getUser();
    await update.mutateAsync({ match_status_id: submitted?.id, approval_status_id: pending?.id, submitted_at: new Date().toISOString(), submitted_by: u.user?.id });
    await (supabase as any).from("approvals").insert({
      related_object_type: "opportunity_match", related_object_id: id, opportunity_match_id: id,
      requested_by: u.user?.id, approval_status_id: pending?.id,
    });
    await writeWorkflowLog({ process: "match_submit", objectType: "opportunity_matches", objectId: id, toStatus: "SUBMITTED", action: "submit_for_approval" });
    toast.success("Submitted for approval");
  }

  async function approve() {
    const approved = (approvalStatuses as any[]).find((s) => s.code === "APPROVED");
    const { data: u } = await supabase.auth.getUser();
    await update.mutateAsync({ approval_status_id: approved?.id, approved_at: new Date().toISOString(), approved_by: u.user?.id });
    await (supabase as any).from("approvals").update({ approval_status_id: approved?.id, decision: "approved", decided_at: new Date().toISOString(), decided_by: u.user?.id }).eq("opportunity_match_id", id);
    await writeWorkflowLog({ process: "match_approve", objectType: "opportunity_matches", objectId: id, toStatus: "APPROVED", action: "approve" });
    toast.success("Approved");
  }

  async function reject(reason: string) {
    const rejected = (approvalStatuses as any[]).find((s) => s.code === "REJECTED");
    const { data: u } = await supabase.auth.getUser();
    await update.mutateAsync({ approval_status_id: rejected?.id, rejected_at: new Date().toISOString(), rejected_by: u.user?.id, rejection_reason: reason });
    await (supabase as any).from("approvals").update({ approval_status_id: rejected?.id, decision: "rejected", rejection_reason: reason, decided_at: new Date().toISOString(), decided_by: u.user?.id }).eq("opportunity_match_id", id);
    await writeWorkflowLog({ process: "match_reject", objectType: "opportunity_matches", objectId: id, toStatus: "REJECTED", action: "reject", comments: reason });
    toast.success("Rejected");
  }

  async function requestInfo(note: string) {
    await (supabase as any).from("approvals").update({ comments: note }).eq("opportunity_match_id", id);
    await writeWorkflowLog({ process: "match_request_info", objectType: "opportunity_matches", objectId: id, action: "request_info", comments: note });
    toast.success("Info requested");
  }

  return (
    <DetailLayout
      title={m.opportunity_catalog?.title ?? "Match"}
      subtitle={`${m.record_number} · ${m.leads?.lead_name ?? m.accounts?.account_name ?? "—"}`}
      badges={<><StatusBadge label={ms?.name} color={ms?.color} /><StatusBadge label={aps?.name} tone="info" /><StatusBadge label={m.eligibility_result} tone={m.eligibility_result === "eligible" ? "success" : "warning"} /></>}
      actions={<>
        <Button size="sm" variant="outline" onClick={runEligibility}>Run Eligibility</Button>
        <Button size="sm" onClick={submit}>Submit for Approval</Button>
      </>}
      summary={<>
        <SummaryField label="Catalog" value={<Link to={`/catalog/${m.catalog_opportunity_id}` as any} className="text-primary">{m.opportunity_catalog?.title}</Link>} />
        <SummaryField label="Lead" value={m.leads ? <Link to={`/leads/${m.leads.id}` as any} className="text-primary">{m.leads.lead_name}</Link> : "—"} />
        <SummaryField label="Account" value={m.accounts ? <Link to={`/accounts/${m.accounts.id}` as any} className="text-primary">{m.accounts.account_name}</Link> : "—"} />
        <SummaryField label="Path notes" value={m.path_notes} />
        <SummaryField label="Submitted" value={m.submitted_at ? new Date(m.submitted_at).toLocaleString() : "—"} />
      </>}
      tabs={[
        { key: "approval", label: "Approval", render: () => (
          <div className="space-y-4">
            <div className="text-sm">Eligibility: <b>{m.eligibility_result ?? "—"}</b></div>
            {(m.missing_requirements ?? []).length > 0 && <div className="text-sm">Missing: {(m.missing_requirements as string[]).join(", ")}</div>}
            <ApprovalActions onApprove={approve} onReject={reject} onRequestInfo={requestInfo} />
          </div>
        )},
        { key: "activities", label: "Activities", render: () => <RelatedActivitiesTab relatedId={id} /> },
        { key: "changes", label: "Changes", render: () => <ChangesTab objectType="opportunity_matches" objectId={id} /> },
        { key: "workflow", label: "Workflow", render: () => <WorkflowTab objectType="opportunity_matches" objectId={id} /> },
      ]}
    />
  );
}
