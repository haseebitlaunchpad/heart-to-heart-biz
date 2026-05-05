import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useLookup } from "@/lib/lookups";
import { writeWorkflowLog } from "@/lib/logs";
import { Plus, LayoutGrid, List as ListIcon } from "lucide-react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/handoffs/")({ component: HandoffsList });

function HandoffsList() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [view, setView] = useState<"list" | "board">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [matchId, setMatchId] = useState("");

  const { data: statuses = [] } = useLookup("handoff_statuses");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["handoffs"],
    queryFn: async () => (await supabase.from("handoffs")
      .select("*, opportunity_catalog(title), accounts(account_name)")
      .eq("is_archived", false).order("created_at", { ascending: false }).limit(500)).data ?? [],
  });

  const { data: matches = [] } = useQuery({
    queryKey: ["matches-for-handoff"],
    enabled: open,
    queryFn: async () => (await supabase.from("opportunity_matches").select("id, record_number, opportunity_catalog(title)").limit(200)).data ?? [],
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!matchId) throw new Error("Pick a match");
      const { data: u } = await supabase.auth.getUser();
      const draft = (statuses as any[]).find((s) => s.code === "DRAFT") ?? (statuses as any[])[0];
      const { data, error } = await (supabase as any).from("handoffs").insert({
        opportunity_match_id: matchId,
        handoff_status_id: draft?.id,
        owner_id: u.user?.id, created_by: u.user?.id,
      }).select("id").single();
      if (error) throw error;
      await writeWorkflowLog({ process: "handoff_create", objectType: "handoffs", objectId: data.id, toStatus: "DRAFT", action: "create" });
      return data.id as string;
    },
    onSuccess: (id) => { toast.success("Handoff created"); setOpen(false); qc.invalidateQueries({ queryKey: ["handoffs"] }); nav({ to: `/handoffs/${id}` as any }); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = (rows as any[]).filter((r) => {
    if (statusFilter && r.handoff_status_id !== statusFilter) return false;
    if (search && !`${r.record_number ?? ""} ${r.opportunity_catalog?.title ?? ""} ${r.accounts?.account_name ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <PageHeader title="Handoffs" subtitle="Approved match → external partner package" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />New Handoff</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Handoff</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>From Match *</Label>
                <select className="w-full h-9 border rounded px-2 text-sm bg-background" value={matchId} onChange={(e) => setMatchId(e.target.value)}>
                  <option value="">Select…</option>
                  {(matches as any[]).map((m) => <option key={m.id} value={m.id}>{m.record_number} — {m.opportunity_catalog?.title ?? ""}</option>)}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button disabled={!matchId || create.isPending} onClick={() => create.mutate()}>{create.isPending ? "Saving…" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      } />
      <div className="p-4">
        <FilterBar search={search} onSearch={setSearch}>
          <select className="h-9 border rounded px-2 text-sm bg-background" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {(statuses as any[]).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="flex border rounded-md p-0.5 ml-auto">
            <Button size="sm" variant={view === "list" ? "secondary" : "ghost"} onClick={() => setView("list")}><ListIcon className="h-4 w-4" /></Button>
            <Button size="sm" variant={view === "board" ? "secondary" : "ghost"} onClick={() => setView("board")}><LayoutGrid className="h-4 w-4" /></Button>
          </div>
        </FilterBar>
        {view === "list" ? (
          <div className="bg-card border rounded-lg">
            {isLoading ? <div className="p-8 text-center text-muted-foreground">Loading…</div> :
              <DataTable rows={filtered as any} linkBase="/handoffs" columns={[
                { key: "record_number", header: "ID" },
                { key: "catalog", header: "Opportunity", render: (r: any) => r.opportunity_catalog?.title ?? "—" },
                { key: "account", header: "Account", render: (r: any) => r.accounts?.account_name ?? "—" },
                { key: "submitted_at", header: "Submitted", render: (r: any) => r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : "—" },
                { key: "retry_count", header: "Retries" },
                { key: "status", header: "Status", render: (r: any) => {
                  const s = (statuses as any[]).find((x) => x.id === r.handoff_status_id);
                  return <StatusBadge label={s?.name} color={s?.color} />;
                } },
              ]} />
            }
          </div>
        ) : (
          <KanbanBoard
            columns={(statuses as any[]).map((s) => ({ id: s.id, title: s.name, color: s.color }))}
            cards={(filtered as any[]).map((r) => ({ id: r.id, columnId: r.handoff_status_id ?? "", title: r.opportunity_catalog?.title ?? r.record_number, subtitle: r.accounts?.account_name, meta: r.record_number }))}
            linkBase="/handoffs"
            onCardMove={async (cardId, fromColId, toColId) => {
              qc.setQueryData(["handoffs"], (old: any) =>
                Array.isArray(old) ? old.map((r: any) => (r.id === cardId ? { ...r, handoff_status_id: toColId } : r)) : old
              );
              const fromCode = (statuses as any[]).find((s) => s.id === fromColId)?.code;
              const toCode = (statuses as any[]).find((s) => s.id === toColId)?.code;
              const { error } = await (supabase as any).from("handoffs").update({ handoff_status_id: toColId }).eq("id", cardId);
              if (error) { toast.error(error.message); qc.invalidateQueries({ queryKey: ["handoffs"] }); return; }
              await writeWorkflowLog({ process: "handoff_status_change", objectType: "handoffs", objectId: cardId, fromStatus: fromCode, toStatus: toCode, action: "drag_drop" });
              toast.success(`Status → ${toCode}`);
            }}
          />
        )}
        <div className="text-xs text-muted-foreground mt-2">{filtered.length} record(s)</div>
      </div>
    </>
  );
}
