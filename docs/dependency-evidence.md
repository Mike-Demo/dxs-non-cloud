# Dependency evidence (Firecrawl Alexandria)

Retrieved 2026-10-13 via the Firecrawl connection.

## OSV.dev — `osv-dev / vulnerabilities/query_batch`

Workflow run `0242331f-b921-4eb6-bdcf-56843f4803c2`, source `https://api.osv.dev/v1/querybatch`, 5 credits.

| Package | Version | Known vulnerabilities |
|---|---|---|
| zod | 3.25.76 | 0 |
| react-hook-form | 7.71.2 | 0 |
| recharts | 2.15.4 | 0 |
| date-fns | 4.1.0 | 0 |
| zustand | 5.0.8 | 0 |
| sonner | 2.0.7 | 0 |

Attribution: vulnerability data from OSV.dev; each record remains under its source database licence.

## Gaps

- Package registry metadata (licence, downloads) and Developer Index docs lookups were discovered (`npmjs-com/packages/*`, `firecrawl-developer-index/search`) but not executed — tool listings are not data.
- Docker Hub and NVD were not relevant to this offline web app.
- A first OSV attempt failed with `invalid_option` (wrong query shape); the purl form succeeded.
