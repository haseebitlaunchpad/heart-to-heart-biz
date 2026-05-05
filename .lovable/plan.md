## Goal

Fix list-row navigation AND wire all missing object-to-object conversion flows so the CRM operates as a connected business process end-to-end (Lead → Account/Contact → Match → Approval → Handoff).

---

## 1. Fix List → Detail Navigation (Root Bug)

**Problem:** `DataTable` uses `window.location.href` → full reload → auth `beforeLoad` lands user on `/` instead of the deep `$id` route.

**Fix:** `src/components/DataTable.tsx` — replace `window.location.href` with TanStack `useNavigate()`. Wrap first cell in `<Link>` for accessibility and middle-click.

---

## 2. Lead Conversion Flows

**File:** `src/routes/_app/leads/$id.tsx`

Add an action bar with three conversion buttons:

- **"Convert to Account"** → opens dialog pre-filled from lead (company name, email, phone, sector). On submit: insert into `accounts`, create linked `contact` from lead's person info, set `lead.linked_account_id`, advance `lead.stage_id` to "Qualified", write `workflow_logs` entry, then navigate to the new account.
- **"Create Match"** → opens dialog with Catalog opportunity picker (lookup), prefills `lead_id` + `account_id` (if linked). On submit: insert `opportunity_matches` row, write workflow log, navigate to match detail.
- **"Submit for Approval"** (visible when stage is qualified) → opens dialog (approval type, notes). Inserts `approvals` row referencing the lead, writes workflow log.

Also: wire `StagePath` clicks to advance `stage_id` directly (with confirm dialog) and write workflow log.

---

## 3. Match Conversion Flows

**File:** `src/routes/_app/matches/$id.tsx`

- **"Submit for Approval"** button → creates `approvals` row referencing the match.
- **"Send to Handoff"** button (enabled only when `approval_status_id` = approved) → opens dialog (partner, checklist defaults), creates `handoffs` row linked to match, writes workflow log, navigates to handoff detail.

---

## 4. Account Inline Creation

**File:** `src/routes/_app/accounts/$id.tsx`

- Add **"+ Add Contact"** button on Contacts tab → inline dialog, inserts `contacts` row with `account_id` pre-set.
- Add **"+ New Lead"** button on Leads tab → inline dialog, inserts `leads` row with `linked_account_id` pre-set.
- Add **"+ Create Match"** button on Matches tab → opens match-create dialog with `account_id` pre-set.

---

## 5. Approvals Outcome Routing

**File:** `src/routes/_app/approvals/index.tsx`

When an approval is approved/rejected, also update the source object's `approval_status_id` (match/lead/handoff) and write a workflow log entry on both the approval and the source object so users can trace the decision from either side.

---

## 6. Handoff Source Linking

**File:** `src/routes/_app/handoffs/$id.tsx`

Show a back-link card to the originating Match (and through it, Lead/Account) at the top of the detail page, so the chain is always visible.

---

## Shared Helper

**New file:** `src/lib/conversions.ts` — small server-safe utility with typed helpers:
- `convertLeadToAccount(leadId, overrides)`
- `createMatchFromLead(leadId, catalogId)`
- `submitForApproval(objectType, objectId, payload)`
- `promoteMatchToHandoff(matchId, payload)`

Each helper does the multi-table insert/update + `workflow_logs` write inside a single function for consistency. Called from the dialog `onSubmit` handlers.

---

## Files Changed

- `src/components/DataTable.tsx` (nav fix)
- `src/routes/_app/leads/$id.tsx` (3 conversion buttons + stage clicks)
- `src/routes/_app/matches/$id.tsx` (submit-approval + send-to-handoff)
- `src/routes/_app/accounts/$id.tsx` (3 inline add buttons)
- `src/routes/_app/approvals/index.tsx` (outcome routing)
- `src/routes/_app/handoffs/$id.tsx` (source breadcrumb)
- `src/lib/conversions.ts` (new helper)

---

## Verification

After approval I'll smoke-test the full chain in one signed-in session:
Create Lead → click row (no dashboard bounce) → Convert to Account → Add Contact → Create Match → Submit for Approval → Approve → Send to Handoff → confirm `audit_logs` + `workflow_logs` rows for each step.
