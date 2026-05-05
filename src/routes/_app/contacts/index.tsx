import { createFileRoute } from "@tanstack/react-router";
import { CrudListPage } from "@/components/CrudListPage";

export const Route = createFileRoute("/_app/contacts/")({
  component: () => (
    <CrudListPage
      title="Contacts" subtitle="People at investor accounts" table="contacts"
      columns={[
        { key: "record_number", header: "ID" },
        { key: "full_name", header: "Name" },
        { key: "job_title", header: "Title" },
        { key: "email", header: "Email" },
        { key: "mobile", header: "Mobile" },
      ]}
      fields={[
        { name: "full_name", label: "Full Name", required: true },
        { name: "job_title", label: "Job Title" },
        { name: "email", label: "Email", type: "email" },
        { name: "mobile", label: "Mobile" },
      ]}
    />
  ),
});
