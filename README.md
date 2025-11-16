# VCIC Scoring System

A Next.js (pages router) web app for VCIC event listings, judge voting, and public scoreboards backed by Google Sheets/Drive.

## Tech stack
- Runtime: Node.js (Next.js 15, React 19)
- Styling: Tailwind (via PostCSS)
- Data: Google Sheets + Drive (service account)
- State/data fetching: TanStack Query 5
- UI: Radix + custom components

## Prerequisites
- Node.js 18+ and npm
- A Google service account with access to:
  - Master Index sheet (1)
  - Event template sheet (for copying)
  - Destination Drive folder for event copies
- `.env.local` populated (see below)

## Installation
```bash
npm install
```

## Environment variables (`.env.local`)
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY` (escape newlines: replace actual newlines with `\n`)
- `MASTER_INDEX_SHEET_ID`
- `EVENT_SHEET_TEMPLATE_ID`
- `GOOGLE_DRIVE_FOLDER_ID`
- `ADMIN_TOKEN`

## Development
```bash
npm run dev
# app at http://localhost:3000
```

## Build & start (production)
```bash
npm run build
npm start
```

## Key features and paths
- Event list: `/events` (search, MBA/Undergrad filters, status badges)
- Scoreboard: `/scoreboard/[eventId]`
  - Live: shows “Event in Progress.”
  - Final: shows overall + round tables; scoring rule 3/2/1 displayed.
- Judge voting: `/judge/[sheetId]/vote/[judgeId]`
  - Rounds: Due Diligence, Written Deliverables, Partner Meeting
  - Places: 1st/2nd/3rd; unique per round enforced
  - History: `/judge/[sheetId]/history/[judgeId]`

## Admin operations
- Preferred: `POST /api/admin/create-event` with `ADMIN_TOKEN` and payload (event metadata + teams/judges). Duplicates template sheet, seeds teams/judges, appends Master Index with status `Live`. Duplicate `event_id` returns 409.
- Manual fallback (sheets):
  1) Copy the event template sheet; rename it.
  2) In Master Index add a row: `event_id` slug (e.g., `test-event-1`), `event_name`, copied `sheet_id`, date/host fields, `status` = `Live` or `Final` (case-sensitive).
  3) In the event sheet edit only `teams` and `judges` (name, photo_url, is_active). IDs auto-generate when name is filled; set is_active FALSE only to soft-delete. Do not edit `votes_data`, `votes_to_points`, `scoreboard`, or `votesview` (auto-managed).
  4) Set `status` to `Final` in Master Index to publish the scoreboard.

## Documentation
- User guide: `doc/user.md`
- Admin guide: `doc/admin.md`

## Troubleshooting
- “Invalid or missing admin token”: verify `ADMIN_TOKEN` in body/env.
- 409 on create-event: `event_id` already exists in Master Index.
- “Event not found” when voting: Master Index `sheet_id` missing/mismatched.
- Blank scoreboard: ensure Master Index `status` = `Final` and event sheet `scoreboard` tab has data.
