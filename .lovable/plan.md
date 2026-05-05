# Full CRUD + Editability Audit & Fix

## Problem (from re-audit)

- **Account detail** has only an action area in the header — no edit/save affordance and only 7 fields editable on the Overview form (the table has 30+).
- **Lead detail** Overview edits 8 fields out of ~60. Status / Temperature / Priority badges are read-only.
- **Contact detail** Overview edits only 4 fields; no role, account link, language, consent, nationality. "Set Primary" exists but there is no clear flow to **add multiple contacts** to an Account from the Contact page itself, and primary toggle does not demote the previous primary.
- **Catalog detail** Overview edits 5 fields; eligibility, paths, dates, capacity, currency, archival are read-only. Also has a broken `useLookup` line (conditional hook).
- **Match detail** has no editable Overview tab at all (path notes, eligibility justification, score, etc.).
- **Handoff detail** has no editable Overview tab (only checklist).
- **Activities** has no detail/edit page — only the drawer to create.
- **Audit logging**: inserts/updates already trigger `audit_logs` via `audit_changes()`, but UI-driven changes do not always also write `workflow_logs` (only stage/state transitions do). User wants every meaningful change logged.
- **Delete**: list rows have no delete affordance; admin RLS allows it.

## Solution

Introduce one shared, schema-driven editor and apply it to every detail page so coverage is complete, lookups render as selects, and every save writes both `audit_logs` (already automatic) and a `workflow_logs` "field_update" row.

### 1. Shared `RecordEditor` component (`src/components/RecordEditor.tsx`)

Generic form renderer that takes a `fields` schema and a record:

```text
type FieldDef =
  | { key, label, type: "text" | "textarea" | "number" | "date" | "datetime" | "checkbox" | "email" | "tel" }
  | { key, label, type: "lookup", table, labelKey?, orderBy? }
  | { key, label, type: "enum", options: {value,label}[] }
  | { key, label, type: "readonly" }
```

- Renders grouped sections (General / Classification / Contact / Financial / Ownership / System).
- Saves via passed `update(patch)` mutation.
- After save, computes the diff vs original and writes one `workflow_logs` entry per changed field with `process="field_update"`, `action="edit"`, `field_name`, `from_value`, `to_value`.
- Loads lookup tables on demand via existing `useLookup`.

### 2. Per-module field schemas (`src/lib/recordSchemas.ts`)

One schema per object covering **every column** the user can legally edit (excludes system audit columns: `id`, `record_number`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_archived`, AI fields, computed counters):

- **leads** — full ~40 editable fields, including stage/status/temperature/disqualification/nurture-reason as lookup dropdowns, priority as enum.
- **accounts** — full ~25 editable fields (category, investor type, status, nationality, country, city, sector, sub_sector, size band, region, funding source/status, timeline, language, owner, etc.).
- **contacts** — full set: full_name, job_title, email, mobile, contact_role_id, preferred_channel_id, preferred_language, nationality_id, account_id (lookup), lead_id, consent_given + consent_notes, is_primary_contact (handled by dedicated action — see #4).
- **opportunity_catalog** — title, description, journey_area, min/max_investment, capacity, available_from, expiry_date, currency, required_cr, eligible_investor_type, eligible_nationality_type, required_documents (multi), exclusion_criteria, path_a/b/c_description, etc.
- **opportunity_matches** — path notes, eligibility_result (enum), missing_requirements, score, match_status_id, manual_override fields.
- **handoffs** — selected_path_id, owner_id, owner_team_id, package metadata (free fields the user can adjust before submit).
- **activities** — subject, description, activity_type_id, status_id, outcome_id, due_date, next_follow_up_date, related_object_*.

### 3. Wire `RecordEditor` into every `$id.tsx`

For each of `leads`, `accounts`, `contacts`, `catalog`, `matches`, `handoffs`:
- Replace the partial Overview tab with `<RecordEditor recordType="…" record={x} schema={schemas.x} update={update.mutateAsync} />`.
- Keep existing action buttons (Convert, Promote, Submit, etc.) — they handle workflow transitions; the editor handles field edits.
- Add an inline **"Edit"** affordance in the header summary rail: clicking the pencil icon next to any summary field jumps to the Overview tab and focuses the corresponding input.

### 4. Multiple contacts on Account / Investor

- Account `Contacts` tab: keep the inline "Add Contact" dialog but expand its fields to `full_name, job_title, email, mobile, contact_role_id, is_primary_contact`. Multiple contacts can already be added repeatedly — make this explicit with a count badge (`Contacts · 4`) on the tab.
- "Set Primary" action (on Contact page **and** as a row action in the Contacts tab): when toggled true, run a transactional update that flips all other contacts on the same `account_id` to `is_primary_contact = false` first. Centralized in `src/lib/conversions.ts` as `setPrimaryContact(contactId)`.
- Add a **"Add Contact"** button directly in the Contact detail header (creates a sibling contact under the same account).

### 5. Activities detail/edit page (`src/routes/_app/activities/$id.tsx`)

New route. Same `DetailLayout` + `RecordEditor` pattern, plus quick-action buttons: **Mark Complete**, **Reschedule**, **Change Outcome**. Wire links from the global Activities timeline rows to this page (currently they only link to the related object).

### 6. Row-level Delete (admin only)

Add a kebab-menu in `DataTable` rows with "Delete" (visible only to `system_admin` via `useAuth`). Confirms via dialog, deletes via supabase, invalidates the list query, writes a workflow_log `process="record_delete"`. Applies to leads, accounts, contacts, catalog, matches, handoffs, activities.

### 7. Bug fixes uncovered during audit

- `src/routes/_app/catalog/$id.tsx` line 25 — conditional `useLookup` call breaks Rules of Hooks. Replace with a single `useLookup("match_statuses")`.
- `Match` page never renders an Overview tab; add one before "Approval".
- `Handoff` summary "Source Match" link uses `opportunity_match_id` directly; verify it still resolves after refactor.
- Contact "Set Primary" currently does not demote the previous primary (data integrity bug).

### 8. Audit / Workflow logging coverage

- DB trigger `audit_changes()` already records every insert/update/delete to `audit_logs` — no DB change needed.
- Every UI save path (`RecordEditor`, action buttons, conversions) additionally writes a `workflow_logs` row so the **Workflow** tab on each record shows a human-readable history (who changed what, when).
- Add a `process="field_update"` filter chip on the Workflow tab.

### 9. Delete affordance on detail header

Each detail page (admin-only) gets a destructive **"Delete record"** button in the header overflow menu, with a typed-confirm dialog ("type RECORD-NUMBER to delete").

## Files to create

- `src/components/RecordEditor.tsx`
- `src/lib/recordSchemas.ts`
- `src/routes/_app/activities/$id.tsx`
- `src/components/DeleteRecordButton.tsx`

## Files to edit

- `src/routes/_app/leads/$id.tsx` — replace OverviewTab with RecordEditor; add Delete; demote-old-primary helper not needed here.
- `src/routes/_app/accounts/$id.tsx` — replace Editable with RecordEditor; expand Contacts add-form; add Delete; tab badges with counts.
- `src/routes/_app/contacts/$id.tsx` — replace Edit with RecordEditor; fix Set-Primary to demote others; add "Add sibling Contact" header button.
- `src/routes/_app/catalog/$id.tsx` — fix bad hook; replace General with RecordEditor covering all fields (including eligibility & paths); add Delete.
- `src/routes/_app/matches/$id.tsx` — add Overview tab using RecordEditor; add Delete.
- `src/routes/_app/handoffs/$id.tsx` — add Overview tab using RecordEditor.
- `src/routes/_app/activities/index.tsx` — make rows link to new `/activities/$id`.
- `src/components/DataTable.tsx` — add row kebab with admin Delete.
- `src/lib/conversions.ts` — add `setPrimaryContact`, `deleteRecord` helpers (with logs).
- `src/components/RelatedTabs.tsx` — Workflow tab: support process filter.

## Out of scope

- New columns, new tables, new RLS — schema is already complete for everything above.
- Bulk edit / bulk delete (can be added later).

After this is shipped every page has a complete editable form, every field changes are logged, you can have many contacts per account with a real primary toggle, and admins can delete any record from list or detail.
