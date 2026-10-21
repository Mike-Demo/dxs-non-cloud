# Security audit remediation backlog (2026-10-21)

Issue creation was unavailable in this session, so the following issue titles and bodies are ready to file. Each issue links back to the parent audit issue, [#1](https://github.com/Mike-Demo/dxs-non-cloud/issues/1).

## Priority order

1. **Medium — Cart lookup and checkout skip publication checks.** Anonymous shoppers can enumerate variants and complete simulated purchases for unpublished products, making this the highest-risk confirmed finding.
2. **Low — Email-gated resource downloads.** Any anonymous visitor can fetch files represented as email-gated, so this is directly reachable on a public read path.
3. **Low — Media upload trusts caller-declared metadata.** The repository boundary accepts unverified payloads from direct callers; the stated exposure depends on access to that operation.

These findings have separate root causes and are not grouped.

## Ready-to-file remediation issues

### `[security][medium] Block cart lookup and checkout for unpublished products`

**Parent:** [Security audit 2026-10-21 — #1](https://github.com/Mike-Demo/dxs-non-cloud/issues/1)

**Evidence:** `listVariants` and `checkout` in `src/lib/data/mock.ts` resolve variants and parent products from raw data without applying `isPubliclyVisible` or checking availability. An anonymous shopper can enumerate variants of unpublished products and complete a simulated checkout for draft, scheduled, archived, or discontinued products, decrementing stock and creating an order with `paymentState: simulated_paid`.

**Root cause:** `listVariants` (reported at `mock.ts:152-159`) and `checkout` (reported at `mock.ts:231-260`) bypass the `visible()` / `isPubliclyVisible` filter used by `getProduct` and `listProducts`; checkout also does not reject discontinued products. The publication predicate is not enforced at the final trusted commerce decision point.

**Smallest fix:** Resolve parent products in `listVariants` and `checkout` through the same `visible()` filter used by other public reads, treating variants of non-public products as `unknown_variant`; reject `availability: discontinued` at checkout.

### `[security][low] Enforce email gates before serving resource downloads`

**Parent:** [Security audit 2026-10-21 — #1](https://github.com/Mike-Demo/dxs-non-cloud/issues/1)

**Evidence:** `Resource.access` can be `public` or `email-gated`, and the resource index labels gated entries “Email required,” but no read or render path checks the access value. `getResource` and `listResources` filter only by publication visibility, while the detail page renders a download link whenever `filePath` is present. An anonymous visitor can download the gated fixture whitepaper without submitting an email.

**Root cause:** `Resource.access` is used for the index badge and in the admin editor/schema, but is not enforced by resource reads or the detail-page download render path. Consequently, `filePath` is exposed unconditionally for email-gated records.

**Smallest fix:** Enforce access at the last trusted decision point: withhold `filePath` in `getResource` (or the resource page loader) for email-gated records until the visitor has submitted an email, and render the download only after that check passes.

### `[security][low] Validate uploaded media payloads at the repository boundary`

**Parent:** [Security audit 2026-10-21 — #1](https://github.com/Mike-Demo/dxs-non-cloud/issues/1)

**Evidence:** `uploadMedia` in `private-ops.ts` (reported at lines 342-350) checks only caller-declared `mimeType` and `sizeBytes`, then stores `dataUrl` verbatim as the public `MediaAsset.path`. It does not derive the byte length, verify the data-URL media type, or reject non-data URLs. A direct `Repository` caller can therefore store external URLs or oversized/mistyped payloads later rendered as image sources. `profileSchema.avatarDataUrl` has the same repository-layer validation gap.

**Root cause:** `uploadMedia` trusts caller-provided scalar metadata instead of validating and measuring the payload; the `File.type` and `File.size` checks exist only in the UI and can be bypassed by repository callers. The profile schema likewise accepts an unconstrained `avatarDataUrl` string.

**Smallest fix:** In `uploadMedia`, require `dataUrl` to match `^data:(image/(jpeg|png|webp|gif));base64,`, require its media type to equal `input.mimeType`, compute decoded byte length, enforce `MAX_UPLOAD_BYTES` against that length, and store the computed `sizeBytes`. Apply equivalent data-URL media-type and decoded-length validation to `profileSchema.avatarDataUrl`.

## Ready-to-file needs-validation checklist issue

### `[security][needs-validation] Audit leads to validate`

**Parent:** [Security audit 2026-10-21 — #1](https://github.com/Mike-Demo/dxs-non-cloud/issues/1)

- [ ] **Stored-content URLs render as `href` with no scheme allowlist (`javascript:`/`data:` links survive save and render).** Fingerprint: `unsanitised-url-schemes-in-stored-content-links`. Claimed root cause: `saveContent` spreads the post body unparsed, so RichText link `href`s are never validated; `eventFieldsSchema` `onlineUrl` uses Zod `.url()`, which accepts any parseable scheme including `javascript:`; and RichText/events/authors/index render sites emit `href` verbatim with no scheme allowlist or sanitizer in `src/`. **Exact missing fact in the parent issue:** “Whether the bundled React 19.2 ReactDOM production build rewrites or blocks a `javascript:` URL passed to an `<a href>` at render time (ReactDOM sanitizeURL behaviour for anchor hrefs in this exact version), and, for `data:` URLs, whether the target browsers execute a user-clicked `data:text/html` top-level navigation - both are runtime facts absent from …”

The parent issue’s supplied missing-fact text ends with an ellipsis; no additional missing fact was available in the issue description or comments.
