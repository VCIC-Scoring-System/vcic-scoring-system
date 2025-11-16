# VCIC Scoring System - Documentation Plan

This plan reflects the current Next.js + Google Sheets scoring system (event listings, judge voting, scoreboards, and the admin create-event API) and the provided 1+N Google Sheets model.

## Audiences and skill assumptions
- Judges (primary users): adult professionals, comfortable with web apps; want concise voting steps and clear submission confirmation.
- Public viewers (scoreboard): general audience; read-only access to live/final standings.
- Event admins (operations): staff who configure events and manage Google Sheets; comfortable with spreadsheets and basic tokens/URLs, not coding.
- System operators (deployment/infra): developers or IT staff who deploy the Next.js app and connect the service account to Sheets/Drive assets.

## Delivery mechanisms
- User manual: web/PDF-ready page for judges and public viewers; drill-down style.
- Admin manual: web/PDF-ready page for the Sheets model, environment variables, event creation (API and manual), and troubleshooting.
- README files: `vcic/README.md` remains for developer setup; new `docs/admin.md` and `docs/user.md` will hold the manuals.
- In-app cues already present: scoreboard page lists the 3/2/1 scoring rule; judge voting page links to vote history.

## Content outline by audience

### Judges (user manual section)
- Access: navigate to `/judge/[sheetId]/vote/[judgeId]`; header shows the judge name with a link to history.
- Rounds and placements: three rounds ("Due Diligence," "Written Deliverables," "Partner Meeting"); select 1st/2nd/3rd with unique teams enforced.
- Voting flow: choose round, choose a place, pick a team card, submit; confirmation page summarizes the submission.
- Limits: inactive teams are hidden; history available at `/judge/[sheetId]/history/[judgeId]`.

### Public viewers (user manual section)
- Event list (`/events`): search, filter MBA/Undergraduate, status badges ("live" vs "final" icons).
- Scoreboard (`/scoreboard/[eventId]`):
  - Live status: shows "Event in Progress" message.
  - Final status: shows overall rankings, per-round tables, and the 3/2/1 scoring rule.

### Event admins (admin manual)
- Data model (1+N Sheets):
  - MasterIndex (1): columns include `event_id`, `event_name`, `sheet_id`, `event_type`, `event_date`, `host_name`, `host_logo_url`, `status` ("Live" hides scores; "Final" publishes).
  - Per-event sheet (N): tabs `votes_to_points` (do not modify), `scoreboard` (do not modify), `teams` (edit: name, photo_url, is_active), `judges` (edit: name, photo_url, is_active), `votes_data` (system-managed), `votesview` (read-only). Only `teams` and `judges` should be edited; scoreboard auto-sorts.
- Creating events via API:
  - POST `/api/admin/create-event` with admin token and payload (IDs/names, type MBA/Undergraduate, date, host info/logo URL, teams, judges). Backend copies the template Sheet into the target Drive folder, seeds teams/judges, and appends a MasterIndex row with status `Live`. Duplicate `event_id` returns HTTP 409.
- Creating events manually (fallback provided):
  - Copy the event template sheet and rename it.
  - Add a MasterIndex row with meaningful `event_id` (slug like `test-event-1`), `event_name`, copied `sheet_id` (required), date/host fields, and status `Live` or `Final` (case-sensitive).
  - In the event sheet, fill only `teams` and `judges` (name, optional photo_url, is_active TRUE). IDs auto-generate; set is_active FALSE only to soft-delete after issues.
  - Do not modify `votes_data`, `votes_to_points`, `scoreboard`, or `votesview`; they are system-managed.
- Publishing: change MasterIndex status to `Final` when ready to show scores.
- Troubleshooting:
  - "Event not found" on voting usually means `sheet_id` is missing or mismatched in MasterIndex.
  - Blank scoreboard: confirm status is `Final` and the `scoreboard` tab has data.

### System operators (deployment and integration)
- Stack: Next.js 15 (pages router), React 19, Google Sheets/Drive via a service account backend.
- Environment variables (`.env.local`): `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` (newlines escaped), `MASTER_INDEX_SHEET_ID`, `EVENT_SHEET_TEMPLATE_ID`, `GOOGLE_DRIVE_FOLDER_ID`, `ADMIN_TOKEN`.
- Permissions: service account needs Sheets + Drive scopes and access to the template, MasterIndex, and destination folder.
- Runtime: `npm run dev` for local; `npm run build` then `npm start` for production. No database beyond Google Sheets.
- Secrets: keep `.env.local` out of version control; rotate `ADMIN_TOKEN` as needed.

## Artifacts to produce
- `docs/user.md`: judge and public viewer guidance with step-by-step flows.
- `docs/admin.md`: 1+N Sheets model, API/manual event creation, environment variables, and troubleshooting.

## Validation of documentation
- Exercise end-to-end on a staging sheet: create event (API and manual), submit votes, publish scoreboard; ensure instructions match UI labels ("Submit Vote," status badges, round names).
- Re-run admin steps to confirm MasterIndex and sheet edits produce expected API and UI behavior.
