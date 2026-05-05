# Add Breadcrumbs Across the Portal

A single `Breadcrumbs` component derives its trail from the current URL and is rendered inside the two header surfaces every page already uses. No per-page changes required.

## New file

**`src/components/Breadcrumbs.tsx`** — uses `useLocation`, splits pathname into segments, maps each to a friendly label via a `LABELS` table (Leads, Accounts, Contacts, Opportunity Catalog, Matches, Approvals, Handoffs, Activities, Admin & Setup, Logs, Users, Roles, Workbench). UUID/numeric ID segments fall back to the `overrideLast` value passed by the page. Renders Home icon → crumbs separated by `ChevronRight`. Last crumb is plain text (current page); earlier crumbs are `<Link>`. Hidden on `/` (Dashboard). Mobile-safe: `overflow-x-auto`, `whitespace-nowrap`, last crumb truncates with `max-w-[60vw]`.

## Edits

**`src/components/PageHeader.tsx`** — render `<Breadcrumbs />` above the title row. Auto-applies to: Leads, Accounts, Contacts, Catalog, Matches, Approvals, Handoffs, Activities, Admin index, Admin sub-tables, Logs, Matches Workbench.

**`src/components/DetailLayout.tsx`** — add optional `breadcrumbLabel?: string` prop, render `<Breadcrumbs overrideLast={breadcrumbLabel ?? title} />` above the title row. Since every detail page already passes a human-readable `title` (e.g. lead name, account name, "Handoff REC-123"), the last crumb auto-shows the record name with no per-page wiring needed. Auto-applies to: Lead, Account, Contact, Catalog, Match, Handoff, Activity detail pages.

## Result

```
Leads list:        Home › Leads
Lead detail:       Home › Leads › Acme Corp
Admin → Users:     Home › Admin & Setup › Users
Admin → table:     Home › Admin & Setup › Industry Segments
Matches Workbench: Home › Matches › Workbench
Logs:              Home › Logs
Dashboard (/):     (hidden — root page)
```

No detail-page edits, no schema changes, fully responsive.
