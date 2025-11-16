# VCIC Scoring System - Admin Guide

This guide explains how to administer the current Next.js + Google Sheets scoring system. It covers the 1+N Sheets model, creating events (API and manual), publishing results, environment configuration, and common issues.

## Sheets data model (1 + N)
- **Master Index (1):** One row per event; columns include `event_id`, `event_name`, `sheet_id`, `event_date`, `host_name`, `host_logo_url`, and `status` (`Live` hides scores, `Final` publishes scores). The front-end event list and scoreboard routing read from this sheet.
- **Per-event sheet (N):** Tabs:
  - `votes_to_points` — do not modify.
  - `scoreboard` — do not modify.
  - `teams` — edit name, photo_url, is_active.
  - `judges` — edit name, photo_url, is_active.
  - `votes_data` — stores vote records; do not modify.
  - `votesview` — read-only view of votes; do not modify.
- Only `teams` and `judges` should be edited by admins; all other tabs are system-managed. `scoreboard` auto-sorts by score.

## Creating events via API (preferred)
- Endpoint: `POST /api/admin/create-event`
- Auth: include `ADMIN_TOKEN` in the request body.
- Payload (CreateEventPayload):
  - Master Index fields: `event_id`, `event_name`, `event_type` (MBA | Undergraduate), `event_date`, `host_name`, `host_logo_url`.
  - Event sheet fields: arrays of `teams` (name, photo_url) and `judges` (name, photo_url).
- Behavior:
  - Copies the template sheet (`EVENT_SHEET_TEMPLATE_ID`) into the Drive folder (`GOOGLE_DRIVE_FOLDER_ID`).
  - Generates IDs and seeds `teams` and `judges` with `is_active = TRUE`.
  - Appends a Master Index row with status `Live`.
  - Duplicate `event_id` returns HTTP 409.

## Creating events manually (fallback)
1) In the event template, make a copy and rename it to the new event.
2) In Master Index, add a row:
   - `event_id`: meaningful slug, e.g., `test-event-1`.
   - `event_name`: event name.
   - `sheet_id`: the copied sheet’s ID (required).
   - Date and host fields.
   - `status`: exactly `Live` or `Final` (case-sensitive). `Live` hides scores; `Final` publishes the scoreboard.
3) In the new event sheet, fill only `teams` and `judges`:
   - Provide name, photo_url, is_active. IDs are auto-generated when you add names.
   - photo_url: use the VCIC site image address (copy image address and paste).
   - Normally set is_active = TRUE. To soft-delete (e.g., after a voting correction), set to FALSE.
4) Do not edit `votes_data`, `votes_to_points`, `scoreboard`, or `votesview`; they update automatically. The scoreboard tab will reorder teams by score.

## Publishing results
- Change `status` in Master Index from `Live` to `Final` to publish the scoreboard. While `Live`, the front-end scoreboard shows “Event in Progress.”

## Environment and deployment
- Stack: Next.js 15 (pages router), React 19, Google Sheets/Drive via service account.
- `.env.local` variables:
  - `GOOGLE_CLIENT_EMAIL`
  - `GOOGLE_PRIVATE_KEY` (newline characters escaped)
  - `MASTER_INDEX_SHEET_ID`
  - `EVENT_SHEET_TEMPLATE_ID`
  - `GOOGLE_DRIVE_FOLDER_ID`
  - `ADMIN_TOKEN`
- Permissions: the service account must have Sheets + Drive access to the template sheet, Master Index sheet, and destination folder.
- Run locally: `npm run dev`. Production: `npm run build` then `npm start`. The app uses Google Sheets only (no separate database).

## Troubleshooting
- “Invalid or missing admin token”: check `ADMIN_TOKEN` in the request and in `.env.local`.
- HTTP 409 on create-event: `event_id` already exists in Master Index.
- “Event not found” during voting: the `sheet_id` is missing or mismatched in Master Index.
- Blank scoreboard: ensure Master Index `status` is `Final` and the event sheet’s `scoreboard` tab contains data.
