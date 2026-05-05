import { createFileRoute } from "@tanstack/react-router";
import { CrudListPage } from "@/components/CrudListPage";

export const Route = createFileRoute("/_app/matches/")({
  component: () => (
    <CrudListPage
      title="Opportunity Matches" subtitle="Lead/Account ↔ Catalog matches" table="opportunity_matches"
      columns={[
        { key: "record_number", header: "ID" },
        { key: "notes", header: "Notes" },
        { key: "created_at", header: "Created", render: (r: any) => new Date(r.created_at).toLocaleDateString() },
      ]}
      fields={[
        { name: "notes", label: "Notes", type: "textarea" },
      ]}
    />
  ),
});
