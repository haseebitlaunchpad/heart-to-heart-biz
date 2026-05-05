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
import { Plus } from "lucide-react";
import { useState } from "react";
import { useLookup } from "@/lib/lookups";
import { writeWorkflowLog } from "@/lib/logs";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/accounts/")({ component: AccountsList });

function AccountsList() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ account_name: "", company_name: "", primary_email: "", primary_mobile: "", cr_number: "" });
  const { data: statuses = [] } = useLookup("account_statuses");
  const { data: invTypes = [] } = useLookup("investor_types");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => (await supabase.from("accounts").select("*").eq("is_archived", false).order("created_at", { ascending: false }).limit(500)).data ?? [],
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await (supabase as any).from("accounts").insert({ ...form, owner_id: u.user?.id, created_by: u.user?.id }).select("id").single();
      if (error) throw error;
      await writeWorkflowLog({ process: "account_create", objectType: "accounts", objectId: data.id, action: "create" });
      return data.id as string;
    },
    onSuccess: (id) => { toast.success("Account created"); setOpen(false); qc.invalidateQueries({ queryKey: ["accounts"] }); nav({ to: `/accounts/${id}` as any }); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = (rows as any[]).filter((r) => !search || `${r.account_name} ${r.company_name ?? ""} ${r.cr_number ?? ""} ${r.record_number ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <PageHeader title="Accounts" subtitle="Prospects and investors" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />New Account</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Account</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Account name *</Label><Input value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} /></div>
              <div><Label>Company</Label><Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email</Label><Input value={form.primary_email} onChange={(e) => setForm({ ...form, primary_email: e.target.value })} /></div>
                <div><Label>Mobile</Label><Input value={form.primary_mobile} onChange={(e) => setForm({ ...form, primary_mobile: e.target.value })} /></div>
              </div>
              <div><Label>CR Number</Label><Input value={form.cr_number} onChange={(e) => setForm({ ...form, cr_number: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button disabled={!form.account_name || create.isPending} onClick={() => create.mutate()}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      } />
      <div className="p-4">
        <FilterBar search={search} onSearch={setSearch} />
        <div className="bg-card border rounded-lg">
          {isLoading ? <div className="p-8 text-center text-muted-foreground">Loading…</div> :
            <DataTable rows={filtered as any} linkBase="/accounts" columns={[
              { key: "record_number", header: "ID" },
              { key: "account_name", header: "Name" },
              { key: "company_name", header: "Company" },
              { key: "primary_email", header: "Email" },
              { key: "primary_mobile", header: "Mobile" },
              { key: "type", header: "Type", render: (r: any) => <StatusBadge label={(invTypes as any[]).find((x) => x.id === r.investor_type_id)?.name} tone="info" /> },
              { key: "status", header: "Status", render: (r: any) => <StatusBadge label={(statuses as any[]).find((x) => x.id === r.account_status_id)?.name} /> },
            ]} />
          }
        </div>
        <div className="text-xs text-muted-foreground mt-2">{filtered.length} record(s)</div>
      </div>
    </>
  );
}
