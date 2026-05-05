import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { writeWorkflowLog } from "@/lib/logs";

export function ActivityDrawer({
  open, onOpenChange, relatedType, relatedId, defaultSubject,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  relatedType: "lead" | "account" | "contact" | "opportunity_match" | "handoff";
  relatedId: string;
  defaultSubject?: string;
}) {
  const qc = useQueryClient();
  const [subject, setSubject] = useState(defaultSubject ?? "");
  const [description, setDescription] = useState("");
  const [typeId, setTypeId] = useState<string>("");
  const [statusId, setStatusId] = useState<string>("");
  const [outcomeId, setOutcomeId] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [ownerId, setOwnerId] = useState<string>("");

  const { data: types = [] } = useQuery({ queryKey: ["activity_types"], queryFn: async () => (await supabase.from("activity_types").select("*").eq("is_active", true)).data ?? [] });
  const { data: statuses = [] } = useQuery({ queryKey: ["activity_statuses"], queryFn: async () => (await supabase.from("activity_statuses").select("*").eq("is_active", true)).data ?? [] });
  const { data: outcomes = [] } = useQuery({ queryKey: ["activity_outcomes"], queryFn: async () => (await supabase.from("activity_outcomes").select("*").eq("is_active", true)).data ?? [] });
  const { data: users = [] } = useQuery({ queryKey: ["user_profiles_lite"], queryFn: async () => (await supabase.from("user_profiles").select("id, full_name, email").order("full_name")).data ?? [] });

  useEffect(() => {
    if (open) {
      (async () => {
        const { data: u } = await supabase.auth.getUser();
        setOwnerId(u.user?.id ?? "");
      })();
      setSubject(defaultSubject ?? "");
      setDescription(""); setOutcomeId(""); setDueDate("");
      setTypeId((types[0] as any)?.id ?? "");
      setStatusId(((statuses as any[]).find((s) => s.code === "OPEN") as any)?.id ?? (statuses[0] as any)?.id ?? "");
    }
  }, [open]); // eslint-disable-line

  const save = useMutation({
    mutationFn: async (mode: "save" | "save_new" | "save_complete") => {
      const { data: u } = await supabase.auth.getUser();
      const completedStatus = (statuses as any[]).find((s) => s.code === "COMPLETED");
      const payload: any = {
        subject, description,
        activity_type_id: typeId || null,
        status_id: mode === "save_complete" ? completedStatus?.id ?? statusId : statusId,
        outcome_id: outcomeId || null,
        due_date: dueDate || null,
        related_object_type: relatedType,
        related_object_id: relatedId,
        owner_id: u.user?.id, created_by: u.user?.id,
        completed_at: mode === "save_complete" ? new Date().toISOString() : null,
      };
      if (relatedType === "lead") payload.lead_id = relatedId;
      if (relatedType === "account") payload.account_id = relatedId;
      if (relatedType === "contact") payload.contact_id = relatedId;
      if (relatedType === "opportunity_match") payload.opportunity_match_id = relatedId;
      if (relatedType === "handoff") payload.handoff_id = relatedId;
      const { data: ins, error } = await (supabase as any).from("activities").insert(payload).select("id").single();
      if (error) throw error;
      await writeWorkflowLog({
        process: "activity_log", objectType: "activities", objectId: ins.id,
        toStatus: mode === "save_complete" ? "completed" : "open",
        action: mode === "save_complete" ? "create_completed" : "create",
      });
      return mode;
    },
    onSuccess: (mode) => {
      toast.success("Activity saved");
      qc.invalidateQueries({ queryKey: ["activities"] });
      qc.invalidateQueries({ queryKey: ["related-activities", relatedId] });
      if (mode === "save_new") { setSubject(""); setDescription(""); }
      else onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader><SheetTitle>Log Activity</SheetTitle></SheetHeader>
        <div className="space-y-3 mt-4">
          <div><Label>Subject *</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Type</Label>
              <select className="w-full h-9 border rounded px-2 bg-background text-sm" value={typeId} onChange={(e) => setTypeId(e.target.value)}>
                <option value="">—</option>{(types as any[]).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div><Label>Status</Label>
              <select className="w-full h-9 border rounded px-2 bg-background text-sm" value={statusId} onChange={(e) => setStatusId(e.target.value)}>
                <option value="">—</option>{(statuses as any[]).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Outcome</Label>
              <select className="w-full h-9 border rounded px-2 bg-background text-sm" value={outcomeId} onChange={(e) => setOutcomeId(e.target.value)}>
                <option value="">—</option>{(outcomes as any[]).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div><Label>Due date</Label><Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
          </div>
          <div><Label>Description</Label><Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        </div>
        <div className="flex flex-wrap gap-2 mt-5">
          <Button onClick={() => save.mutate("save")} disabled={!subject || save.isPending}>Save</Button>
          <Button variant="outline" onClick={() => save.mutate("save_new")} disabled={!subject || save.isPending}>Save & New</Button>
          <Button variant="secondary" onClick={() => save.mutate("save_complete")} disabled={!subject || save.isPending}>Save & Complete</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
