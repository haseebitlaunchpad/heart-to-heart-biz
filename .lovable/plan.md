## Goals
1. Make activities editable from Lead / Account / Contact / Match detail pages.
2. Allow assigning an Owner when creating/editing an activity.
3. Remove the per-page search bar on Matches (and other lists) — let users use the single global ⌘K bar in the header.
4. Seed 10 realistic Opportunity Matches use-cases for demo/testing.

---

## 1. Editable activities from related objects
**File:** `src/components/RelatedTabs.tsx` → `RelatedActivitiesTab`

- Replace the read-only `Timeline` rendering with rows that:
  - Link the subject to `/activities/$id` (so users can open & fully edit using the existing `ActivityDetail` page that already has `RecordEditor`).
  - Show a small "Mark complete" button inline for open items (mutates `completed_at` + writes workflow log).
  - Show owner avatar/name (resolved via `RecordRef table="user_profiles"`).
- Add a "+ Log activity" button at the top of the tab that opens `ActivityDrawer` pre-linked to the parent record (drawer already supports this; just wire the button — currently it's only in some detail pages).
- Ensure the tab is added consistently. Already present on leads/accounts/contacts/matches; verify handoffs detail also has it.

## 2. Owner on activities
**Files:** `src/components/ActivityDrawer.tsx`, `src/lib/recordSchemas.ts`

- Add an `Owner` select to `ActivityDrawer` populated from `user_profiles` (default = current user). Persist to `activities.owner_id`.
- Add `owner_id` field (type: user picker) to the `activities` schema in `recordSchemas.ts` so it shows up & is editable in `RecordEditor` on the activity detail page (and from the related-activities tab via the link).
- The `owner_id` column already exists on `activities` (used in `ActivityDrawer`) — no migration needed.

## 3. Unified search — drop per-page search bars
**Files:** `src/components/FilterBar.tsx`, list pages
(`matches/index.tsx`, `leads/index.tsx`, `accounts/index.tsx`, `contacts/index.tsx`,
`catalog/index.tsx`, `handoffs/index.tsx`, `activities/index.tsx`,
`approvals/index.tsx`)

- Make the `search` input in `FilterBar` optional. When the parent doesn't pass `search`/`onSearch`, render only the filter chips/children.
- On `Matches` page (per the screenshot/request), remove the local search input — keep only status/score filters. Users search matches via the header ⌘K bar.
- Improve `GlobalSearch` UX so it also feels like the page search:
  - When a result is selected on a list-type group (e.g. Matches), navigate directly to the detail page (already does).
  - Add a "View all results in {Module}" footer item per group that navigates to `/{module}?q=...`, and have each list page accept an optional `?q=` search param to pre-filter rows in memory (no schema change).

## 4. Seed 10 realistic Opportunity Matches
Insert via migration into `opportunity_matches` (and any minimally required parent rows that don't already exist) with realistic Saudi-market food-distribution scenarios such as:

| # | Lead / Account | Catalog item | Status | Score |
|---|----------------|--------------|--------|-------|
| 1 | Qahtani Foods | Premium Olive Oil – 5L | Proposed | 88 |
| 2 | Al-Othaim Markets | Frozen Seafood Bundle | Qualified | 76 |
| 3 | Tamimi Markets | Organic Dates – Bulk | Won | 92 |
| 4 | Panda Retail | Dairy SKU Refresh Q3 | In Review | 64 |
| 5 | Danube | Halal Meat Premium | Proposed | 81 |
| 6 | Lulu Hypermarket | Ramadan Gift Hampers | Qualified | 70 |
| 7 | Carrefour KSA | Long-life Bakery | Lost | 42 |
| 8 | Hyper Mall | Imported Pasta Range | Proposed | 58 |
| 9 | Manuel Market | Local Honey Range | Qualified | 73 |
| 10 | Nesto | Beverage Innovation Pilot | Won | 95 |

Each row uses existing status / lead / account / catalog UUIDs where present; otherwise the migration first upserts placeholder catalog/account rows so FKs resolve, then inserts the matches.

---

## Technical notes
- No table-shape changes. Migration is data-only (insert seed matches + any missing FK parents).
- `RelatedActivitiesTab` becomes a thin list of `Link`s, so clicking opens the existing fully-editable `ActivityDetail` route — that's the cleanest "make it editable" path without duplicating editors.
- `FilterBar` change is backwards compatible (props become optional).
- `GlobalSearch` already has debounced multi-table `ilike` — adding "View all" footer rows is a small render addition.

## Files touched
- `src/components/RelatedTabs.tsx`
- `src/components/ActivityDrawer.tsx`
- `src/components/FilterBar.tsx`
- `src/components/GlobalSearch.tsx`
- `src/lib/recordSchemas.ts`
- `src/routes/_app/matches/index.tsx` (+ other list pages: optional `?q=` param)
- `src/routes/_app/handoffs/$id.tsx` (verify activities tab)
- new SQL migration: seed 10 opportunity matches

Once approved I'll implement all four in one pass.