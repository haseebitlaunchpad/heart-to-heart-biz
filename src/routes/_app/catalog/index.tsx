import { createFileRoute } from "@tanstack/react-router";
import { CrudListPage } from "@/components/CrudListPage";

export const Route = createFileRoute("/_app/catalog/")({
  component: () => (
    <CrudListPage
      title="Opportunity Catalog" subtitle="Land, factories, funding, incentives" table="opportunity_catalog"
      columns={[
        { key: "record_number", header: "ID" },
        { key: "title", header: "Title" },
        { key: "site_name", header: "Site" },
        { key: "min_investment", header: "Min Investment" },
        { key: "max_investment", header: "Max Investment" },
      ]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "site_name", label: "Site Name" },
        { name: "min_investment", label: "Min Investment", type: "number" },
        { name: "max_investment", label: "Max Investment", type: "number" },
        { name: "expected_benefit", label: "Expected Benefit" },
      ]}
    />
  ),
});
