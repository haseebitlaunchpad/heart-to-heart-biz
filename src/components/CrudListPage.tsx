import { ReactNode, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export type FieldDef = { name: string; label: string; type?: "text" | "textarea" | "number" | "email"; required?: boolean };

export function CrudListPage<T extends { id: string }>({
  title, subtitle, table, columns, fields, defaultValues = {},
}: {
  title: string; subtitle?: string; table: string;
  columns: Column<T>[]; fields: FieldDef[]; defaultValues?: Record<string, any>;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, any>>(defaultValues);
  const [filter, setFilter] = useState("");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: [table, "list"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from(table).select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data as T[];
    },
  });

  const createM = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await (supabase as any).from(table).insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast.success("Created");
      setOpen(false); setForm(defaultValues);
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to create"),
  });

  const deleteM = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from(table).update({ is_archived: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [table] }); toast.success("Archived"); },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const filtered = rows.filter((r: any) =>
    !filter || JSON.stringify(r).toLowerCase().includes(filter.toLowerCase())
  ).filter((r: any) => !r.is_archived);

  const cols: Column<T>[] = [
    ...columns,
    { key: "_actions", header: "", render: (r) => (
      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteM.mutate(r.id); }}>
        Archive
      </Button>
    ) },
  ];

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> New</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create {title.replace(/s$/, "")}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {fields.map((f) => (
                  <div key={f.name}>
                    <label className="text-xs text-muted-foreground">{f.label}{f.required && " *"}</label>
                    <Input
                      type={f.type === "number" ? "number" : f.type === "email" ? "email" : "text"}
                      value={form[f.name] ?? ""}
                      onChange={(e) => setForm({ ...form, [f.name]: f.type === "number" ? Number(e.target.value) : e.target.value })}
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => createM.mutate(form)} disabled={createM.isPending}>
                  {createM.isPending ? "Saving…" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="p-4">
        <Input
          placeholder="Filter…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mb-3 max-w-sm"
        />
        <div className="bg-card border rounded-lg">
          {isLoading ? <div className="p-8 text-center text-muted-foreground">Loading…</div>
            : <DataTable rows={filtered} columns={cols} />}
        </div>
        <div className="text-xs text-muted-foreground mt-2">{filtered.length} record(s)</div>
      </div>
    </>
  );
}
