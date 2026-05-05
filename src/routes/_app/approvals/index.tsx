import { createFileRoute } from "@tanstack/react-router";
import { CrudListPage } from "@/components/CrudListPage";

export const Route = createFileRoute("/_app/approvals/")({
  component: () => (
    <CrudListPage
      title="Approvals" subtitle="Match and handoff approvals queue" table="approvals"
      columns={[
        { key: "record_number", header: "ID" },
        { key: "related_object_type", header: "Object" },
        { key: "decision", header: "Decision" },
        { key: "comments", header: "Comments" },
      ]}
      fields={[
        { name: "related_object_type", label: "Related Object Type", required: true },
        { name: "comments", label: "Comments", type: "textarea" },
      ]}
    />
  ),
});
