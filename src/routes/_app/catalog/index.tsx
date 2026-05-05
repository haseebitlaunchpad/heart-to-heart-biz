import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { writeWorkflowLog } from "@/lib/logs";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/catalog/")({ component: CatalogList });

function CatalogList() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({
    title: "", description: "", site_name: "",
    min_investment: "", max_investment: "", expected_benefit: "",
  });

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["catalog"],
    queryFn: async () => (await supabase.from("opportunity_catalog").select("*").eq("is_archived", false).order("created_at", { ascending: false }).limit(500)).data ?? [],
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const payload: any = {
        title: form.title, description: form.description, site_name: form.site_name,
        expected_benefit: form.expected_benefit, owner_id: u.user?.id, created_by: u.user?.id,
      };
      if (form.min_investment) payload.min_investment = Number(form.min_investment);
      if (form.max_investment) payload.max_investment = Number(form.max_investment);
      const { data, error } = await (supabase as any).from("opportunity_catalog").insert(payload).select("id").single();
      if (error) throw error;
      await writeWorkflowLog({ process: "catalog_create", objectType: "opportunity_catalog", objectId: data.id, action: "create" });
      return data.id as string;
    },
    onSuccess: (id) => { toast.success("Catalog item created"); setOpen(false); qc.invalidateQueries({ queryKey: ["catalog"] }); nav({ to: `/catalog/${id}` as any }); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = (rows as any[]).filter((r) =>
    !search || `${r.title} ${r.site_name ?? ""} ${r.record_number ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader title="Opportunity Catalog" subtitle="Land, factories, funding, programs and incentives" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />New Opportunity</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Catalog Opportunity</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Site name</Label><Input value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} /></div>
                <div><Label>Expected benefit</Label><Input value={form.expected_benefit} onChange={(e) => setForm({ ...form, expected_benefit: e.target.value })} /></div>
                <div><Label>Min investment</Label><Input type="number" value={form.min_investment} onChange={(e) => setForm({ ...form, min_investment: e.target.value })} /></div>
                <div><Label>Max investment</Label><Input type="number" value={form.max_investment} onChange={(e) => setForm({ ...form, max_investment: e.target.value })} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button disabled={!form.title || create.isPending} onClick={() => create.mutate()}>{create.isPending ? "Saving…" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      } />
      <div className="p-4">
        <FilterBar search={search} onSearch={setSearch} />
        <div className="bg-card border rounded-lg">
          {isLoading ? <div className="p-8 text-center text-muted-foreground">Loading…</div> :
            <DataTable rows={filtered as any} linkBase="/catalog" columns={[
              { key: "record_number", header: "ID" },
              { key: "title", header: "Title" },
              { key: "site_name", header: "Site" },
              { key: "min_investment", header: "Min", render: (r: any) => r.min_investment ? Number(r.min_investment).toLocaleString() : "—" },
              { key: "max_investment", header: "Max", render: (r: any) => r.max_investment ? Number(r.max_investment).toLocaleString() : "—" },
              { key: "status", header: "Status", render: (r: any) => <StatusBadge label={r.status_id ? "Set" : "Draft"} tone="info" /> },
            ]} />
          }
        </div>
        <div className="text-xs text-muted-foreground mt-2">{filtered.length} record(s)</div>
      </div>
    </>
  );
}
