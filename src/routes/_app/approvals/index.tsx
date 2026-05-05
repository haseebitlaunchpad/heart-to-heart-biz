import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLookup } from "@/lib/lookups";
import { decideApproval } from "@/lib/conversions";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/approvals/")({ component: ApprovalsList });

function ApprovalsList() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [decisionRow, setDecisionRow] = useState<any | null>(null);
  const [decision, setDecision] = useState<"approve" | "reject">("approve");
  const [comments, setComments] = useState("");

  const { data: statuses = [] } = useLookup("approval_statuses");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["approvals"],
    queryFn: async () => (await supabase.from("approvals").select("*").order("requested_at", { ascending: false }).limit(500)).data ?? [],
  });

  const decide = useMutation({
    mutationFn: async ({ row, kind, note }: { row: any; kind: "approve" | "reject"; note: string }) => {
      await decideApproval(row.id, kind === "approve" ? "approved" : "rejected", note);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["approvals"] }); toast.success("Decision recorded"); setDecisionRow(null); setComments(""); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = (rows as any[]).filter((r) => {
    if (statusFilter && r.approval_status_id !== statusFilter) return false;
    if (search && !`${r.record_number ?? ""} ${r.related_object_type ?? ""} ${r.comments ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <PageHeader title="Approvals" subtitle="Pending decisions on matches and handoffs" />
      <div className="p-4">
        <FilterBar search={search} onSearch={setSearch}>
          <select className="h-9 border rounded px-2 text-sm bg-background" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {(statuses as any[]).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </FilterBar>
        <div className="bg-card border rounded-lg">
          {isLoading ? <div className="p-8 text-center text-muted-foreground">Loading…</div> :
            <DataTable rows={filtered as any} columns={[
              { key: "record_number", header: "ID" },
              { key: "related_object_type", header: "Object" },
              { key: "related", header: "Reference", render: (r: any) =>
                r.opportunity_match_id ? <Link to={`/matches/${r.opportunity_match_id}` as any} className="text-primary text-xs hover:underline">View match</Link>
                : r.handoff_id ? <Link to={`/handoffs/${r.handoff_id}` as any} className="text-primary text-xs hover:underline">View handoff</Link>
                : "—" },
              { key: "requested_at", header: "Requested", render: (r: any) => r.requested_at ? new Date(r.requested_at).toLocaleString() : "—" },
              { key: "status", header: "Status", render: (r: any) => {
                const s = (statuses as any[]).find((x) => x.id === r.approval_status_id);
                return <StatusBadge label={s?.name ?? r.decision ?? "Pending"} color={s?.color} />;
              } },
              { key: "_actions", header: "", render: (r: any) => r.decision ? null : (
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDecision("approve"); setDecisionRow(r); }}><Check className="h-4 w-4 text-green-600" /></Button>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDecision("reject"); setDecisionRow(r); }}><X className="h-4 w-4 text-destructive" /></Button>
                </div>
              ) },
            ]} />
          }
        </div>
      </div>

      <Dialog open={!!decisionRow} onOpenChange={(v) => !v && setDecisionRow(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{decision === "approve" ? "Approve" : "Reject"} request</DialogTitle></DialogHeader>
          <div><Label>Comments</Label><Textarea value={comments} onChange={(e) => setComments(e.target.value)} /></div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDecisionRow(null)}>Cancel</Button>
            <Button disabled={decide.isPending} onClick={() => decide.mutate({ row: decisionRow, kind: decision, note: comments })}>
              {decide.isPending ? "Saving…" : (decision === "approve" ? "Approve" : "Reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
