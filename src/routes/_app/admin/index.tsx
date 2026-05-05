import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/admin/")({ component: AdminPage });

const SETUP_TABLES = [
  "lead_stages","lead_statuses","lead_temperatures","lead_source_channels",
  "account_categories","account_statuses","investor_types","contact_roles",
  "activity_types","activity_statuses","approval_statuses","handoff_statuses",
  "investment_size_bands","investment_paths","sectors","sub_sectors",
  "countries","regions","cities","currencies","communication_channels",
];

function AdminPage() {
  return (
    <>
      <PageHeader title="Admin & Setup" subtitle="Reference data and system configuration" />
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        {SETUP_TABLES.map((t) => <SetupCard key={t} table={t} />)}
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
    <div className="bg-card border rounded-lg p-4">
      <div className="text-sm font-medium">{table.replace(/_/g, " ")}</div>
      <div className="text-2xl font-semibold mt-1">{count ?? "…"}</div>
      <div className="text-xs text-muted-foreground">records</div>
    </div>
  );
}
