import { createFileRoute } from "@tanstack/react-router";
import { CrudListPage } from "@/components/CrudListPage";

export const Route = createFileRoute("/_app/accounts/")({
  component: () => (
    <CrudListPage
      title="Accounts" subtitle="Investor and prospect organizations" table="accounts"
      columns={[
        { key: "record_number", header: "ID" },
        { key: "account_name", header: "Account" },
        { key: "company_name", header: "Company" },
        { key: "primary_email", header: "Email" },
        { key: "primary_mobile", header: "Mobile" },
        { key: "cr_number", header: "CR" },
      ]}
      fields={[
        { name: "account_name", label: "Account Name", required: true },
        { name: "company_name", label: "Company" },
        { name: "primary_email", label: "Email", type: "email" },
        { name: "primary_mobile", label: "Mobile" },
        { name: "cr_number", label: "CR Number" },
      ]}
    />
  ),
});
