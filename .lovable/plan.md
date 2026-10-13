# DXS CMS Migration Testbed — Plan

Build the "Digital Experience Showcase" described in `Mike-Demo/dxs-cms-testbed` (README is the only file in the repo; it is a build brief, not existing code). Purpose: a CMS/SaaS migration test bed (Contentful -> Sanity, WordPress -> Contentful, Dato -> Hygraph) with realistic, interconnected, deterministic content.

## Evidence gathered (facts)

- GitHub repo: 1 file, `README.md` (18.6 KB), sections 1-11: purpose, stack, dual-mode data, 22 content models, 23 routes + `/login`, forms, UI areas, fixtures, SQL migration, acceptance criteria, sequence.
- Firecrawl Alexandria developer category lists 6 providers: Developer Index, Docker Hub, NVD, OSV.dev, Package registries, GitHub.
- Alexandria search (sources: alexandria) returned relevant capabilities: `osv-dev` vulnerabilities/query, query_batch, vuln; `firecrawl-developer-index` search. Unrelated hits (data-cms-gov = Medicare "CMS", openrouter) were discarded.
- Not yet retrieved: actual records (versions, vulns, docs). Tool listings are not data; retrieval is step 0 below.

## Required deviations from the brief (assumption: acceptable)

| Brief says | This project uses | Why |
|---|---|---|
| React Router v6 | TanStack Router (file routes) | Fixed by this platform |
| Supabase (optional) | Lovable Cloud (same capabilities) | Built-in, no account |
| `src/lib/data/client.ts` mode switch on env vars | Same interface; connected mode when Cloud is enabled, `VITE_DATA_MODE=mock` override | Preserves contract |

Everything else (Zustand, RHF + Zod, Recharts, shadcn, lucide, date-fns, offline mock mode, fixture clock `2026-10-01T00:00:00Z`) kept as specified.

## Phases

0. **Evidence step (Alexandria)** — via the existing Firecrawl connection: package-registry lookups for each dependency (latest version, license, downloads), `osv-dev` query_batch on the chosen versions, Developer Index search for TanStack Router/Query + RHF/Zod docs. Record results with citations in `docs/dependency-evidence.md`; flag missing data vs failures.
1. **Foundations** — design system tokens (light/dark, distinctive editorial look), public/dashboard/admin layouts, responsive header + mobile nav, footer, breadcrumbs, feedback widget, not-found view.
2. **Data layer** — TS models + Zod schemas for all 22 models and supporting records; repository interface; mock adapter (localStorage persistence, reset-to-seed, due-promotion of scheduled items); deterministic fixtures covering every status, edge case, Unicode, nested blocks, local assets. Contract tests.
3. **Public routes** — `/`, about, blog (+slug), authors, categories, products (+slug), cart, checkout (simulated), wishlist, events (+slug), resources (+slug), careers, contact. All via TanStack Query; URL-preserved filters.
4. **Private + CMS** — dashboard (Recharts on repo data), profile, settings, design-system catalog, admin tables, typed editor with rich text/blocks/reference pickers, publish/schedule/archive, media library.
5. **Connected mode (Lovable Cloud)** — SQL migration (all tables, joins, tsvector + GIN, triggers, enums), RLS + storage policies, roles table, atomic checkout database function, auth at `/login`, seed from same fixtures.
6. **Verification** — contract tests in both modes, form/route smoke tests, mobile + desktop checks, acceptance checklist from README section 10.

Recommend approving phases 0-3 first (offline-usable site), then 4-6. Rollback: each phase is isolated; connected mode is additive and mock mode stays the default fallback.

## Risks

- Scope is very large (23 routes, 22 models); expect several build iterations.
- Brief demands zero network in mock mode — no remote images/fonts; fonts self-hosted.
- Alexandria credits consumed in phase 0 (small number of calls).

## Technical details

- Routes: `src/routes/*` incl. `_public`, `_dashboard`, `_admin` pathless layouts; `admin.content.$id.tsx`.
- Data: `src/lib/data/{models,schemas,client,mock,cloud,fixtures}`; UI never imports fixtures or the DB client directly.
- Server: `createServerFn` for checkout command and privileged admin ops; Alexandria calls only at build time (not in the app).
