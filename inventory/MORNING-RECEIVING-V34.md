# Morning Receiving Module — Inventory v34

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
