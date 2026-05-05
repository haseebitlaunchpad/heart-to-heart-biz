import { createFileRoute } from "@tanstack/react-router";
import { CrudListPage } from "@/components/CrudListPage";

export const Route = createFileRoute("/_app/leads/")({
  component: () => (
    <CrudListPage
      title="Leads" subtitle="Investor and prospect intake" table="leads"
      columns={[
        { key: "record_number", header: "ID" },
        { key: "lead_name", header: "Name" },
        { key: "company_name", header: "Company" },
        { key: "email", header: "Email" },
        { key: "mobile", header: "Mobile" },
        { key: "lead_score", header: "Score" },
        { key: "priority", header: "Priority" },
      ]}
      fields={[
        { name: "lead_name", label: "Lead Name", required: true },
        { name: "company_name", label: "Company" },
        { name: "email", label: "Email", type: "email" },
        { name: "mobile", label: "Mobile" },
        { name: "interest_notes", label: "Notes", type: "textarea" },
      ]}
      defaultValues={{ priority: "normal", lead_score: 0 }}
    />
  ),
});
