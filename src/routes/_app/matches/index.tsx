import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLookup } from "@/lib/lookups";
import { writeWorkflowLog } from "@/lib/logs";
import { Plus, Wrench, LayoutGrid, List as ListIcon } from "lucide-react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/matches/")({ component: MatchesList });

function MatchesList() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [view, setView] = useState<"list" | "board">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ lead_id: "", account_id: "", catalog_opportunity_id: "", notes: "" });

  const { data: statuses = [] } = useLookup("match_statuses", { orderBy: "sort_order" });

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => (await supabase.from("opportunity_matches")
      .select("*, opportunity_catalog(title), leads(lead_name), accounts(account_name)")
      .eq("is_archived", false).order("created_at", { ascending: false }).limit(500)).data ?? [],
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["leads-lite"],
    queryFn: async () => (await supabase.from("leads").select("id, lead_name, record_number").eq("is_archived", false).limit(200)).data ?? [],
  });
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts-lite"],
    queryFn: async () => (await supabase.from("accounts").select("id, account_name, record_number").eq("is_archived", false).limit(200)).data ?? [],
  });
  const { data: catalog = [] } = useQuery({
    queryKey: ["catalog-lite"],
    queryFn: async () => (await supabase.from("opportunity_catalog").select("id, title, record_number").eq("is_archived", false).limit(200)).data ?? [],
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!form.catalog_opportunity_id) throw new Error("Catalog opportunity is required");
      const { data: u } = await supabase.auth.getUser();
      const draft = (statuses as any[]).find((s) => s.code === "DRAFT") ?? (statuses as any[])[0];
      const payload: any = {
        catalog_opportunity_id: form.catalog_opportunity_id,
        lead_id: form.lead_id || null,
        account_id: form.account_id || null,
        notes: form.notes,
        match_status_id: draft?.id,
        owner_id: u.user?.id,
      };
      const { data, error } = await (supabase as any).from("opportunity_matches").insert(payload).select("id").single();
      if (error) throw error;
      await writeWorkflowLog({ process: "match_create", objectType: "opportunity_matches", objectId: data.id, toStatus: "DRAFT", action: "create" });
      return data.id as string;
    },
    onSuccess: (id) => { toast.success("Match created"); setOpen(false); qc.invalidateQueries({ queryKey: ["matches"] }); nav({ to: `/matches/${id}` as any }); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = (rows as any[]).filter((r) => {
    if (statusFilter && r.match_status_id !== statusFilter) return false;
    if (search && !`${r.record_number ?? ""} ${r.opportunity_catalog?.title ?? ""} ${r.leads?.lead_name ?? ""} ${r.accounts?.account_name ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <PageHeader title="Opportunity Matches" subtitle="Lead/Account ↔ Catalog matches" actions={
        <>
          <div className="flex border rounded-md p-0.5">
            <Button size="sm" variant={view === "list" ? "secondary" : "ghost"} onClick={() => setView("list")}><ListIcon className="h-4 w-4" /></Button>
            <Button size="sm" variant={view === "board" ? "secondary" : "ghost"} onClick={() => setView("board")}><LayoutGrid className="h-4 w-4" /></Button>
          </div>
          <Button asChild variant="outline" size="sm"><Link to="/matches/workbench"><Wrench className="h-4 w-4 mr-1" />Workbench</Link></Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />New Match</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Match</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Catalog opportunity *</Label>
                  <select className="w-full h-9 border rounded px-2 text-sm bg-background" value={form.catalog_opportunity_id} onChange={(e) => setForm({ ...form, catalog_opportunity_id: e.target.value })}>
                    <option value="">Select…</option>
                    {(catalog as any[]).map((c) => <option key={c.id} value={c.id}>{c.record_number} — {c.title}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Lead</Label>
                    <select className="w-full h-9 border rounded px-2 text-sm bg-background" value={form.lead_id} onChange={(e) => setForm({ ...form, lead_id: e.target.value })}>
                      <option value="">—</option>
                      {(leads as any[]).map((l) => <option key={l.id} value={l.id}>{l.record_number} — {l.lead_name}</option>)}
                    </select>
                  </div>
                  <div><Label>Account</Label>
                    <select className="w-full h-9 border rounded px-2 text-sm bg-background" value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })}>
                      <option value="">—</option>
                      {(accounts as any[]).map((a) => <option key={a.id} value={a.id}>{a.record_number} — {a.account_name}</option>)}
                    </select>
                  </div>
                </div>
                <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button disabled={create.isPending || !form.catalog_opportunity_id} onClick={() => create.mutate()}>{create.isPending ? "Saving…" : "Create"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      } />
      <div className="p-4">
        <FilterBar search={search} onSearch={setSearch}>
          <select className="h-9 border rounded px-2 text-sm bg-background" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {(statuses as any[]).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </FilterBar>
        {view === "list" ? (
          <div className="bg-card border rounded-lg">
            {isLoading ? <div className="p-8 text-center text-muted-foreground">Loading…</div> :
              <DataTable rows={filtered as any} linkBase="/matches" columns={[
                { key: "record_number", header: "ID" },
                { key: "catalog", header: "Opportunity", render: (r: any) => r.opportunity_catalog?.title ?? "—" },
                { key: "subject", header: "Subject", render: (r: any) => r.leads?.lead_name ?? r.accounts?.account_name ?? "—" },
                { key: "eligibility_result", header: "Eligibility", render: (r: any) => r.eligibility_result ?? "—" },
                { key: "status", header: "Status", render: (r: any) => {
                  const s = (statuses as any[]).find((x) => x.id === r.match_status_id);
                  return <StatusBadge label={s?.name} color={s?.color} />;
                } },
              ]} />
            }
          </div>
        ) : (
          <KanbanBoard
            columns={(statuses as any[]).map((s) => ({ id: s.id, title: s.name, color: s.color }))}
            cards={(filtered as any[]).map((r) => ({ id: r.id, columnId: r.match_status_id ?? "", title: r.opportunity_catalog?.title ?? r.record_number, subtitle: r.leads?.lead_name ?? r.accounts?.account_name, meta: r.record_number }))}
            linkBase="/matches"
            onCardMove={async (cardId, fromColId, toColId) => {
              qc.setQueryData(["matches"], (old: any) =>
                Array.isArray(old) ? old.map((r: any) => (r.id === cardId ? { ...r, match_status_id: toColId } : r)) : old
              );
              const fromCode = (statuses as any[]).find((s) => s.id === fromColId)?.code;
              const toCode = (statuses as any[]).find((s) => s.id === toColId)?.code;
              const { error } = await (supabase as any).from("opportunity_matches").update({ match_status_id: toColId }).eq("id", cardId);
              if (error) { toast.error(error.message); qc.invalidateQueries({ queryKey: ["matches"] }); return; }
              await writeWorkflowLog({ process: "match_status_change", objectType: "opportunity_matches", objectId: cardId, fromStatus: fromCode, toStatus: toCode, action: "drag_drop" });
              toast.success(`Status → ${toCode}`);
            }}
          />
        )}
        <div className="text-xs text-muted-foreground mt-2">{filtered.length} record(s)</div>
      </div>
    </>
  );
}
