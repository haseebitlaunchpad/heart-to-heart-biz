import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/logs")({ component: LogsPage });

const TABS = [
  { key: "audit", label: "Audit", table: "audit_logs", ts: "changed_at" },
  { key: "workflow", label: "Workflow", table: "workflow_logs", ts: "logged_at" },
  { key: "integration", label: "Integration", table: "integration_logs", ts: "triggered_at" },
  { key: "duplicate", label: "Duplicate", table: "duplicate_logs", ts: "decided_at" },
  { key: "security", label: "Security", table: "security_logs", ts: "logged_at" },
];

function LogTable({ table, ts }: { table: string; ts: string }) {
  const { data: rows = [], isError } = useQuery({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from(table).select("*").order(ts, { ascending: false }).limit(100);
      if (error) throw error;
      return data ?? [];
    },
    retry: false,
  });

  if (isError) return <div className="p-6 text-sm text-muted-foreground">No access or table not available.</div>;
  if (!rows.length) return <div className="p-6 text-sm text-muted-foreground">No records.</div>;

  const cols = Object.keys(rows[0]).filter((c) => c !== "id");

  return (
    <div className="bg-card border rounded-lg overflow-auto">
      <table className="w-full text-xs">
        <thead className="bg-muted/50 uppercase text-muted-foreground">
          <tr>{cols.map((c) => <th key={c} className="text-left px-3 py-2 font-medium">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r: any, i: number) => (
            <tr key={i} className="border-t">
              {cols.map((c) => {
                const v = r[c];
                const display = v === null || v === undefined ? "—"
                  : typeof v === "object" ? JSON.stringify(v).slice(0, 80)
                  : (c.endsWith("_at") || c === ts) ? new Date(v).toLocaleString()
                  : String(v);
                return <td key={c} className="px-3 py-2 max-w-[280px] truncate">{display}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LogsPage() {
  const [tab, setTab] = useState("audit");

  return (
    <>
      <PageHeader title="System Logs" subtitle="Audit, workflow, integration, duplicate and security trails" />
      <div className="p-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {TABS.map((t) => <TabsTrigger key={t.key} value={t.key}>{t.label}</TabsTrigger>)}
          </TabsList>
          {TABS.map((t) => (
            <TabsContent key={t.key} value={t.key} className="mt-4">
              <LogTable table={t.table} ts={t.ts} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
}