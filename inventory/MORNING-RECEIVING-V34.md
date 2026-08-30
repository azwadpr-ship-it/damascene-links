# Morning Receiving Module — Inventory v34

## Permanent resume point — V109 Mazaq report title

- Scope is visual and limited to the generated Mazaq morning receiving report header.
- The two-line Mazaq header (`المذاق الدمشقي` / `تقرير الاستلام الصباحي`) is replaced at runtime by the single red title `الاستلام الصباحي - المذاق`.
- Mazaq header font is `700 39px Tahoma,Arial`, right-aligned at the existing header anchor so the complete Arabic title remains inside the unchanged 1080×1920 report canvas.
- Individuals and Families retain their original report header text and layout; the receiving page, report dimensions, dates, receiver, summary, sections, items, quantities, image generation, and PDF generation are otherwise unchanged.
- Runtime cache marker is `morning-report-v1.js?v=23`; the inner receiving page remains `inner=21` because its code was not changed.
- No-write visual verification renders the header at the real 1080×1920 JPEG size and re-renders the derived one-page 540×960-point PDF; the exact Arabic title remains on one line with clear space from the date block and report edge.
- Production database, Catalog, RLS, Edge Functions, and Day Rollover are unchanged. No receiving batch is created by visual verification.

## Permanent resume point — V108 Samsung first-paint completion

- Baseline before V108: `b7bc535cd1f929cd8b2a1d00b0bd93c37f02f3a2` (`Render receiving catalog before snapshot`).
- Production acceptance target after deployment: `TECHNICALLY DEPLOYED / SAMSUNG USER ACCEPTANCE REQUIRED`.
- Normal acceptance URL: `/inventory/morning-shell.html?v=108`.
- Samsung diagnostics URL: `/inventory/morning-shell.html?v=108&diag=1`.
- Cache/runtime markers: inner receiving page `inner=21`; report runtime request `morning-report-v1.js?v=22` (redirected by Vercel to `morning-report-v105.js`).
- The receiving page captures its original `fetch` before the report runtime can wrap `window.fetch`.
- Catalog loading has a bounded 10-second timeout covering both the request and JSON body parsing. Timeout or malformed JSON always exits loading and shows a visible retry button.
- The Catalog loading/error panel uses `.catalog-status`, never `.history`, so the report runtime cannot mistake loading for a completed first render.
- The report runtime is injected only after a published receiving state confirms that Catalog data exists and the DOM contains the same non-zero number of quantity inputs.
- Mazaq Snapshot remains a five-second background task. Its success, failure, or timeout cannot block Catalog first paint; a successful background refresh restores the draft quantities, batch note, focused quantity field, and scroll position as far as the browser supports.
- For the currently rendered date, the report uses `window.__morningReceivingState.data` even when there are zero batches. It does not make another `receiving_load` call.
- Historical report loads remain supported with an eight-second timeout, same-date request deduplication, and cancellation of a superseded different-date request when supported.
- Optional `diag=1` is passed from the shell into the iframe and displays only phase names, elapsed time, HTTP status, item/input counts, timeout/error class, and report-injection time. Tokens, usernames, and response bodies are not displayed.
- Controlled no-write verification covers: 57-item Mazaq render; hung fetch; hung/invalid JSON; Snapshot independence; draft/note/position preservation contract; report injection order; current-date state reuse; historical deduplication/timeout; and unchanged Individuals/Families rendering paths.
- Production database, Catalog, RLS, and Edge Functions are unchanged by V108. No receiving batch is created by verification.
- V108 is not functionally accepted until the employee's Samsung device confirms first paint through the V108 URL. Logo/JPG/PDF acceptance and Day Rollover remain open and must not be closed from technical deployment alone.

## Purpose
The morning receiving module records every physical item received by each restaurant during the day and preserves an auditable batch history. It is deliberately isolated from evening inventory authentication.

## Live routes
- Main inventory: `/inventory/`
- Morning supervisors: `/inventory/morning/`
- Manager morning audit: `/inventory/morning/manager.html`

## Morning users
Morning usernames are stored in `inventory_receiving_users`, not `inventory_users`. They cannot authenticate into the evening inventory application.

- `afrad-am` -> `individuals`
- `awail-am` -> `families`
- `mazaq-am` -> `mazaq`

Passwords are intentionally not documented in the repository.

## Data model
- `inventory_receiving_users`
- `inventory_receiving_sessions`
- `inventory_receiving_batches`
- `inventory_receiving_entries`

Each save creates a batch with timestamp, supervisor, optional note, and one or more item quantities. Batches are never edited by supervisors after posting. Corrections are manager-only void operations, preserving audit history.

## Business workflow
1. Morning supervisor logs in to the dedicated receiving page.
2. The page loads only active physical inventory items for that supervisor's restaurant. Sales-only items and `تقرير التطبيق` are excluded.
3. The supervisor enters only the quantities received in the current delivery and saves one batch.
4. Later deliveries are saved as additional batches; daily totals accumulate automatically.
5. For `flow` items, posted receiving totals become the authoritative evening `incoming_qty`.
6. For stock-only items (notably Mazaq), the morning received quantity remains available as receipt context/audit data while end-of-day stock remains a separate closing count.
7. After an evening report is submitted, new morning batches and manager voids for that branch/date are blocked.

## Integrity and safety
- Morning authentication is isolated from evening authentication.
- Receiving tables have RLS enabled and are accessed through the custom authenticated Edge Function.
- Login attempts are logged and morning login is rate-limited after repeated failures.
- Batch posting is an atomic database transaction: batch + entries + evening sync succeed together or roll back together.
- Manager void is an atomic database operation and is blocked after evening report submission.
- A database trigger enforces morning receiving totals on evening flow-item `incoming_qty`, preventing stale browser state or manual client requests from overwriting morning totals once receiving has started for the day.
- Evening UI marks morning-linked incoming values read-only and refreshes on focus and periodically.
- Manager dashboard shows receiving status per branch; a dedicated audit page shows all batches and allows pre-submission void corrections.

## Verification performed
- Temporary future-date batch created and synchronized to evening incoming quantity successfully.
- Database enforcement tested by attempting to overwrite the synchronized incoming value with an incorrect value; the database restored the real receiving total.
- Atomic batch RPC tested on a temporary future date and synchronized successfully.
- All temporary test batches/reports were deleted after verification.
- Production Vercel routes return HTTP 200.
- Receiving Edge Function is ACTIVE.

## Branch item scope at implementation time
- المشويات أفراد: 92 physical morning items; 32 flow items link directly to evening incoming.
- المشويات عوائل: 79 physical morning items; 26 flow items link directly to evening incoming.
- المذاق الدمشقي: 45 physical morning items; current evening model is stock-only, so receiving is shown as context/audit while end-of-day stock remains independent.

## Rollback / recovery
All frontend changes are versioned in GitHub. The main inventory report generator remains unchanged from report v32; morning receiving integration is additive. Database migrations are isolated to receiving tables/functions/triggers plus the enforcement trigger on `inventory_entries`.
