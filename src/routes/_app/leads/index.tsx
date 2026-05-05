import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLookup } from "@/lib/lookups";
import { writeWorkflowLog } from "@/lib/logs";
import { Plus, LayoutGrid, List as ListIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/leads/")({ component: LeadsList });

function LeadsList() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [view, setView] = useState<"list" | "board">("list");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [tempFilter, setTempFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ lead_name: "", company_name: "", email: "", mobile: "", interest_notes: "" });

  const { data: stages = [] } = useLookup("lead_stages", { orderBy: "sort_order" });
  const { data: temps = [] } = useLookup("lead_temperatures", { orderBy: "sort_order" });
  const { data: statuses = [] } = useLookup("lead_statuses", { orderBy: "sort_order" });

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").eq("is_archived", false).order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const newStage = (stages as any[]).find((s) => s.code === "NEW");
      const openStatus = (statuses as any[]).find((s) => s.code === "OPEN");
      const { data, error } = await (supabase as any).from("leads").insert({
        ...form, lead_stage_id: newStage?.id, lead_status_id: openStatus?.id,
        owner_id: u.user?.id, created_by: u.user?.id, captured_by: u.user?.id, source_system: "manual",
      }).select("id").single();
      if (error) throw error;
      await writeWorkflowLog({ process: "lead_create", objectType: "leads", objectId: data.id, toStatus: "NEW", action: "create" });
      return data.id as string;
    },
    onSuccess: (id) => { toast.success("Lead created"); setOpen(false); qc.invalidateQueries({ queryKey: ["leads"] }); nav({ to: `/leads/${id}` as any }); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = (rows as any[]).filter((r) => {
    if (stageFilter && r.lead_stage_id !== stageFilter) return false;
    if (tempFilter && r.qualification_temperature_id !== tempFilter) return false;
    if (search && !`${r.lead_name} ${r.company_name ?? ""} ${r.email ?? ""} ${r.record_number ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        title="Leads"
        subtitle="Investor and prospect intake"
        actions={
          <>
            <div className="flex border rounded-md p-0.5">
              <Button size="sm" variant={view === "list" ? "secondary" : "ghost"} onClick={() => setView("list")}><ListIcon className="h-4 w-4" /></Button>
              <Button size="sm" variant={view === "board" ? "secondary" : "ghost"} onClick={() => setView("board")}><LayoutGrid className="h-4 w-4" /></Button>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />New Lead</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Lead</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Lead name *</Label><Input value={form.lead_name} onChange={(e) => setForm({ ...form, lead_name: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Company</Label><Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} /></div>
                    <div><Label>Mobile</Label><Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></div>
                  </div>
                  <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  <div><Label>Interest notes</Label><Textarea value={form.interest_notes} onChange={(e) => setForm({ ...form, interest_notes: e.target.value })} /></div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button disabled={!form.lead_name || create.isPending} onClick={() => create.mutate()}>{create.isPending ? "Saving…" : "Create"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />
      <div className="p-4">
        <FilterBar search={search} onSearch={setSearch}>
          <select className="h-9 border rounded px-2 text-sm bg-background" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
            <option value="">All stages</option>
            {(stages as any[]).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="h-9 border rounded px-2 text-sm bg-background" value={tempFilter} onChange={(e) => setTempFilter(e.target.value)}>
            <option value="">All temperatures</option>
            {(temps as any[]).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </FilterBar>
        {view === "list" ? (
          <div className="bg-card border rounded-lg">
            {isLoading ? <div className="p-8 text-center text-muted-foreground">Loading…</div> :
              <DataTable
                rows={filtered as any}
                linkBase="/leads"
                columns={[
                  { key: "record_number", header: "ID" },
                  { key: "lead_name", header: "Name" },
                  { key: "company_name", header: "Company" },
                  { key: "email", header: "Email" },
                  { key: "mobile", header: "Mobile" },
                  { key: "stage", header: "Stage", render: (r: any) => {
                    const s = (stages as any[]).find((x) => x.id === r.lead_stage_id);
                    return <StatusBadge label={s?.name} color={s?.color} />;
                  } },
                  { key: "temp", header: "Temp", render: (r: any) => {
                    const s = (temps as any[]).find((x) => x.id === r.qualification_temperature_id);
                    return <StatusBadge label={s?.name} color={s?.color} />;
                  } },
                  { key: "lead_score", header: "Score" },
                ]}
              />
            }
          </div>
        ) : (
          <KanbanBoard
            columns={(stages as any[]).map((s) => ({ id: s.id, title: s.name, color: s.color }))}
            cards={(filtered as any[]).map((r) => ({ id: r.id, columnId: r.lead_stage_id ?? "", title: r.lead_name, subtitle: r.company_name ?? r.email, meta: r.record_number }))}
            linkBase="/leads"
          />
        )}
        <div className="text-xs text-muted-foreground mt-2">{filtered.length} record(s)</div>
      </div>
    </>
  );
}
