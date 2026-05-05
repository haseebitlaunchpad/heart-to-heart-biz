## Rebrand to Senaei CRM

**1. `src/routes/__root.tsx`** — Replace head meta:
- title: `Senaei CRM`
- description / og:description: `Senaei CRM — manage leads, accounts, opportunities, approvals, and handoffs in one place.`
- author: `Senaei`
- og:title / twitter:title: `Senaei CRM`
- og:site_name: `Senaei CRM`
- Add theme-color `#0F172A`
- Remove `twitter:site @Lovable`
- Add favicon link → `/favicon.svg`

**2. `public/favicon.svg`** — Create brand favicon: rounded square with primary color background and "S" monogram.

**3. Verify** no other user-visible Lovable strings (sidebar already says "Senaei CRM"; auto-generated supabase files contain only build-time comments stripped from the bundle).

Badge is already hidden. After applying, you can publish and connect your custom domain via Project Settings → Domains.