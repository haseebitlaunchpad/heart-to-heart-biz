import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/admin/$table")({ component: TableEditor });

function TableEditor() {
  const { table } = Route.useParams();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<any>({ code: "", name: "", is_active: true });

  const { data: rows = [] } = useQuery({
    queryKey: ["lookup", table],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from(table).select("*").order("sort_order", { ascending: true, nullsFirst: false });
      if (error) {
        const { data: d2 } = await (supabase as any).from(table).select("*").order("name", { ascending: true });
        return d2 ?? [];
      }
      return data ?? [];
    },
  });

  const insert = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await (supabase as any).from(table).insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lookup", table] });
      toast.success("Added");
      setAdding(false);
      setDraft({ code: "", name: "", is_active: true });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) => {
      const { error } = await (supabase as any).from(table).update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lookup", table] }),
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lookup", table] }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  const sample = rows[0] ?? {};
  const cols = Object.keys(sample).filter((c) => !["id", "created_at", "updated_at"].includes(c));

  return (
    <>
      <PageHeader
        title={table.replace(/_/g, " ")}
        subtitle="Manage reference data"
        actions={
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/admin"><ArrowLeft className="h-4 w-4 mr-1" /> All tables</Link></Button>
            <Button size="sm" onClick={() => setAdding(true)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </div>
        }
      />
      <div className="p-4 space-y-4">
        {adding && (
          <div className="bg-card border rounded-lg p-4 space-y-3">
            <div className="text-sm font-medium">New record</div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Code</Label><Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} /></div>
              <div><Label>Name</Label><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={draft.is_active} onCheckedChange={(v) => setDraft({ ...draft, is_active: v })} /><span className="text-sm">Active</span></div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => insert.mutate(draft)} disabled={insert.isPending}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="bg-card border rounded-lg overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                {cols.map((c) => <th key={c} className="text-left px-3 py-2 font-medium">{c}</th>)}
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.id} className="border-t">
                  {cols.map((c) => (
                    <td key={c} className="px-3 py-2">
                      {typeof r[c] === "boolean" ? (
                        <Switch checked={r[c]} onCheckedChange={(v) => update.mutate({ id: r.id, patch: { [c]: v } })} />
                      ) : (
                        <span className="text-muted-foreground">{r[c] === null ? "—" : String(r[c])}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete?")) del.mutate(r.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={cols.length + 1} className="text-center text-muted-foreground py-8">No records</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
