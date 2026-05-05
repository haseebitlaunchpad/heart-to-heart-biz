import { createFileRoute, useParams, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DetailLayout, SummaryField } from "@/components/DetailLayout";
import { StagePath } from "@/components/StagePath";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLookup, lookupName } from "@/lib/lookups";
import { writeWorkflowLog } from "@/lib/logs";
import { ChangesTab, WorkflowTab, RelatedActivitiesTab } from "@/components/RelatedTabs";
import { ActivityDrawer } from "@/components/ActivityDrawer";
import { RecordEditor } from "@/components/RecordEditor";
import { schemas } from "@/lib/recordSchemas";
import { DeleteRecordButton } from "@/components/DeleteRecordButton";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, Plus, Target, Send } from "lucide-react";
import { createMatchFromLead, submitForApproval } from "@/lib/conversions";

export const Route = createFileRoute("/_app/leads/$id")({ component: LeadDetail });

function LeadDetail() {
  const { id } = useParams({ from: "/_app/leads/$id" });
  const qc = useQueryClient();
  const nav = useNavigate();
  const [actDrawer, setActDrawer] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [identifyOpen, setIdentifyOpen] = useState(false);
  const [disqOpen, setDisqOpen] = useState(false);
  const [disqReasonId, setDisqReasonId] = useState("");
  const [disqNote, setDisqNote] = useState("");
  const [matchOpen, setMatchOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => (await supabase.from("leads").select("*").eq("id", id).maybeSingle()).data,
  });

  const { data: stages = [] } = useLookup("lead_stages", { orderBy: "sort_order" });
  const { data: statuses = [] } = useLookup("lead_statuses", { orderBy: "sort_order" });
  const { data: temps = [] } = useLookup("lead_temperatures", { orderBy: "sort_order" });
  const { data: disqReasons = [] } = useLookup("lead_disqualification_reasons");

  const update = useMutation({
    mutationFn: async (patch: any) => {
      const { data, error } = await (supabase as any).from("leads").update(patch).eq("id", id).select("*").single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lead", id] }); qc.invalidateQueries({ queryKey: ["leads"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  async function changeStage(stageId: string, code?: string) {
    const fromStage = (stages as any[]).find((s) => s.id === lead?.lead_stage_id);
    const toStage = (stages as any[]).find((s) => s.id === stageId);
    await update.mutateAsync({ lead_stage_id: stageId });
    await writeWorkflowLog({ process: "lead_stage_change", objectType: "leads", objectId: id, fromStatus: fromStage?.code, toStatus: toStage?.code ?? code, action: "stage_change" });
    toast.success(`Stage → ${toStage?.name}`);
  }

  // duplicate check
  const { data: dupes = [] } = useQuery({
    enabled: identifyOpen && !!lead,
    queryKey: ["dupes", id, lead?.email, lead?.mobile, lead?.cr_number],
    queryFn: async () => {
      const ors: string[] = [];
      if (lead?.email) ors.push(`email.eq.${lead.email}`);
      if (lead?.mobile) ors.push(`mobile.eq.${lead.mobile}`);
      if (lead?.cr_number) ors.push(`cr_number.eq.${lead.cr_number}`);
      if (!ors.length) return [];
      const { data } = await supabase.from("leads").select("id, record_number, lead_name, email, mobile, cr_number").or(ors.join(",")).neq("id", id).limit(20);
      return data ?? [];
    },
  });

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!lead) return <div className="p-8">Lead not found.</div>;

  const stage = (stages as any[]).find((s) => s.id === lead.lead_stage_id);
  const status = (statuses as any[]).find((s) => s.id === lead.lead_status_id);
  const temp = (temps as any[]).find((s) => s.id === lead.qualification_temperature_id);

  return (
    <>
      <DetailLayout
        title={lead.lead_name}
        subtitle={`${lead.record_number} · ${lead.company_name ?? "—"}`}
        badges={
          <>
            <StatusBadge label={stage?.name} color={stage?.color} />
            <StatusBadge label={status?.name} tone="info" />
            <StatusBadge label={temp?.name} color={temp?.color} />
            {lead.priority && <StatusBadge label={`Priority: ${lead.priority}`} tone="neutral" />}
          </>
        }
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => setActDrawer(true)}><Plus className="h-4 w-4 mr-1" />Log Activity</Button>
            <Button size="sm" variant="outline" onClick={() => setIdentifyOpen(true)}><AlertTriangle className="h-4 w-4 mr-1" />Identify</Button>
            <Button size="sm" variant="outline" onClick={() => setMatchOpen(true)}><Target className="h-4 w-4 mr-1" />Create Match</Button>
            <Button size="sm" variant="outline" onClick={() => setSubmitOpen(true)}><Send className="h-4 w-4 mr-1" />Submit Approval</Button>
            <Button size="sm" variant="outline" onClick={() => setDisqOpen(true)}>Disqualify</Button>
            <Button size="sm" onClick={() => setConvertOpen(true)}><CheckCircle2 className="h-4 w-4 mr-1" />Convert</Button>
            <DeleteRecordButton table="leads" recordId={id} recordNumber={lead.record_number} redirectTo="/leads" />
          </>
        }
        summary={
          <>
            <div className="mb-4">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Stage</div>
              <StagePath stages={stages as any} currentId={lead.lead_stage_id} onSelect={(s) => changeStage(s.id)} />
            </div>
            <SummaryField label="Email" value={lead.email} />
            <SummaryField label="Mobile" value={lead.mobile} />
            <SummaryField label="Source system" value={lead.source_system} />
            <SummaryField label="Lead score" value={lead.lead_score} />
            <SummaryField label="Days in stage" value={lead.days_in_stage} />
            <SummaryField label="Created" value={new Date(lead.created_at).toLocaleString()} />
          </>
        }
        tabs={[
          { key: "overview", label: "Overview", render: () => <RecordEditor table="leads" recordId={id} record={lead} sections={schemas.leads} queryKey={["lead", id]} /> },
          { key: "activities", label: "Activities", render: () => <RelatedActivitiesTab relatedId={id} /> },
          { key: "matches", label: "Matches", render: () => <MatchesPanel leadId={id} /> },
          { key: "changes", label: "Changes", render: () => <ChangesTab objectType="leads" objectId={id} /> },
          { key: "workflow", label: "Workflow", render: () => <WorkflowTab objectType="leads" objectId={id} /> },
        ]}
      />
      <ActivityDrawer open={actDrawer} onOpenChange={setActDrawer} relatedType="lead" relatedId={id} defaultSubject={`Follow-up: ${lead.lead_name}`} />

      {/* Identify (duplicate check) */}
      <Dialog open={identifyOpen} onOpenChange={setIdentifyOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Identify potential duplicates</DialogTitle></DialogHeader>
          <div className="text-sm text-muted-foreground">Matched on email / mobile / CR number.</div>
          <div className="border rounded mt-2 max-h-72 overflow-y-auto">
            {!dupes.length && <div className="p-6 text-center text-sm text-muted-foreground">No duplicates found.</div>}
            {(dupes as any[]).map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 border-b last:border-0">
                <div className="text-sm">
                  <div className="font-medium">{d.lead_name} <span className="text-muted-foreground">({d.record_number})</span></div>
                  <div className="text-xs text-muted-foreground">{d.email ?? "—"} · {d.mobile ?? "—"} · {d.cr_number ?? "—"}</div>
                </div>
                <Link to={`/leads/${d.id}` as any} className="text-xs text-primary hover:underline">Open</Link>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIdentifyOpen(false)}>Close</Button>
            <Button onClick={async () => {
              await update.mutateAsync({ duplicate_status: dupes.length ? "review" : "unique" });
              await writeWorkflowLog({ process: "lead_identify", objectType: "leads", objectId: id, action: "identify", comments: `${dupes.length} candidates` });
              toast.success("Identification recorded"); setIdentifyOpen(false);
            }}>Mark reviewed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disqualify */}
      <Dialog open={disqOpen} onOpenChange={setDisqOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Disqualify Lead</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Reason</Label>
              <select className="w-full h-9 border rounded px-2 text-sm bg-background" value={disqReasonId} onChange={(e) => setDisqReasonId(e.target.value)}>
                <option value="">Select…</option>
                {(disqReasons as any[]).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div><Label>Note</Label><Textarea value={disqNote} onChange={(e) => setDisqNote(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDisqOpen(false)}>Cancel</Button>
            <Button disabled={!disqReasonId} onClick={async () => {
              const disqStage = (stages as any[]).find((s) => s.code === "DISQ");
              await update.mutateAsync({ lead_stage_id: disqStage?.id, disqualification_reason_id: disqReasonId, qualification_notes: disqNote });
              await writeWorkflowLog({ process: "lead_disqualify", objectType: "leads", objectId: id, toStatus: "DISQ", action: "disqualify", comments: disqNote });
              toast.success("Disqualified"); setDisqOpen(false);
            }}>Disqualify</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConvertDialog open={convertOpen} onOpenChange={setConvertOpen} lead={lead} onDone={(accountId) => nav({ to: `/accounts/${accountId}` as any })} />
      <CreateMatchDialog open={matchOpen} onOpenChange={setMatchOpen} leadId={id} onDone={(mId) => nav({ to: `/matches/${mId}` as any })} />
      <SubmitApprovalDialog open={submitOpen} onOpenChange={setSubmitOpen} objectType="leads" objectId={id} />
    </>
  );
}

function CreateMatchDialog({ open, onOpenChange, leadId, onDone }: { open: boolean; onOpenChange: (v: boolean) => void; leadId: string; onDone: (id: string) => void }) {
  const [catalogId, setCatalogId] = useState("");
  const [busy, setBusy] = useState(false);
  const { data: catalog = [] } = useQuery({
    enabled: open,
    queryKey: ["catalog-options"],
    queryFn: async () => (await supabase.from("opportunity_catalog").select("id,title,record_number").eq("is_archived", false).limit(200)).data ?? [],
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Create Match from Lead</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Label>Catalog Opportunity</Label>
          <select className="w-full h-9 border rounded px-2 text-sm bg-background" value={catalogId} onChange={(e) => setCatalogId(e.target.value)}>
            <option value="">Select…</option>
            {(catalog as any[]).map((c) => <option key={c.id} value={c.id}>{c.record_number} — {c.title}</option>)}
          </select>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!catalogId || busy} onClick={async () => {
            setBusy(true);
            try { const id = await createMatchFromLead(leadId, catalogId); toast.success("Match created"); onOpenChange(false); onDone(id); }
            catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
          }}>{busy ? "Creating…" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SubmitApprovalDialog({ open, onOpenChange, objectType, objectId }: { open: boolean; onOpenChange: (v: boolean) => void; objectType: string; objectId: string }) {
  const [comments, setComments] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Submit for Approval</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Label>Comments</Label>
          <Textarea value={comments} onChange={(e) => setComments(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={busy} onClick={async () => {
            setBusy(true);
            try { await submitForApproval(objectType, objectId, comments); toast.success("Submitted"); onOpenChange(false); }
            catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
          }}>{busy ? "Submitting…" : "Submit"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function MatchesPanel({ leadId }: { leadId: string }) {
  const { data = [] } = useQuery({
    queryKey: ["lead-matches", leadId],
    queryFn: async () => (await supabase.from("opportunity_matches").select("*, opportunity_catalog(title), match_statuses(name,color)").eq("lead_id", leadId)).data ?? [],
  });
  if (!data.length) return <div className="text-sm text-muted-foreground p-6 text-center">No matches.</div>;
  return (
    <div className="space-y-2">
      {(data as any[]).map((m) => (
        <Link key={m.id} to={`/matches/${m.id}` as any} className="block bg-card border rounded p-3 hover:border-primary">
          <div className="flex justify-between">
            <div className="text-sm font-medium">{m.opportunity_catalog?.title ?? "—"}</div>
            <StatusBadge label={m.match_statuses?.name} color={m.match_statuses?.color} />
          </div>
          <div className="text-xs text-muted-foreground mt-1">{m.record_number} · {m.eligibility_result ?? "pending"}</div>
        </Link>
      ))}
    </div>
  );
}

function ConvertDialog({ open, onOpenChange, lead, onDone }: { open: boolean; onOpenChange: (v: boolean) => void; lead: any; onDone: (accountId: string) => void }) {
  const [accountName, setAccountName] = useState(lead.company_name ?? lead.lead_name);
  const [contactName, setContactName] = useState(lead.lead_name);
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Convert Lead → Account + Contact</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Account name</Label><Input value={accountName} onChange={(e) => setAccountName(e.target.value)} /></div>
          <div><Label>Primary contact</Label><Input value={contactName} onChange={(e) => setContactName(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={busy || !accountName || !contactName} onClick={async () => {
            setBusy(true);
            try {
              const { data: u } = await supabase.auth.getUser();
              const { data: acc, error: e1 } = await (supabase as any).from("accounts").insert({
                account_name: accountName, company_name: accountName, source_lead_id: lead.id,
                primary_email: lead.email, primary_mobile: lead.mobile, cr_number: lead.cr_number,
                owner_id: u.user?.id, created_by: u.user?.id,
              }).select("id").single();
              if (e1) throw e1;
              const { data: con, error: e2 } = await (supabase as any).from("contacts").insert({
                full_name: contactName, account_id: acc.id, lead_id: lead.id, is_primary_contact: true,
                email: lead.email, mobile: lead.mobile, owner_id: u.user?.id, created_by: u.user?.id,
              }).select("id").single();
              if (e2) throw e2;
              await (supabase as any).from("leads").update({
                converted_account_id: acc.id, converted_contact_id: con.id,
                converted_at: new Date().toISOString(), converted_by: u.user?.id,
                conversion_status: "converted", linked_account_id: acc.id, linked_contact_id: con.id,
              }).eq("id", lead.id);
              await writeWorkflowLog({ process: "lead_convert", objectType: "leads", objectId: lead.id, toStatus: "converted", action: "convert", comments: `Account ${acc.id}` });
              toast.success("Converted"); onOpenChange(false); onDone(acc.id);
            } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
          }}>{busy ? "Converting…" : "Convert"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
