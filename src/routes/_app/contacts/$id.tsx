import { createFileRoute, useParams, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DetailLayout, SummaryField } from "@/components/DetailLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ChangesTab, WorkflowTab, RelatedActivitiesTab } from "@/components/RelatedTabs";
import { ActivityDrawer } from "@/components/ActivityDrawer";
import { RecordEditor } from "@/components/RecordEditor";
import { schemas } from "@/lib/recordSchemas";
import { DeleteRecordButton } from "@/components/DeleteRecordButton";
import { setPrimaryContact } from "@/lib/conversions";
import { Plus, Star, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/contacts/$id")({ component: ContactDetail });

function ContactDetail() {
  const { id } = useParams({ from: "/_app/contacts/$id" });
  const qc = useQueryClient();
  const nav = useNavigate();
  const [actDrawer, setActDrawer] = useState(false);
  const [siblingOpen, setSiblingOpen] = useState(false);
  const { data: c, isLoading } = useQuery({
    queryKey: ["contact", id],
    queryFn: async () => (await supabase.from("contacts").select("*, accounts(account_name, id)").eq("id", id).maybeSingle()).data,
  });
  if (isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!c) return <div className="p-8">Contact not found.</div>;

  return (
    <>
      <DetailLayout
        title={c.full_name}
        subtitle={`${c.record_number ?? ""} · ${c.job_title ?? ""}`}
        actions={<>
          <Button size="sm" variant="outline" onClick={() => setActDrawer(true)}><Plus className="h-4 w-4 mr-1" />Log Activity</Button>
          {c.account_id && <Button size="sm" variant="outline" onClick={() => setSiblingOpen(true)}><UserPlus className="h-4 w-4 mr-1" />Add Contact</Button>}
          {!c.is_primary_contact && c.account_id && (
            <Button size="sm" onClick={async () => {
              try { await setPrimaryContact(id); qc.invalidateQueries({ queryKey: ["contact", id] }); toast.success("Marked as primary"); }
              catch (e: any) { toast.error(e.message); }
            }}><Star className="h-4 w-4 mr-1" />Set Primary</Button>
          )}
          <DeleteRecordButton table="contacts" recordId={id} recordNumber={c.record_number} redirectTo="/contacts" />
        </>}
        summary={<>
          <SummaryField label="Email" value={c.email} />
          <SummaryField label="Mobile" value={c.mobile} />
          <SummaryField label="Account" value={c.accounts ? <Link to={`/accounts/${c.accounts.id}` as any} className="text-primary">{c.accounts.account_name}</Link> : "—"} />
          <SummaryField label="Primary" value={c.is_primary_contact ? "Yes" : "No"} />
        </>}
        tabs={[
          { key: "overview", label: "Overview", render: () => <RecordEditor table="contacts" recordId={id} record={c} sections={schemas.contacts} queryKey={["contact", id]} /> },
          { key: "activities", label: "Activities", render: () => <RelatedActivitiesTab relatedId={id} /> },
          { key: "changes", label: "Changes", render: () => <ChangesTab objectType="contacts" objectId={id} /> },
          { key: "workflow", label: "Workflow", render: () => <WorkflowTab objectType="contacts" objectId={id} /> },
        ]}
      />
      <ActivityDrawer open={actDrawer} onOpenChange={setActDrawer} relatedType="contact" relatedId={id} defaultSubject={`Contact: ${c.full_name}`} />
      {c.account_id && <AddSiblingDialog open={siblingOpen} onOpenChange={setSiblingOpen} accountId={c.account_id} onCreated={(newId) => nav({ to: `/contacts/${newId}` as any })} />}
    </>
  );
}

function AddSiblingDialog({ open, onOpenChange, accountId, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; accountId: string; onCreated: (id: string) => void }) {
  const [f, setF] = useState({ full_name: "", job_title: "", email: "", mobile: "" });
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add another contact to this account</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {(["full_name","job_title","email","mobile"] as const).map((k) => (
            <div key={k}><Label className="capitalize">{k.replaceAll("_"," ")}{k==="full_name"?" *":""}</Label>
              <Input value={(f as any)[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={busy || !f.full_name} onClick={async () => {
            setBusy(true);
            try {
              const { data: u } = await supabase.auth.getUser();
              const { data, error } = await (supabase as any).from("contacts").insert({ ...f, account_id: accountId, owner_id: u.user?.id, created_by: u.user?.id }).select("id").single();
              if (error) throw error;
              toast.success("Contact created"); onOpenChange(false); onCreated(data.id);
            } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
          }}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
