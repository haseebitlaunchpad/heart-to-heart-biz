
# Major UX, RBAC, and Design System Overhaul

This plan addresses every issue in the message in one coherent pass. Schema additions are minimal — most work is UI/UX and frontend logic.

---

## 1. Design System Upgrade (Salesforce Lightning / SAP Fiori inspired)

Refresh `src/styles.css` tokens and shared components so all screens feel cohesive and dense like Salesforce Lightning.

- **Color tokens**: introduce semantic SLDS-style palette — `--brand` (#0176D3 Salesforce blue), `--brand-dark`, `--surface`, `--surface-alt`, `--border-subtle`, `--text-primary/secondary/tertiary`, `--success/warning/error/info` with light tints for badges. Replace ad-hoc Tailwind colors in components.
- **Typography scale**: `--font-h1: 1.125rem/600`, `--font-h2: 1rem/600`, `--font-body: 0.8125rem`, `--font-meta: 0.75rem` (matches SLDS density). Set base font to `Inter` with `-apple-system` fallback.
- **Spacing**: 4px base, denser grids (`gap-2`/`gap-3`) instead of `gap-4` everywhere.
- **Shared primitives** rebuilt with SLDS look:
  - `PageHeader` — sticky, narrow (56 px), title left, breadcrumb above, actions right.
  - `RecordHeader` (new, replaces inline header in each `$id.tsx`) — Salesforce "highlights panel": object icon + title + record number, key-field strip across the bottom (5 compact "highlight" tiles like Stage, Status, Owner, Score, Days), and a single primary CTA + overflow menu instead of 7 buttons.
  - `Tabs`, `Card`, `Section`, `Badge`, `DataTable`, `Kanban` — shared paddings, borders, and hover states.
- Replace the current `DetailLayout` with the new `RecordHeader` + tabbed body. The summary rail becomes a collapsible right pane (SLDS "details" panel) so the main canvas isn't cramped on a 931 px viewport.
- **Save bar fix**: remove `sticky bottom-0` from `RecordEditor`; instead place a single sticky **top-right** "Save / Discard" toolbar inside the Overview tab that only appears when the form is dirty (Salesforce "unsaved changes" pattern). Body scrolls naturally.

## 2. Lead Detail Cleanup

- Replace the 7-button action bar with: **Convert** (primary), and an overflow `…` menu containing Log Activity / Identify / Create Match / Submit Approval / Disqualify / Delete.
- Left summary rail: redesign as a vertical "highlights" stack with grouped sections (Contact, Source, Qualification, System) and compact label/value rows; always-visible scrollbar removed. Make `StagePath` horizontal across the top of the main canvas (Salesforce path component) instead of inside the rail.
- Header `badges` chips use the new tone tokens.

## 3. Drag-and-Drop Kanban (Lead Stage)

Add `@dnd-kit/core` + `@dnd-kit/sortable` and rebuild `KanbanBoard` so cards can be dragged between stage columns. On drop:

- Optimistically update the cache (card moves immediately).
- Persist via `supabase.from("leads").update({ lead_stage_id }).eq("id", cardId)`.
- Write a `workflow_logs` row (`process="lead_stage_change"`, `action="drag_drop"`, from/to stage codes).
- On error, revert and toast.

Apply the same pattern to other Kanban-capable lists (matches by status, handoffs by status) via a generic `onCardMove(cardId, fromColId, toColId)` prop.

## 4. User / Role / Permission Admin Module

Build a real RBAC console under `/admin/users`, `/admin/roles`, `/admin/permissions`.

### Schema additions (migration)

```sql
-- new permissions catalog
create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  resource text not null,        -- e.g. 'leads', 'accounts', 'approvals'
  action   text not null,        -- 'create' | 'read' | 'update' | 'delete' | 'approve' | 'change_status'
  description text,
  unique (resource, action)
);

-- role -> permission mapping (role uses existing app_role enum)
create table public.role_permissions (
  role public.app_role not null,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role, permission_id)
);

-- helper
create or replace function public.has_permission(_user uuid, _resource text, _action text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role = ur.role
    join public.permissions p on p.id = rp.permission_id
    where ur.user_id = _user and p.resource = _resource and p.action = _action
  )
$$;

alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
create policy "perm read" on public.permissions for select to authenticated using (true);
create policy "perm admin" on public.permissions for all to authenticated
  using (public.has_role(auth.uid(),'system_admin')) with check (public.has_role(auth.uid(),'system_admin'));
create policy "rp read" on public.role_permissions for select to authenticated using (true);
create policy "rp admin" on public.role_permissions for all to authenticated
  using (public.has_role(auth.uid(),'system_admin')) with check (public.has_role(auth.uid(),'system_admin'));
```

Seed `permissions` with the cross-product of every business resource × CRUD + the special actions `approve`, `reject`, `change_status`, `convert`, `assign`. Seed sensible defaults per role (admin = all; relationship_manager = CRUD on leads/accounts/contacts/activities + read on catalog; approver = read all + approve/reject; catalog_manager = CRUD on catalog; handoff_officer = CRUD on handoffs + change_status; leadership_viewer = read all).

### UI

- `/admin/users` — table of `user_profiles` joined with `user_roles`. Row actions: change roles (multi-select chips), enable/disable, send password reset (admin client via server function).
- `/admin/roles` — list of roles, click a role → matrix of resources × actions with checkboxes (writes to `role_permissions`).
- `/admin/permissions` — read-only catalog (rare to edit).
- `useAuth()` extended to expose `roles: app_role[]` and `can(resource, action)` helper backed by a single `has_permission` RPC call cached in React Query.
- All CRUD entrypoints (`New X` button, `Save changes`, row delete, status badges, action buttons) gate on `can(...)`.

## 5. Two-way Activity ↔ Object Linking + Edit-from-anywhere

- Activity already has `related_object_type/id` plus typed FKs. Fix the timeline so any activity row in any object's "Activities" tab opens the same editable activity sheet (reuse `ActivityDrawer` in **edit mode**, prefilled, with a "Save / Save & Complete / Delete" footer).
- On the activity detail page (`/activities/$id`) add a **"Linked to"** card that shows the related object as `RECORD-NUMBER · Name`, clickable to its detail page, with a "Change link" action to re-point the activity to a different lead/account/contact/match/handoff.
- When an activity is created/edited from inside an object, the related object FK is locked but still shown.
- **Activity log/summary**: each related-object Activities tab gets a header strip — counts (Open / Done / Overdue), last activity date, next due date.

## 6. Replace UUIDs with Record Numbers in "Related" UI

Audit every place that shows a raw UUID. The fix in each spot is to join the related table and render `record_number · name` (linkable):

- `RelatedActivitiesTab` description currently can show ids — render `lead.record_number / account.record_number` via the FK joins.
- `WorkflowTab` & `ChangesTab`: when `field_name` ends in `_id`, resolve the new/old UUID by querying that table's `record_number` and display "LEAD-000003 (Omar Al-Rashid)" instead of the raw UUID. Cache lookups via React Query to avoid N+1.
- Account/Contact/Handoff/Match summary cards same treatment.

## 7. Sort / Group-by / Filter on every List

Generalize `DataTable`:

- Add `sortable?: boolean` per column → click header toggles asc/desc with arrow indicator.
- Add `groupBy?: string` prop and a header dropdown ("Group by: none | Stage | Owner | …") that renders collapsible group rows with counts.
- Add a `filters` prop that renders an SLDS-style filter bar (chips per active filter, "Add filter" button). Common filters per page (stage, status, owner, date range) defined in each list page.
- Extract the existing per-page search + select chips into the new filter bar so every module (leads, accounts, contacts, catalog, matches, handoffs, activities, approvals) has the same controls.

## 8. Fix LEAD-000002 Match → "no match" Bug

Root cause: `MatchesPanel` queries by `lead_id` and the proposed match (created via the workbench/conversion) was stored under `account_id` after conversion. Fix:

- Update query to `or(lead_id.eq.${id}, account_id.eq.${linkedAccountId})` and union the results.
- Same fix on the Account page Matches tab (mirror by `account_id` plus matches whose `lead_id` belongs to a lead linked to this account).
- Test with LEAD-000002 to confirm the proposed match now appears.

## 9. Other Fixes Surfaced

- `RecordEditor` Save bar: relocated as described in §1, resolves the "screen jumps" issue.
- Account header (image-2) gets the **Edit** affordance (overflow menu → Edit, plus inline pencil on each highlight tile that focuses the field in the Overview form).
- All header overflow menus expose Delete (admin only via `can('<resource>','delete')`).

---

## Files

**Created**
- `supabase/migrations/<ts>_rbac.sql` (permissions + role_permissions + has_permission + seeds)
- `src/components/RecordHeader.tsx`
- `src/components/FilterBar.tsx` (rewrite — chips + add-filter)
- `src/components/dnd/SortableKanban.tsx`
- `src/lib/permissions.ts` (`useCan` hook + `can()`)
- `src/lib/recordRefs.ts` (UUID → record_number resolver, cached)
- `src/routes/_app/admin/users.tsx`
- `src/routes/_app/admin/roles.tsx`
- `src/routes/_app/admin/permissions.tsx`
- `src/server/admin.functions.ts` (server fn for password reset / role assignment using admin client)

**Edited**
- `src/styles.css` — new tokens, font, density.
- `src/components/DetailLayout.tsx` — slim header, optional right-rail.
- `src/components/DataTable.tsx` — sort, group-by, filters.
- `src/components/KanbanBoard.tsx` — DnD via dnd-kit + onCardMove.
- `src/components/RecordEditor.tsx` — non-sticky save toolbar, dirty detection.
- `src/components/RelatedTabs.tsx` — record-number resolution for Workflow/Changes; activity row → opens edit drawer.
- `src/components/ActivityDrawer.tsx` — supports edit + delete + link change.
- `src/lib/auth.tsx` — expose roles + `can()`.
- `src/routes/_app/leads/$id.tsx` — slim action bar with overflow, drag-friendly StagePath, RecordHeader.
- `src/routes/_app/leads/index.tsx` — pass onCardMove for drag-drop stage updates.
- `src/routes/_app/accounts/$id.tsx`, `contacts/$id.tsx`, `catalog/$id.tsx`, `matches/$id.tsx`, `handoffs/$id.tsx`, `activities/$id.tsx` — RecordHeader, edit affordance, permission gating.
- `src/routes/_app/matches/index.tsx`, `handoffs/index.tsx`, `activities/index.tsx`, `approvals/index.tsx`, `accounts/index.tsx`, `contacts/index.tsx`, `catalog/index.tsx` — sort/group/filter controls.
- `src/routes/_app/admin/index.tsx` — add Users / Roles / Permissions cards alongside lookup tables.

**Dependencies**
- `bun add @dnd-kit/core @dnd-kit/sortable`

---

## Out of scope for this pass
- Field-level permissions (resource × action only, like Salesforce Profiles' object permissions).
- Sharing rules / record-level ownership rules beyond existing RLS.
- Bulk edit / mass status updates.

After this pass: Salesforce-grade visual feel; clean lead/account headers with a single CTA + overflow; fully functional RBAC with a real Users & Roles admin; drag-drop Kanban that updates the database; activities editable from any object and reverse-linked with a stable record-number reference; every list has sort/group/filter; the LEAD-000002 match bug is fixed; and the bouncing save bar is gone.
