import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/")({ component: Dashboard });

function Card({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="text-3xl font-semibold mt-1">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
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

function Dashboard() {
  const leads = useCount("leads");
  const accounts = useCount("accounts");
  const contacts = useCount("contacts");
  const catalog = useCount("opportunity_catalog");
  const matches = useCount("opportunity_matches");
  const handoffs = useCount("handoffs");
  const activities = useCount("activities");

  return (
    <>
      <PageHeader title="CRM Dashboard" subtitle="Phase 1 POC — Senaei Investor Journey" />
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card label="Leads" value={leads.data ?? "…"} />
        <Card label="Accounts" value={accounts.data ?? "…"} />
        <Card label="Contacts" value={contacts.data ?? "…"} />
        <Card label="Catalog" value={catalog.data ?? "…"} />
        <Card label="Matches" value={matches.data ?? "…"} />
        <Card label="Handoffs" value={handoffs.data ?? "…"} />
        <Card label="Activities" value={activities.data ?? "…"} />
      </div>
    </>
  );
}
