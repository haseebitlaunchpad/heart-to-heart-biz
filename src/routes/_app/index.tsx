import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/_app/")({ component: Dashboard });

const PIE_COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#06b6d4", "#84cc16"];

function KpiTile({ label, value, hint, to }: { label: string; value: number | string; hint?: string; to: string }) {
  return (
    <Link to={to as any} className="block bg-card border rounded-lg p-4 hover:border-primary hover:shadow-sm transition group">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-3xl font-semibold mt-1 group-hover:text-primary transition">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </Link>
  );
}

function useCount(table: string) {
  return useQuery({
    queryKey: ["count", table],
    queryFn: async () => {
      const { count } = await (supabase as any).from(table).select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
}

function useGroupCount(table: string, fkColumn: string, lookupTable: string, labelCol = "name") {
  return useQuery({
    queryKey: ["group", table, fkColumn, lookupTable],
    queryFn: async () => {
      const [{ data: rows = [] }, { data: lookups = [] }] = await Promise.all([
        (supabase as any).from(table).select(`${fkColumn}`).limit(1000),
        (supabase as any).from(lookupTable).select(`id, ${labelCol}, sort_order`),
      ]);
      const counts = new Map<string, number>();
      (rows as any[]).forEach((r) => {
        const k = r[fkColumn] ?? "—";
        counts.set(k, (counts.get(k) ?? 0) + 1);
      });
      return (lookups as any[])
        .sort((a, b) => (a.sort_order ?? 100) - (b.sort_order ?? 100))
        .map((l: any) => ({ name: l[labelCol], value: counts.get(l.id) ?? 0 }));
    },
  });
}

function Dashboard() {
  const leads = useCount("leads");
  const accounts = useCount("accounts");
  const contacts = useCount("contacts");
  const catalog = useCount("opportunity_catalog");
  const matches = useCount("opportunity_matches");
  const handoffs = useCount("handoffs");
  const activities = useCount("activities");

  const funnel = useGroupCount("leads", "lead_stage_id", "lead_stages");
  const matchStatus = useGroupCount("opportunity_matches", "match_status_id", "match_statuses");
  const handoffStatus = useGroupCount("handoffs", "handoff_status_id", "handoff_statuses");

  return (
    <>
      <PageHeader title="CRM Dashboard" subtitle="Senaei Investor Journey — Phase 1" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <KpiTile to="/leads" label="Leads" value={leads.data ?? "…"} />
          <KpiTile to="/accounts" label="Accounts" value={accounts.data ?? "…"} />
          <KpiTile to="/contacts" label="Contacts" value={contacts.data ?? "…"} />
          <KpiTile to="/catalog" label="Catalog" value={catalog.data ?? "…"} />
          <KpiTile to="/matches" label="Matches" value={matches.data ?? "…"} />
          <KpiTile to="/handoffs" label="Handoffs" value={handoffs.data ?? "…"} />
          <KpiTile to="/activities" label="Activities" value={activities.data ?? "…"} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm font-medium mb-3">Lead Funnel by Stage</div>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={funnel.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm font-medium mb-3">Matches by Status</div>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={matchStatus.data ?? []} dataKey="value" nameKey="name" outerRadius={90} label>
                    {(matchStatus.data ?? []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4 lg:col-span-2">
            <div className="text-sm font-medium mb-3">Handoffs by Status</div>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={handoffStatus.data ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
