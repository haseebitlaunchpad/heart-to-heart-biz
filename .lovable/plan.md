
# Senaei CRM POC — Phase 1 Build Plan

A single-pass build of the full Phase 1 scope: enterprise CRM shell, 9 modules, RBAC, audit/log infrastructure, dashboards, admin setup, and seeded demo data.

## Decisions locked in
- **Sequencing**: Full Phase 1 in one plan.
- **Language**: English UI; data fields preserve Arabic content (mixed-direction text in name/description fields). No RTL toggle in Phase 1.
- **Branding**: Neutral SAP/Salesforce-inspired enterprise theme (cool blues + neutral grays, dense data UI). Easy to rebrand later via design tokens.
- **Seed data**: Full demo seed — one user per role, sample leads/accounts/contacts/catalog items/matches/activities/handoffs.

## Tech stack
- **Frontend**: TanStack Start (already scaffolded), TanStack Router file-based routing, TanStack Query for caching, Tailwind v4 + shadcn/ui (already installed).
- **Backend**: Lovable Cloud (Supabase) — Postgres with RLS, auth (email/password + Google), `createServerFn` server functions for all writes.
- **Auth model**: Supabase Auth + a `user_profiles` table linked to `auth.users`, plus a separate `user_roles` table (security-definer `has_role()` function — never store roles on profiles).

## Design system (neutral enterprise theme)
Tokens in `src/styles.css` (oklch):
- **Primary**: deep enterprise blue (`oklch(0.45 0.15 250)`)
- **Background / surfaces**: near-white with subtle gray panels
- **Status colors**: success/warn/error/info + neutral muted
- **Typography**: Inter (system stack fallback), tighter line-height for dense lists
- **Density**: compact (h-9 inputs, 32px row height in tables)
- Reusable shell components: `AppShell`, `TopBar` (logo, global search, quick-create, notifications, profile), `LeftNav`, `PageHeader`, `FilterBar`, `StatusBadge`, `StagePath`, `KanbanBoard`, `DetailLayout` (left summary panel + tabs), `Timeline`, `EmptyState`, `Toast`.

## Build sequence (12 ordered steps)

### Step 1 — Foundation schema (migration #1)
Global master data + organization tables:
`countries`, `regions`, `cities`, `currencies`, `languages`, `sectors`, `sub_sectors`, `teams`, `team_members`, `territories`, `assignment_rules`. All include standard system fields (id, is_active, is_archived, created_at/by, updated_at/by).

### Step 2 — RBAC + setup tables (migration #2)
- `app_role` enum: `system_admin`, `crm_manager`, `relationship_manager`, `catalog_manager`, `approver`, `handoff_officer`, `leadership_viewer`, `integration_user`.
- `user_profiles`, `user_roles` (separate, with security-definer `has_role(uuid, app_role)`).
- All "Lead/Account/Contact/Opportunity/Match/Activity/Financial/Handoff/Alert" setup tables (~30 lookup tables) per scope §6 and §17.2.

### Step 3 — Log tables (migration #3)
`audit_logs`, `workflow_logs`, `integration_logs`, `duplicate_logs`, `security_logs`. Plus reusable Postgres trigger functions for automatic audit-log writes on core tables (insert/update/delete → field-level diff).

### Step 4 — Core CRM tables (migration #4)
`leads`, `accounts`, `contacts`, `opportunity_catalog`, `opportunity_matches`, `activities`, `approvals`, `handoffs`, `documents`. Each with full field set per scope §9.2, §10, §11, §13.3, §14.4. RLS policies on every table using `has_role()` + ownership/team checks.

### Step 5 — Demo seed (migration #5 + insert script)
- 1 user per role (8 users) with deterministic emails (`admin@senaei.demo`, etc., password `Demo!2026`).
- Master data: countries (Saudi Arabia + 10 others), regions/cities (KSA-focused), sectors (industrial), all status/stage/path/visibility lookups.
- 25 leads across all stages and channels, 12 accounts (mix of Prospect/Investor), 18 contacts, 15 catalog opportunities (Industrial / Land / Energy / Funding / Incentive / Program / Service), 10 matches at various statuses, 30+ activities, 4 handoff packages.

### Step 6 — App shell + design system
- `__root.tsx` with QueryClientProvider, auth context, AppShell wrapper.
- `_authenticated` pathless layout with `beforeLoad` session gate → redirects to `/login`.
- Top bar, left nav with badge counts, breadcrumbs, global search (stub).
- Shared shadcn-based components: StatusBadge, StagePath, FilterBar, DetailLayout, Timeline, KanbanBoard, ApprovalActions.
- Login page (email/password + Google) + role-aware redirect.

### Step 7 — Lead module
Routes: `/leads` (list + board toggle), `/leads/new`, `/leads/$id`, `/leads/$id/convert`, `/leads/$id/identify`. Includes duplicate-review modal, stage path, activity timeline tab, changes (audit) tab. Server functions: `createLead`, `updateLead`, `assignLead`, `convertLead`, `linkToAccount`, `checkDuplicate`.

### Step 8 — Account, Contact, Activity modules
- `/accounts` list/detail with Promote-to-Investor action, related leads/contacts/matches/activities tabs.
- `/contacts` list/detail.
- `/activities` list + global timeline; activity drawer reusable from any object detail page (Save / Save & New / Save & Complete).

### Step 9 — Opportunity Catalog module
`/catalog` list, `/catalog/new`, `/catalog/$id` detail with tabs: General / Eligibility / Paths / Related Matches / Activities / Documents / Changes. Save / Save as Draft / Publish / Suspend / Archive actions with validation.

### Step 10 — Manual Match workbench
- `/matches` list + `/matches/workbench` 3-panel workbench (lead/account picker, catalog picker, match summary).
- 6-step Match Wizard.
- `/matches/$id` detail with eligibility result, path selection, approval actions.
- `/approvals` queue for approvers (Approve / Reject with reason / Request more info).

### Step 11 — Handoff readiness + mock submission
`/handoff` list + detail. Checklist UI, "Validate Package", "Mark Ready", "Submit Handoff" (mock POST → writes integration_log + workflow_log; randomized success/failure for demo). Retry + Mark Accepted actions.

### Step 12 — Dashboards + Admin/Logs viewers
- `/` (CRM Home): pipeline KPIs, stalled alerts, ready-for-handoff count.
- `/dashboards/leads`, `/dashboards/catalog`, `/dashboards/matches`, `/dashboards/activities`, `/dashboards/handoff`, `/dashboards/admin` — KPI cards + Recharts visualizations + drill-down links.
- `/admin/setup/*` — one screen per setup category (~12 screens) with shared list/edit pattern; Deactivate (not delete) once used.
- `/admin/users`, `/admin/roles`, `/admin/permissions` (read-only matrix), `/admin/teams`, `/admin/territories`.
- `/logs/audit`, `/logs/workflow`, `/logs/integration`, `/logs/duplicate`, `/logs/security` — filterable log viewers.

## Phase-1 non-negotiables (enforced throughout)
- Archive (not delete) on all CRM records; Deactivate on used setup values.
- Every save / status change / owner change / conversion / approval / handoff writes audit + workflow log.
- Lead stage / status / temperature kept as separate fields.
- Catalog and Match are separate objects.
- Activities link to lead/account/contact/match/handoff via polymorphic `related_object_type` + typed FKs.
- AI fields are placeholders only (no AI calls in Phase 1).
- Integration is mocked but writes integration_logs.
- RLS-ready ownership/role structures from day one.

## What's deferred (per scope §20)
Real AI matchmaking, full campaign management, advanced workflow builder, complex territory hierarchy, real external integrations (IC/IVR/Senaei APIs), capacity/reservation logic, advanced financials, executive analytics.

## Demo accounts (post-build)
| Role | Email | Password |
|---|---|---|
| System Admin | admin@senaei.demo | Demo!2026 |
| CRM Manager | crm.manager@senaei.demo | Demo!2026 |
| Relationship Manager | rm@senaei.demo | Demo!2026 |
| Catalog Manager | catalog@senaei.demo | Demo!2026 |
| Approver | approver@senaei.demo | Demo!2026 |
| Handoff Officer | handoff@senaei.demo | Demo!2026 |
| Leadership Viewer | viewer@senaei.demo | Demo!2026 |

## Scope size note
This is a substantial build (≈30 routes, ≈55 tables, ≈8 server function modules, full RLS, seed). Expect a long single execution. After approval I'll enable Lovable Cloud, run the 5 migrations, build the shell + modules in the order above, and seed demo data at the end.

Approve to proceed, or tell me what to adjust (drop a module, change roles, swap theme, etc.).
