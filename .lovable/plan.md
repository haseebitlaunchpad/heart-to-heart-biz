Fix the live `/logs` 404 by making the logs page route explicit and re-publishing the frontend.

What I found
- The current codebase does contain a logs page at `src/routes/_app/logs/index.tsx`.
- In the local generated route manifest, that file resolves to public path `/logs`.
- In preview, visiting `/logs` behaves like a protected app route and redirects to `/login` when signed out.
- On the live site and custom domain, `/logs` and `/logs/` return a document-level 404, while another protected route like `/accounts` correctly redirects to `/login`.

That means the bug is not the login guard or the sidebar link. The live deployment is serving an app build that still does not recognize the logs route.

Plan
1. Make the logs route unambiguous in code
- Refactor the logs page route to use a single canonical route declaration with no trailing-slash ambiguity.
- Keep it under the authenticated app-shell layout so unauthenticated users are redirected to `/login`, just like `/accounts`.
- If needed, replace the current nested `logs/index.tsx` pattern with a flatter route file that TanStack resolves more predictably for production.

2. Re-check all navigation references
- Verify the sidebar and breadcrumb code only points to the canonical `/logs` path.
- Confirm there are no stray references to `/_app/logs` or `/logs/` that could mask the problem.

3. Verify route registration locally
- Confirm the generated route tree registers the logs page exactly as `/logs` and that it inherits the `_app` auth/layout behavior.
- Ensure preview `/logs` redirects to `/login` when signed out and loads correctly when authenticated.

4. Push the corrected frontend live
- After the code change, publish an updated frontend build so the live route manifest includes `/logs`.
- Then verify both:
  - `https://heart-to-heart-biz.lovable.app/logs`
  - `https://teraiq.shop/logs`

Technical details
- Likely files involved:
  - `src/routes/_app/logs/index.tsx`
  - possibly a replacement route file if the current route is flattened
  - `src/components/AppShell.tsx`
  - `src/components/Breadcrumbs.tsx`
- Expected final behavior:
  - Signed-out user visiting `/logs` -> redirected to `/login`
  - Signed-in user visiting `/logs` -> logs page loads normally
  - No 404 on either the published domain or the custom domain