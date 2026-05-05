import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DetailLayout, SummaryField } from "@/components/DetailLayout";
import { Button } from "@/components/ui/button";
import { ChangesTab, WorkflowTab } from "@/components/RelatedTabs";
import { RecordEditor } from "@/components/RecordEditor";
import { schemas } from "@/lib/recordSchemas";
import { DeleteRecordButton } from "@/components/DeleteRecordButton";
import { writeWorkflowLog } from "@/lib/logs";
import { toast } from "sonner";
import { CheckCircle2, Link2 } from "lucide-react";
import { RecordRef } from "@/components/RecordRef";
import { tableForRelatedType } from "@/lib/recordRefs";
import { RelatedObjectPicker } from "@/components/RelatedObjectPicker";
import { useState } from "react";

export const Route = createFileRoute("/_app/activities/$id")({ component: ActivityDetail });

function ActivityDetail() {
  const { id } = useParams({ from: "/_app/activities/$id" });
  const qc = useQueryClient();
  const [pickerOpen, setPickerOpen] = useState(false);
  const { data: a, isLoading } = useQuery({
    queryKey: ["activity", id],
    queryFn: async () => (await supabase.from("activities").select("*").eq("id", id).maybeSingle()).data,
  });
  const update = useMutation({
    mutationFn: async (patch: any) => {
      const { error } = await (supabase as any).from("activities").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activity", id] }),
  });

  async function relink(table: string, recordId: string) {
    const typeMap: Record<string, string> = {
      leads: "lead", accounts: "account", contacts: "contact",
      opportunity_matches: "opportunity_match", handoffs: "handoff",
    };
    const t = typeMap[table];
    const patch: any = {
      related_object_type: t,
      related_object_id: recordId,
      lead_id: null, account_id: null, contact_id: null, opportunity_match_id: null, handoff_id: null,
    };
    if (table === "leads") patch.lead_id = recordId;
    if (table === "accounts") patch.account_id = recordId;
    if (table === "contacts") patch.contact_id = recordId;
    if (table === "opportunity_matches") patch.opportunity_match_id = recordId;
    if (table === "handoffs") patch.handoff_id = recordId;
    await update.mutateAsync(patch);
    await writeWorkflowLog({ process: "activity_relink", objectType: "activities", objectId: id, action: "relink", comments: `→ ${t}:${recordId}` });
    toast.success("Linked");
    setPickerOpen(false);
  }

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!a) return <div className="p-8">Activity not found.</div>;
  const relTable = tableForRelatedType(a.related_object_type);
  return (
    <>
      <DetailLayout
        title={a.subject}
        subtitle={a.record_number ?? ""}
        actions={<>
          {!a.completed_at && <Button size="sm" onClick={async () => {
            await update.mutateAsync({ completed_at: new Date().toISOString() });
            await writeWorkflowLog({ process: "activity_complete", objectType: "activities", objectId: id, action: "complete" });
            toast.success("Marked complete");
          }}><CheckCircle2 className="h-4 w-4 mr-1" />Mark Complete</Button>}
          <DeleteRecordButton table="activities" recordId={id} recordNumber={a.record_number} redirectTo="/activities" />
        </>}
        summary={<>
          <SummaryField label="Due" value={a.due_date ? new Date(a.due_date).toLocaleString() : "—"} />
          <SummaryField label="Completed" value={a.completed_at ? new Date(a.completed_at).toLocaleString() : "—"} />
          <SummaryField label="Related" value={
            <div className="flex items-center gap-2">
              {relTable && a.related_object_id ? <RecordRef table={relTable} id={a.related_object_id} /> : <span className="text-muted-foreground">—</span>}
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setPickerOpen(true)}>
                <Link2 className="h-3 w-3 mr-1" />Change
              </Button>
            </div>
          } />
          <SummaryField label="Owner" value={a.owner_id ? <RecordRef table="user_profiles" id={a.owner_id} /> : "—"} />
        </>}
        tabs={[
          { key: "overview", label: "Overview", render: () => <RecordEditor table="activities" recordId={id} record={a} sections={schemas.activities} queryKey={["activity", id]} /> },
          { key: "changes", label: "Changes", render: () => <ChangesTab objectType="activities" objectId={id} /> },
          { key: "workflow", label: "Workflow", render: () => <WorkflowTab objectType="activities" objectId={id} /> },
        ]}
      />
      <RelatedObjectPicker open={pickerOpen} onOpenChange={setPickerOpen} onPick={relink} />
    </>
  );
}
