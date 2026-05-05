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
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_app/activities/$id")({ component: ActivityDetail });

function ActivityDetail() {
  const { id } = useParams({ from: "/_app/activities/$id" });
  const qc = useQueryClient();
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
  if (isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!a) return <div className="p-8">Activity not found.</div>;
  return (
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
        <SummaryField label="Related" value={a.related_object_type ? `${a.related_object_type} · ${a.related_object_id}` : "—"} />
      </>}
      tabs={[
        { key: "overview", label: "Overview", render: () => <RecordEditor table="activities" recordId={id} record={a} sections={schemas.activities} queryKey={["activity", id]} /> },
        { key: "changes", label: "Changes", render: () => <ChangesTab objectType="activities" objectId={id} /> },
        { key: "workflow", label: "Workflow", render: () => <WorkflowTab objectType="activities" objectId={id} /> },
      ]}
    />
  );
}
