# Maintenance Production Release — 2026-08-23 v32

This folder is the canonical source snapshot for the maintenance production state after the atomic maintenance-update hardening.

## Production endpoints

- Requester app: https://damascene-maintenance-request.vercel.app/
- Manager app: https://damascene-maintenance.vercel.app/maintenance
- Short links: https://azwad-m.vercel.app/<ticket_no>
- Supabase project: vvkrladsjicbvopvszsb

## Production deployments

- Requester Vercel project: prj_EC50yrrWHcCeR2qs6kYoHHeTUPbg
- Requester production deployment: dpl_CPejrxFzWVGqLwfSCFXfYVEUvkpA
- Manager Vercel project: prj_WvdzbYetMR4PAVhofH5K7TRuKcZ5
- Manager production deployment: dpl_BxzRuEgeVbepzmADUvjzGZusGEBK
- Manager bundle function: maintenance-app-bundle-v32
- Manager bundle function version: 1

## Database release

The manager update workflow uses `public.update_maintenance_request_atomic(...)` so request status changes and the corresponding request_updates row are committed in one PostgreSQL transaction.

Migration files in this release contain the exact production RPC definition.

## Requester source

`requester/` contains the deployable files from the current requester production app, including PWA v15, password show/hide UI, image/video attachments, and `/share` HTML routing.

## Manager source

`manager/` contains the exact Vercel loader/service-worker/manifest used in production. The loader points to `maintenance-app-bundle-v32`.

`edge-functions/maintenance-app-bundle-v32/index.ts` contains the deployed v32 wrapper that preserves v31 mobile UI and overrides maintenance updates to use the atomic RPC.

## Deployment rule

Never deploy directly to Production first. Build a Preview using the complete file set, verify deployment file counts and health endpoints, then deploy the identical file set to Production.

Requester Preview must not be used to create real test data while it points at the production Supabase project. A separate Supabase staging branch is tracked as a separate hardening item.
