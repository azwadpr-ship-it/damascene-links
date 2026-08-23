# Maintenance Production Release — 2026-08-23 v33

This directory is the canonical source snapshot for the live maintenance system after closing the four production-risk items.

## Live production
- Requester: https://damascene-maintenance-request.vercel.app/
- Manager: https://damascene-maintenance.vercel.app/maintenance
- Short links: https://azwad-m.vercel.app/<ticket_no>
- Supabase project: `vvkrladsjicbvopvszsb`

## Versions
- Requester PWA: `maintenance-pwa-v16`
- Manager UI bundle: `v33`
- Manager v33 Edge SHA256: `bc3a32de13420ef4434157fa1a14d149c55f4ce1544c876b4908ab291a9370e9`
- Requester production deployment: `dpl_EiZYZkcSCHYgNcvwuo45HcgrA77S`
- Manager production deployment: `dpl_9QmgC7xg7dqR2dD37fT2etCMRagQ`

## Closed production risks
1. Manager status update is atomic through `update_maintenance_request_atomic`.
2. Vercel Preview is isolated from production data through staging tables, staging storage and staging push subscriptions.
3. This release is the GitHub source-of-truth snapshot for the current production state.
4. Disaster backup is built separately and verified before the temporary export function is disabled.

## Requester Preview isolation
`preview-guard.js` is loaded before `app.js`. On official production hostnames it exits without changing anything. On Vercel preview hostnames it rewrites maintenance request and attachment traffic to staging tables/bucket and disables WhatsApp sharing for test requests.

## Manager Preview isolation
`maintenance-app-bundle-v33` injects the staging guard before the v32 application runs. Preview routes use:
- `staging_maintenance_requests`
- `staging_request_updates`
- `staging_request_attachments`
- `staging_maintenance_push_subscriptions`
- `maintenance-staging-images`
- `update_staging_maintenance_request_atomic`

Production domains continue to use the production tables and bucket.

## Restore order
1. Recreate Supabase schema using the full historical migrations plus the SQL files in `migrations/`.
2. Deploy `edge-functions/maintenance-app-bundle-v33/index.ts` after v32 is available.
3. Deploy `requester/` to project `damascene-maintenance-request`.
4. Deploy `manager/` to project `damascene-maintenance`.
5. Restore production data and Storage from the disaster backup.
6. Recreate private secrets; private secret values are intentionally not stored in this public repository.

Never put service-role keys, VAPID private keys, dispatch secrets, passwords, or signed backup URLs in this repository.