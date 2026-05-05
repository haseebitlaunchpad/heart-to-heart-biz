import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem,
} from "@/components/ui/command";
import { Search } from "lucide-react";

type Hit = { id: string; label: string; sub?: string; to: string; group: string };

const SOURCES: Array<{
  table: string; group: string; route: string;
  cols: string; format: (r: any) => { label: string; sub?: string };
  searchCols: string[];
}> = [
  { table: "leads", group: "Leads", route: "/leads",
    cols: "id, record_number, lead_name, company_name, email",
    searchCols: ["lead_name", "company_name", "email", "record_number"],
    format: (r) => ({ label: `${r.record_number} · ${r.lead_name ?? "—"}`, sub: r.company_name ?? r.email }) },
  { table: "accounts", group: "Accounts", route: "/accounts",
    cols: "id, record_number, account_name",
    searchCols: ["account_name", "record_number"],
    format: (r) => ({ label: `${r.record_number} · ${r.account_name ?? "—"}` }) },
  { table: "contacts", group: "Contacts", route: "/contacts",
    cols: "id, record_number, full_name, email",
    searchCols: ["full_name", "email", "record_number"],
    format: (r) => ({ label: `${r.record_number} · ${r.full_name ?? "—"}`, sub: r.email }) },
  { table: "opportunity_catalog", group: "Catalog", route: "/catalog",
    cols: "id, record_number, title",
    searchCols: ["title", "record_number"],
    format: (r) => ({ label: `${r.record_number} · ${r.title ?? "—"}` }) },
  { table: "opportunity_matches", group: "Matches", route: "/matches",
    cols: "id, record_number",
    searchCols: ["record_number"],
    format: (r) => ({ label: r.record_number }) },
  { table: "handoffs", group: "Handoffs", route: "/handoffs",
    cols: "id, record_number",
    searchCols: ["record_number"],
    format: (r) => ({ label: r.record_number }) },
  { table: "activities", group: "Activities", route: "/activities",
    cols: "id, record_number, subject",
    searchCols: ["subject", "record_number"],
    format: (r) => ({ label: `${r.record_number} · ${r.subject ?? "—"}` }) },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const term = q.trim();
    if (term.length < 2) { setHits([]); return; }
    let cancel = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const results: Hit[] = [];
      await Promise.all(SOURCES.map(async (src) => {
        const or = src.searchCols.map((c) => `${c}.ilike.%${term}%`).join(",");
        const { data } = await (supabase as any).from(src.table).select(src.cols).or(or).limit(5);
        (data ?? []).forEach((r: any) => {
          const f = src.format(r);
          results.push({ id: `${src.table}:${r.id}`, label: f.label, sub: f.sub, to: `${src.route}/${r.id}`, group: src.group });
        });
      }));
      if (!cancel) { setHits(results); setLoading(false); }
    }, 180);
    return () => { cancel = true; clearTimeout(t); };
  }, [q, open]);

  const grouped = hits.reduce<Record<string, Hit[]>>((acc, h) => {
    (acc[h.group] ??= []).push(h); return acc;
  }, {});

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 flex-1 max-w-xl text-left px-3 h-9 rounded-md border bg-background text-sm text-muted-foreground hover:bg-accent transition"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1">Search leads, accounts, contacts…</span>
        <kbd className="text-[10px] px-1.5 py-0.5 rounded border bg-muted">⌘K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type to search across CRM…" value={q} onValueChange={setQ} />
        <CommandList>
          {loading && <div className="p-3 text-xs text-muted-foreground">Searching…</div>}
          {!loading && q.length >= 2 && hits.length === 0 && <CommandEmpty>No results.</CommandEmpty>}
          {!loading && q.length < 2 && <div className="p-3 text-xs text-muted-foreground">Type at least 2 characters.</div>}
          {Object.entries(grouped).map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map((h) => (
                <CommandItem key={h.id} value={h.id} onSelect={() => { setOpen(false); nav({ to: h.to as any }); }}>
                  <div className="flex flex-col">
                    <span>{h.label}</span>
                    {h.sub && <span className="text-xs text-muted-foreground">{h.sub}</span>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
