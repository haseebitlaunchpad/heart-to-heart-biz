## Mobile responsiveness audit

The portal was built desktop-first. The core shell (fixed 240px sidebar) and every data table render off-screen on phones. Below are the concrete issues and fixes.

### Issues found

1. **AppShell** — Sidebar is always visible at `w-60`; on a 375px screen the main content is squeezed. No mobile menu.
2. **PageHeader** — `flex justify-between` with `px-6 py-4` causes title + action buttons to overlap on narrow widths.
3. **CrudListPage / DataTable** — Tables have many columns; `overflow-auto` works but rows are unreadable on mobile. Filter input and "New" button placement is fine but unverified on small widths.
4. **DetailLayout** — Uses `lg:grid-cols-[280px_1fr]`, so on mobile the summary sidebar stacks above tabs (acceptable), but the header row uses `px-6` and action buttons can wrap awkwardly. Tabs already scroll horizontally — good.
5. **Dashboard** — KPI grid `grid-cols-2 md:grid-cols-4 lg:grid-cols-7` causes the "All records" row to be cramped at 7 cols on tablet. Charts use fixed heights (acceptable). Mostly OK.
6. **KanbanBoard** — Horizontal scroll already works on mobile (good), but column width 260px is fine.
7. **GlobalSearch / header** — Header is just the search; fine, but needs a hamburger trigger for the new mobile sidebar.
8. **Dialogs (Create record, RecordEditor)** — shadcn Dialog defaults are usually OK but should be checked for max-height / scroll on small screens.
9. **Login page** — Likely already centered card; will verify.

### Fixes

**1. AppShell → responsive drawer sidebar**
- Sidebar becomes a slide-out `Sheet` on `<lg` (hidden by default), classic fixed sidebar on `lg+`.
- Header on mobile shows: hamburger button (opens sheet), "Senaei CRM" wordmark, GlobalSearch shrunk.
- Use shadcn `Sheet` (already in `components/ui`).

**2. PageHeader**
- Stack vertically on mobile: `flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`.
- Reduce padding on mobile: `px-4 sm:px-6`.
- Actions wrap with `flex-wrap`.

**3. CrudListPage**
- Reduce padding `p-4` → `p-3 sm:p-4`.
- Filter input full-width on mobile (`max-w-sm` only on `sm+`).

**4. DataTable**
- Wrap table in `overflow-x-auto -mx-3 sm:mx-0` so it can scroll edge-to-edge.
- Add `whitespace-nowrap` to header cells so columns size naturally instead of cramping.
- Group-by dropdown row stacks on mobile.

**5. DetailLayout**
- Header `px-4 sm:px-6`, title row already wraps OK; ensure actions don't push title off-screen by adding `flex-wrap`.
- Summary sidebar: on mobile becomes a collapsible section above tabs (default collapsed) so users land directly on tab content.

**6. Dashboard**
- "All records" KPIs: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7`.
- Container padding `p-4 sm:p-6`.

**7. RecordEditor / Dialogs**
- Ensure DialogContent uses `max-h-[90vh] overflow-y-auto` and `w-[95vw] sm:max-w-lg` so large forms scroll on phones.

**8. KanbanBoard** — no change (already scrolls).

**9. Login page** — verify card width works at 320px; add `px-4` to outer container if missing.

### Files to modify
- `src/components/AppShell.tsx` — drawer sidebar + mobile header
- `src/components/PageHeader.tsx` — responsive flex/padding
- `src/components/CrudListPage.tsx` — padding + filter width
- `src/components/DataTable.tsx` — horizontal scroll polish, header nowrap
- `src/components/DetailLayout.tsx` — responsive padding, collapsible summary on mobile
- `src/components/RecordEditor.tsx` — dialog sizing (read first)
- `src/routes/_app/index.tsx` — KPI grid breakpoints, padding
- `src/routes/login.tsx` — verify/adjust container padding (read first)

### Known limitations to flag
- **DataTable**: With 6+ columns, even with horizontal scroll the experience on a 375px phone is "swipe to read." A true card-per-row mobile view is a larger redesign — not included here. Tell user if they want full card mode I can do it as a follow-up per page.
- **Kanban**: Drag-and-drop with horizontal column scroll on touch can be finicky in some browsers (dnd-kit limitation). Works but not as smooth as native apps.
- **Recharts**: Charts use `ResponsiveContainer` and shrink fine, but legends/labels can get cramped under 360px.

### QA
After implementation I'll spot-check at 375×812 (iPhone) via the browser tool: dashboard, leads list, a lead detail, approvals, and the create-lead dialog.