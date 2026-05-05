import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DetailLayout, SummaryField } from "@/components/DetailLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChangesTab, WorkflowTab, RelatedActivitiesTab } from "@/components/RelatedTabs";
import { ActivityDrawer } from "@/components/ActivityDrawer";
import { writeWorkflowLog } from "@/lib/logs";
import { Plus, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/contacts/$id")({ component: ContactDetail });

function ContactDetail() {
  const { id } = useParams({ from: "/_app/contacts/$id" });
  const qc = useQueryClient();
  const [actDrawer, setActDrawer] = useState(false);
  const { data: c, isLoading } = useQuery({
    queryKey: ["contact", id],
    queryFn: async () => (await supabase.from("contacts").select("*, accounts(account_name, id)").eq("id", id).maybeSingle()).data,
  });
  const update = useMutation({
    mutationFn: async (patch: any) => {
      const { error } = await (supabase as any).from("contacts").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contact", id] }),
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
          {!c.is_primary_contact && c.account_id && <Button size="sm" onClick={async () => {
            await update.mutateAsync({ is_primary_contact: true });
            await writeWorkflowLog({ process: "contact_set_primary", objectType: "contacts", objectId: id, action: "set_primary" });
            toast.success("Marked as primary");
          }}><Star className="h-4 w-4 mr-1" />Set Primary</Button>}
        </>}
        summary={<>
          <SummaryField label="Email" value={c.email} />
          <SummaryField label="Mobile" value={c.mobile} />
          <SummaryField label="Account" value={c.accounts?.account_name ?? "—"} />
          <SummaryField label="Primary" value={c.is_primary_contact ? "Yes" : "No"} />
        </>}
        tabs={[
          { key: "overview", label: "Overview", render: () => <Edit c={c} update={update.mutateAsync} /> },
          { key: "activities", label: "Activities", render: () => <RelatedActivitiesTab relatedId={id} /> },
          { key: "changes", label: "Changes", render: () => <ChangesTab objectType="contacts" objectId={id} /> },
          { key: "workflow", label: "Workflow", render: () => <WorkflowTab objectType="contacts" objectId={id} /> },
        ]}
      />
      <ActivityDrawer open={actDrawer} onOpenChange={setActDrawer} relatedType="contact" relatedId={id} defaultSubject={`Contact: ${c.full_name}`} />
    </>
  );
}

function Edit({ c, update }: { c: any; update: (p: any) => Promise<any> }) {
  const [f, setF] = useState({ full_name: c.full_name, email: c.email ?? "", mobile: c.mobile ?? "", job_title: c.job_title ?? "" });
  return (
    <div className="grid md:grid-cols-2 gap-3 max-w-2xl">
      {Object.entries(f).map(([k, v]) => (
        <div key={k}><Label className="capitalize">{k.replaceAll("_", " ")}</Label><Input value={v} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>
      ))}
      <div className="md:col-span-2"><Button onClick={async () => { await update(f); toast.success("Saved"); }}>Save</Button></div>
    </div>
  );
}
