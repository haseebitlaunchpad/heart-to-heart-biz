import { createFileRoute } from "@tanstack/react-router";
import { CrudListPage } from "@/components/CrudListPage";

export const Route = createFileRoute("/_app/activities/")({
  component: () => (
    <CrudListPage
      title="Activities" subtitle="Calls, emails, meetings, tasks" table="activities"
      columns={[
        { key: "record_number", header: "ID" },
        { key: "subject", header: "Subject" },
        { key: "related_object_type", header: "Related" },
        { key: "due_date", header: "Due", render: (r: any) => r.due_date ? new Date(r.due_date).toLocaleDateString() : "—" },
      ]}
      fields={[
        { name: "subject", label: "Subject", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "related_object_type", label: "Related Object Type (lead/account/contact)" },
      ]}
    />
  ),
});
