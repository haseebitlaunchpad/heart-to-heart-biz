
# Phase 1 — Full Build of All Leftover Items (Single Pass)

One uninterrupted build to complete every Phase 1 item not yet implemented. No staged demos, no checkpoints — I deliver the whole thing, then run end-to-end QA.

---

## What gets built (everything below, in one pass)

### 1. Shared UI primitives
`DetailLayout` (left summary panel + tabs), `StagePath`, `Timeline`, `ActivityDrawer` (Save / Save & New / Save & Complete), `FilterBar`, `ApprovalActions`, `KanbanBoard`, `EmptyState`, `StatusBadge`, quick-create menu, notification stub, global search stub in `AppShell`.

### 2. Server function layer (`src/server/*.functions.ts`)
Typed `createServerFn` handlers, each writing to `audit_logs` + `workflow_logs`:
`createLead`, `updateLead`, `assignLead`, `checkDuplicate`, `convertLead`, `promoteToInvestor`, `publishCatalog`, `suspendCatalog`, `archiveCatalog`, `runEligibility`, `submitMatchForApproval`, `approveMatch`, `rejectMatch`, `requestMatchInfo`, `validateHandoffPackage`, `markHandoffReady`, `submitHandoff` (mock + integration_log + randomized success/fail), `retryHandoff`, `markHandoffAccepted`, `logActivity`, `completeActivity`.

### 3. Leads module (full depth)
- `/leads` — list + Kanban board toggle, FilterBar (stage/status/temperature/owner/source)
- `/leads/$id` — DetailLayout with tabs: Overview · Activities · Matches · Documents · Changes (audit) · Workflow log
- StagePath widget, inline edit, Assign action, Identify modal (duplicate check), Convert wizard (creates Account + Contact + optional Match), Disqualify / Nurture actions

### 4. Accounts, Contacts, Activities (full depth)
- `/accounts/$id` — DetailLayout, Promote-to-Investor, related Leads / Contacts / Matches / Activities / Documents / Changes tabs
- `/contacts/$id` — DetailLayout, Activities tab, account link, Set Primary
- `/activities` — global timeline + reusable ActivityDrawer wired into every detail page

### 5. Catalog module (full depth)
- `/catalog/$id` — 7 tabs: General · Eligibility · Paths · Related Matches · Activities · Documents · Changes
- State machine: Draft → Publish → Suspend → Archive with validation

### 6. Matches: workbench + wizard + approvals
- `/matches/workbench` — 3-panel UI (Lead/Account picker · Catalog picker · Match summary)
- 6-step Match Wizard (Lead → Catalog → Eligibility → Path → Review → Submit)
- `/matches/$id` — eligibility result, path selection, approval actions
- `/approvals` — approver queue with Approve / Reject (reason) / Request more info

### 7. Handoff
- `/handoffs/$id` — checklist UI bound to `handoff_checklist_items`
- Validate Package, Mark Ready, Submit Handoff (mock — randomized success/fail, writes integration_log + workflow_log), Retry, Mark Accepted

### 8. Dashboards
- `/` (CRM Home) — pipeline KPIs, stalled-lead alerts, ready-for-handoff count
- `/dashboards/leads`, `/dashboards/catalog`, `/dashboards/matches`, `/dashboards/activities`, `/dashboards/handoff`, `/dashboards/admin` — KPI cards + Recharts visualizations + drill-down links

### 9. Admin
- Generic `SetupListPage` reused across ~12 setup categories (stages, statuses, temperatures, sources, channels, sectors, sub-sectors, regions, cities, paths, size bands, timelines, etc.) with Deactivate (no delete)
- `/admin/users`, `/admin/roles`, `/admin/permissions` (read-only matrix), `/admin/teams`, `/admin/territories`

### 10. Logs (split)
Replace single `/logs` with five filterable viewers: `/logs/audit`, `/logs/workflow`, `/logs/integration`, `/logs/duplicate`, `/logs/security`.

### 11. End-to-end QA pass
- Lint + typecheck clean
- Login as each of 7 demo roles → walk every route → exercise each business action
- Confirm `audit_logs` + `workflow_logs` rows for every state-changing action
- Verify handoff mock submission writes `integration_logs`
- Fix any defects found
- Deliver short QA report (per-role, per-module pass/fail)

---

## Architecture & non-negotiables

- TanStack Start file-based routing under `src/routes/_app/`
- All writes via `createServerFn` with `requireSupabaseAuth` middleware; reads via browser supabase client (RLS-protected)
- Archive (not delete) on CRM records; Deactivate on used setup values
- AI fields remain placeholders (per original deferral)
- Handoff submission stays mocked but realistic
- No new tables — schema already covers everything

## Scope (size estimate)
~50–70 new/edited files. Largest single piece is the Match Workbench + Wizard. Build runs straight through to QA.

**Approve and I'll build it all in one go, then deliver the QA report.**
