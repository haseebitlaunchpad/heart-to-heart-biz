import { createFileRoute } from "@tanstack/react-router";
import { CrudListPage } from "@/components/CrudListPage";

export const Route = createFileRoute("/_app/handoffs/")({
  component: () => (
    <CrudListPage
      title="Handoffs" subtitle="Approved match → external partner handoff" table="handoffs"
      columns={[
        { key: "record_number", header: "ID" },
        { key: "submitted_at", header: "Submitted", render: (r: any) => r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : "—" },
        { key: "retry_count", header: "Retries" },
        { key: "failure_reason", header: "Failure" },
      ]}
      fields={[]}
    />
  ),
});
