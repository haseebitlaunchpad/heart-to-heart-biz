import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useLookup } from "@/lib/lookups";
import { writeWorkflowLog } from "@/lib/logs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { FieldDef, Section } from "@/lib/recordSchemas";

function LookupSelect({ table, orderBy, value, onChange }: { table: string; orderBy?: string; value: any; onChange: (v: string | null) => void }) {
  const { data = [], isLoading, error } = useLookup(table, { orderBy });
  if (error) return <Input disabled value={`(missing table: ${table})`} />;
  return (
    <select className="w-full h-9 border rounded px-2 text-sm bg-background"
      value={value ?? ""}
      disabled={isLoading}
      onChange={(e) => onChange(e.target.value || null)}>
      <option value="">— none —</option>
      {(data as any[]).map((r) => <option key={r.id} value={r.id}>{r.name ?? r.code ?? r.id}</option>)}
    </select>
  );
}

function FieldInput({ f, value, onChange }: { f: FieldDef; value: any; onChange: (v: any) => void }) {
  if (f.type === "textarea") return <Textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={3} />;
  if (f.type === "checkbox") return (
    <div className="h-9 flex items-center"><Checkbox checked={!!value} onCheckedChange={(v) => onChange(!!v)} /></div>
  );
  if (f.type === "lookup") return <LookupSelect table={f.table} orderBy={f.orderBy} value={value} onChange={onChange} />;
  if (f.type === "enum") return (
    <select className="w-full h-9 border rounded px-2 text-sm bg-background" value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">— none —</option>
      {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
  if (f.type === "tags") {
    const arr: string[] = Array.isArray(value) ? value : [];
    return <Input value={arr.join(", ")} placeholder="comma,separated"
      onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />;
  }
  if (f.type === "number") return <Input type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />;
  if (f.type === "date") return <Input type="date" value={value ? String(value).slice(0, 10) : ""} onChange={(e) => onChange(e.target.value || null)} />;
  if (f.type === "datetime") return <Input type="datetime-local" value={value ? String(value).slice(0, 16) : ""} onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)} />;
  return <Input type={f.type === "email" ? "email" : f.type === "tel" ? "tel" : f.type === "url" ? "url" : "text"} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
}

export function RecordEditor({
  table, recordId, record, sections, queryKey,
}: {
  table: string;
  recordId: string;
  record: any;
  sections: Section[];
  queryKey: any[];
}) {
  const qc = useQueryClient();
  const initial = useMemo(() => {
    const o: any = {};
    sections.forEach((s) => s.fields.forEach((f) => { o[f.key] = record?.[f.key] ?? null; }));
    return o;
  }, [record, sections]);
  const [form, setForm] = useState<any>(initial);
  const [saving, setSaving] = useState(false);

  const save = useMutation({
    mutationFn: async () => {
      const patch: any = {};
      const changes: { key: string; from: any; to: any }[] = [];
      Object.keys(form).forEach((k) => {
        const a = initial[k]; const b = form[k];
        if (JSON.stringify(a ?? null) !== JSON.stringify(b ?? null)) {
          patch[k] = b;
          changes.push({ key: k, from: a, to: b });
        }
      });
      if (!Object.keys(patch).length) return { changes: [] };
      const { error } = await (supabase as any).from(table).update(patch).eq("id", recordId);
      if (error) throw error;
      // Per-field workflow_logs
      for (const c of changes) {
        try {
          await writeWorkflowLog({
            process: "field_update",
            objectType: table,
            objectId: recordId,
            action: "edit",
            fromStatus: c.from == null ? null : String(c.from).slice(0, 100),
            toStatus: c.to == null ? null : String(c.to).slice(0, 100),
            comments: c.key,
          });
        } catch { /* non-blocking */ }
      }
      return { changes };
    },
    onSuccess: ({ changes }) => {
      qc.invalidateQueries({ queryKey });
      qc.invalidateQueries({ queryKey: ["workflow", table, recordId] });
      qc.invalidateQueries({ queryKey: ["audit", table, recordId] });
      if (changes && changes.length) toast.success(`Saved ${changes.length} change${changes.length > 1 ? "s" : ""}`);
      else toast.message("No changes");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const dirty = useMemo(() => {
    return Object.keys(form).some((k) => JSON.stringify(form[k] ?? null) !== JSON.stringify(initial[k] ?? null));
  }, [form, initial]);

  return (
    <div className="space-y-4 max-w-4xl pb-6">
      {dirty && (
        <div className="sticky top-0 z-10 -mx-1 px-3 py-2 bg-amber-50 border border-amber-300 rounded flex items-center justify-between">
          <span className="text-xs text-amber-900">You have unsaved changes</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" disabled={saving} onClick={() => setForm(initial)}>Discard</Button>
            <Button size="sm" disabled={saving} onClick={async () => { setSaving(true); try { await save.mutateAsync(); } finally { setSaving(false); } }}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      )}
      {sections.map((s) => (
        <div key={s.title} className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">{s.title}</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {s.fields.map((f) => (
              <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                <Label className="text-xs">{f.label}</Label>
                <div className="mt-1">
                  <FieldInput f={f} value={form[f.key]} onChange={(v) => setForm({ ...form, [f.key]: v })} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
