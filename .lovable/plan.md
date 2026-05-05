## CRUD audit — current state

| Module | List | Create | Detail edit | Stage/status actions | Notes |
|---|---|---|---|---|---|
| Leads | ✅ rich + kanban | ✅ dialog | ✅ inline + convert/disqualify | ✅ stage path | Done |
| Accounts | ✅ rich | ✅ dialog | ✅ promote-to-investor | ✅ | Done |
| Contacts | ✅ rich | ✅ dialog | ✅ | n/a | Done |
| Activities | ⚠️ timeline only | ❌ no create from page | n/a | n/a | Add "Log Activity" button |
| **Catalog** | ⚠️ generic CrudListPage | ⚠️ thin form | ✅ has detail | ✅ Draft→Publish | Upgrade list + create |
| **Matches** | ⚠️ generic CrudListPage | ⚠️ notes-only | ✅ workbench + actions | ✅ | Upgrade list + create with lookups |
| **Handoffs** | ⚠️ generic CrudListPage | ❌ no fields | ✅ rich detail | ✅ | Upgrade list + create-from-match |
| **Approvals** | ⚠️ generic CrudListPage | ⚠️ awkward | n/a | ⚠️ no inline approve/reject | Upgrade list + decision dialog |
| Admin lookup tables | ✅ index + editor | ✅ generic | n/a | ✅ active toggle, delete | Done |
| Logs | ✅ tabbed | n/a | n/a | n/a | Done |

## Plan — bring every business process to full CRUD parity

### 1. Catalog list (`/catalog`)
Replace generic `CrudListPage` with a real list:
- Search + status filter
- Create dialog: title, description, site_name, min/max investment, expected_benefit
- Columns: ID, title, site, min/max investment (formatted), status badge
- Click row → existing `/catalog/$id` detail (state machine already there)

### 2. Matches list (`/matches`)
Replace generic page:
- Filters: search + status
- Toolbar: link to **Workbench** + "New Match" dialog
- Create dialog with **lookup selects** for catalog opportunity (required), lead, account; default status to DRAFT, attach `owner_id` and write workflow log
- Columns: ID, opportunity (joined), subject (lead or account), eligibility, status badge
- Click row → existing `/matches/$id`

### 3. Handoffs list (`/handoffs`)
- Filters: search + status
- "New Handoff" dialog: pick from approved matches; create with DRAFT status; navigate to detail
- Columns: ID, opportunity, account, submitted, retries, status
- Click row → existing `/handoffs/$id` (validate, submit, retry already wired)

### 4. Approvals list (`/approvals`)
- Inline **Approve / Reject** action buttons per row → opens decision dialog (comments)
- Decision writes `decision`, `decided_at`, `decided_by`, status (APPROVED/REJECTED) and a `workflow_logs` row
- Reference column links to the underlying match or handoff
- Filters: search + status

### 5. Activities (`/activities`)
- Add "Log Activity" button in header that opens the existing `ActivityDrawer` (unattached, since this is the global list)
- Keep the timeline + filters as-is

### 6. Final QA pass
After the edits:
- Run `tsc --noEmit` to confirm a clean typecheck
- Smoke-test each route loads without errors
- Spot-check create / edit / status-change flows for each module

### Files touched
- `src/routes/_app/catalog/index.tsx`
- `src/routes/_app/matches/index.tsx`
- `src/routes/_app/handoffs/index.tsx`
- `src/routes/_app/approvals/index.tsx`
- `src/routes/_app/activities/index.tsx`

No DB migrations needed — all required tables, columns, and lookups already exist.

Approve to apply.