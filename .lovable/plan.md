# Fix live /logs 404

## What I found
- The live published URLs `https://heart-to-heart-biz.lovable.app/logs` and `https://teraiq.shop/logs` both still return the app’s own 404 page.
- The logs page file does exist at `src/routes/_app/logs/index.tsx`.
- That route is currently declared as `createFileRoute("/_app/logs/")`, which generates a route whose full path is `/logs/`.
- The navigation links in the app point to `/logs` without the trailing slash.
- Other index routes in the app also use the trailing-slash declaration style, so the routing behavior is inconsistent with how the live app is being accessed and published.

## Plan
1. Update the logs page route declaration so it matches the intended public URL consistently, using the same canonical no-trailing-slash path the app links to.
2. Review shared navigation and breadcrumb usage around Logs to ensure every internal link targets the same canonical route and does not rely on slash normalization.
3. Verify the generated route registration resolves cleanly for `/logs` in preview.
4. Re-check the published `.lovable.app` URL and the custom domain to confirm `/logs` no longer falls through to the global 404.
5. If the published site is still stale after the route fix, instruct you to click Publish → Update once more, since frontend route changes only go live after a publish update.

## Technical details
- File to change first: `src/routes/_app/logs/index.tsx`
- Files to review for consistency:
  - `src/components/AppShell.tsx`
  - `src/components/Breadcrumbs.tsx`
  - any admin shortcuts that link to `/logs`
- Expected end state:
  - route declaration and navigation both use `/logs`
  - live published URL and custom domain both resolve `/logs` without showing the root 404 page