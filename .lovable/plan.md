
Single consolidated plan covering everything still pending from the previous turns plus the new admin grouping ask.

## 1. Admin setup — group by system function

`src/routes/_app/admin/index.tsx` rewritten as collapsible accordion sections (shadcn `Accordion`), each section a labeled grid of setup cards. Section title strip uses an icon + count of tables in the group.

Groups:
- **Access control** — Users, Roles & Permissions
- **Lead management** — `lead_stages`, `lead_statuses`, `lead_temperatures`, `lead_source_channels`, `lead_disqualification_reasons`, `lead_nurture_reasons`
- **Account & contact** — `account_categories`, `account_statuses`, `investor_types`, `contact_roles`
- **Activities** — `activity_types`, `activity_statuses`, `activity_outcomes`
- **Opportunities & matching** — `match_statuses`, `investment_size_bands`, `investment_paths`, `investment_timelines`, `funding_sources`, `funding_statuses`, `lifecycle_phases`
- **Approvals & handoffs** — `approval_statuses`, `handoff_statuses`, `handoff_checklist_items`, `integration_statuses`
- **Geography & localization** — `countries`, `cities`, `currencies`, `languages`, `communication_channels`
- **Automation** — `assignment_rules` (link card to a future page)
- **Audit & integration logs** — read-only links to `audit_logs`, `integration_logs`, `duplicate_logs`

Each card keeps the live record count. Add a search input at the top that filters cards by label across all groups.

## 2. UUID → RecordRef cleanup (carried over)

- Extend `recordRefs.ts` with `user_profiles` resolver (full_name || email) and add `owner_id`, `assigned_to`, `created_by`, `updated_by`, `submitted_by`, `decided_by`, `requested_by` to `FK_TABLE_MAP`.
- `RelatedTabs.tsx` (Workflow + Changes): when value is UUID or `field_name` is in the map, render `<RecordRef />`. Resolve status_id values via lookup tables.
- Detail pages (`accounts/$id`, `contacts/$id`, `leads/$id`, `matches/$id`, `handoffs/$id`, `catalog/$id`, `activities/$id`): replace any UUID-printing summary field with `<RecordRef />`.
- `activities/$id.tsx`: Related card uses `<RecordRef />` plus a **Change Link** button.

## 3. Kanban: click vs drag + DnD on matches & handoffs

`KanbanBoard.tsx`: card body wraps `<Link>` only; new `⋮⋮` drag-handle at top-right carries `setNodeRef + listeners`. Activation distance stays 4px.

Wire `onCardMove` for:
- `matches/index.tsx` → updates `match_status_id` + writes `workflow_logs` (`process="match_status_change"`).
- `handoffs/index.tsx` → updates `handoff_status_id` + log.
- Add View toggle (Table | Kanban) to matches and handoffs lists (leads already has it).

Optimistic update with rollback on error.

## 4. Two-way Activity ↔ object linking

- `ActivityDrawer.tsx` extended to **edit mode** (load by id, footer = Save / Save & Complete / Delete).
- All "Activities" tabs in object detail pages: row click opens drawer in edit mode; ↗ icon goes to `/activities/$id`.
- `activities/$id.tsx`: Change Link → `RelatedObjectPicker` updates both `related_object_type/id` and the typed FK column.
- Each Activities tab gets a header strip: Open / Done / Overdue counts, last & next due.

## 5. Global Search (SAP/Salesforce-style omni-search)

Top-bar input becomes a `CommandDialog` (Cmd/Ctrl-K) with debounced (200 ms) input. New file `src/components/GlobalSearch.tsx`.

- Parallel `ilike` queries across leads, accounts, contacts, opportunity_catalog, opportunity_matches, handoffs, activities, approvals (relevant text columns + record_number; tokens AND-ed for fuzzy feel).
- Results grouped by object with icon + record_number + name + secondary meta. Each group shows a "Search in <module>" jump.
- Recent records (last 5 visited, localStorage) shown when query empty.
- Keyboard navigation; Enter → navigate to detail. 50-entry React Query cache, 30s stale-time.
- Mount in `AppShell.tsx` and bind ⌘K shortcut.

Optional: minor `pg_trgm` index migration on hot name columns only if perf demands.

## 6. Enterprise dashboard revamp + clickable KPIs

`src/routes/_app/index.tsx` rewritten:

```text
Greeting (name · role · date)
KPI tiles (8, dense, accent bar, 7-day delta, all <Link>)
  Leads · Accounts · Contacts · Catalog
  My Open Leads · Pending Approvals · Overdue Activities · Hot Matches
Lead Funnel (bar, click → /leads?stage=…)  | Matches by Status (donut, click → /matches?status=…)
My Open Tasks (top 5)
Recent Activity (10)                       | Pending Approvals (5, inline approve)
```

KPI links carry search params:
- My Open Leads → `/leads?owner=me&open=1`
- Pending Approvals → `/approvals?status=pending`
- Overdue Activities → `/activities?overdue=1`
- Hot Matches → `/matches?status=proposed`

Quick Actions row (gated by `useCan`): New Lead · Log Activity · Convert · Submit Approval.

New `src/components/dashboard/`: `KpiTile`, `Greeting`, `MyTasks`, `RecentActivity`, `PendingApprovalsCard`.

## 7. Lists: sort / group / filter / search-param-driven

Apply `DataTable` sort/group/filter to all list pages: accounts, contacts, catalog, matches, handoffs, activities, approvals (leads done).

Each list adds Zod `validateSearch` (with `@tanstack/zod-adapter` `fallback`) so dashboard deep-links work:
- leads: `owner`, `stage`, `temperature`, `open`
- matches: `status`
- approvals: `status`
- activities: `overdue`, `assignee`

Filter chip bar: removable chips for active filters; "Add filter" picks from a per-page registry. Sort/group choice persisted in URL.

---

## Files

**Created**
- `src/components/GlobalSearch.tsx`
- `src/components/RelatedObjectPicker.tsx`
- `src/components/dashboard/{KpiTile,Greeting,MyTasks,RecentActivity,PendingApprovalsCard}.tsx`

**Edited**
- `src/routes/_app/admin/index.tsx` — grouped accordion + search.
- `src/routes/_app/index.tsx` — full dashboard revamp.
- `src/components/KanbanBoard.tsx` — drag handle, click-through link.
- `src/components/RelatedTabs.tsx` — RecordRef everywhere.
- `src/components/ActivityDrawer.tsx` — edit/delete/relink.
- `src/components/AppShell.tsx` — mount GlobalSearch + ⌘K.
- `src/lib/recordRefs.ts` — user_profiles + extra FK map entries.
- `src/routes/_app/{leads,matches,handoffs,accounts,contacts,catalog,activities,approvals}/index.tsx` — `validateSearch`, sort/group/filter; matches+handoffs add Kanban view + onCardMove.
- `src/routes/_app/{accounts,contacts,leads,matches,handoffs,catalog,activities}/$id.tsx` — RecordRef cleanup; activity Change Link.

**Optional**
- `supabase/migrations/<ts>_search_indexes.sql` — `pg_trgm` GIN indexes if perf needs it.

No other schema changes.

---

## Out of scope
- Server-side full-text ranking with tsvector/tsquery (client-merged ilike is sufficient at current data volume).
- Per-user dashboard customization / drag-rearrange.
- Bulk edit on lists.
