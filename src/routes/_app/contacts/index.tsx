import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/contacts/")({ component: ContactsList });

function ContactsList() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ full_name: "", email: "", mobile: "", job_title: "" });

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => (await supabase.from("contacts").select("*").eq("is_archived", false).order("created_at", { ascending: false }).limit(500)).data ?? [],
  });
  const create = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await (supabase as any).from("contacts").insert({ ...form, owner_id: u.user?.id, created_by: u.user?.id }).select("id").single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (id) => { toast.success("Contact created"); setOpen(false); qc.invalidateQueries({ queryKey: ["contacts"] }); nav({ to: `/contacts/${id}` as any }); },
    onError: (e: any) => toast.error(e.message),
  });
  const filtered = (rows as any[]).filter((r) => !search || `${r.full_name} ${r.email ?? ""} ${r.mobile ?? ""} ${r.record_number ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <PageHeader title="Contacts" subtitle="People associated with leads or accounts" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />New Contact</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Contact</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Full name *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Mobile</Label><Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></div>
              </div>
              <div><Label>Job title</Label><Input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button disabled={!form.full_name || create.isPending} onClick={() => create.mutate()}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      } />
      <div className="p-4">
        <FilterBar search={search} onSearch={setSearch} />
        <div className="bg-card border rounded-lg">
          {isLoading ? <div className="p-8 text-center text-muted-foreground">Loading…</div> :
            <DataTable rows={filtered as any} linkBase="/contacts" columns={[
              { key: "record_number", header: "ID" },
              { key: "full_name", header: "Name" },
              { key: "job_title", header: "Title" },
              { key: "email", header: "Email" },
              { key: "mobile", header: "Mobile" },
            ]} />
          }
        </div>
      </div>
    </>
  );
}
