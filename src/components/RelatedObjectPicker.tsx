import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type Kind = { table: string; label: string; nameCol: string; secondaryCols?: string[] };

const KINDS: Kind[] = [
  { table: "leads", label: "Leads", nameCol: "lead_name", secondaryCols: ["company_name", "email"] },
  { table: "accounts", label: "Accounts", nameCol: "account_name", secondaryCols: ["primary_email"] },
  { table: "contacts", label: "Contacts", nameCol: "full_name", secondaryCols: ["email"] },
  { table: "opportunity_matches", label: "Matches", nameCol: "record_number" },
  { table: "handoffs", label: "Handoffs", nameCol: "record_number" },
];

export function RelatedObjectPicker({
  open, onOpenChange, onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPick: (table: string, id: string) => void | Promise<void>;
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Kind>(KINDS[0]);

  const { data: rows = [] } = useQuery({
    queryKey: ["picker", active.table, q],
    enabled: open,
    queryFn: async () => {
      const cols = ["record_number", active.nameCol, ...(active.secondaryCols ?? [])].join(", ");
      let query = (supabase as any).from(active.table).select(`id, ${cols}`).limit(20);
      if (q.trim()) {
        const pattern = `%${q.trim()}%`;
        const ors = ["record_number", active.nameCol, ...(active.secondaryCols ?? [])]
          .map((c) => `${c}.ilike.${pattern}`).join(",");
        query = query.or(ors);
      }
      const { data } = await query;
      return data ?? [];
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Link to record</DialogTitle></DialogHeader>
        <div className="flex gap-2 flex-wrap">
          {KINDS.map((k) => (
            <button key={k.table} onClick={() => setActive(k)} className={`text-xs px-3 py-1 rounded border ${active.table === k.table ? "bg-primary text-primary-foreground border-primary" : "bg-background"}`}>
              {k.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${active.label.toLowerCase()}…`} className="pl-9" />
        </div>
        <div className="max-h-72 overflow-y-auto border rounded">
          {(rows as any[]).length === 0 && <div className="p-4 text-sm text-muted-foreground text-center">No matches</div>}
          {(rows as any[]).map((r) => (
            <button key={r.id} onClick={() => onPick(active.table, r.id)} className="w-full text-left px-3 py-2 hover:bg-accent border-b last:border-b-0">
              <div className="text-sm font-medium">{r.record_number ?? r[active.nameCol]}</div>
              <div className="text-xs text-muted-foreground">
                {[r[active.nameCol], ...(active.secondaryCols ?? []).map((c) => r[c])].filter(Boolean).join(" · ")}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
