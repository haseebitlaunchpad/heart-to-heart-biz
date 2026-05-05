import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/admin/")({ component: AdminPage });

const SETUP_TABLES = [
  "lead_stages","lead_statuses","lead_temperatures","lead_source_channels",
  "lead_disqualification_reasons","lead_nurture_reasons",
  "account_categories","account_statuses","investor_types","contact_roles",
  "activity_types","activity_statuses","activity_outcomes",
  "approval_statuses","handoff_statuses","handoff_checklist_items",
  "match_statuses","integration_statuses",
  "investment_size_bands","investment_paths","investment_timelines",
  "funding_sources","funding_statuses","lifecycle_phases",
  "countries","cities","currencies","languages","communication_channels",
];

function AdminPage() {
  return (
    <>
      <PageHeader title="Admin & Setup" subtitle="Users, roles, and reference data" />
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-sm font-semibold mb-2">Access control</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link to="/admin/users" className="bg-card border rounded-lg p-4 hover:bg-accent/50 transition block">
              <div className="text-sm font-medium">Users</div>
              <div className="text-xs text-muted-foreground mt-1">Assign roles to users</div>
            </Link>
            <Link to="/admin/roles" className="bg-card border rounded-lg p-4 hover:bg-accent/50 transition block">
              <div className="text-sm font-medium">Roles & Permissions</div>
              <div className="text-xs text-muted-foreground mt-1">Toggle CRUD &amp; status permissions per role</div>
            </Link>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold mb-2">Reference data</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SETUP_TABLES.map((t) => <SetupCard key={t} table={t} />)}
          </div>
        </div>
      </div>
    </>
  );
}

function SetupCard({ table }: { table: string }) {
  const { data: count } = useQuery({
    queryKey: ["setup-count", table],
    queryFn: async () => {
      const { count } = await (supabase as any).from(table).select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  return (
    <Link
      to="/admin/$table"
      params={{ table }}
      className="bg-card border rounded-lg p-4 hover:bg-accent/50 transition block"
    >
      <div className="text-sm font-medium capitalize">{table.replace(/_/g, " ")}</div>
      <div className="text-2xl font-semibold mt-1">{count ?? "…"}</div>
      <div className="text-xs text-muted-foreground">records — click to manage</div>
    </Link>
  );
}
