# VCIC Scoring System
License: MIT | Platform: Next.js (pages router) | Status: Production pilot | Data: Google Sheets + Drive | Language: TypeScript | Docs: Included | PRs: Welcome

> **Note**
> Every event is backed by one Master Index sheet plus an event-specific copy of the VCIC template. Keep the `status` column accurate ("Live" hides scores, "Final" publishes them) and edit only the `teams` and `judges` tabs in each event sheet.

VCIC Scoring System is a lightweight control plane for Venture Capital Investment Competition events. The app lists MBA and Undergraduate brackets, collects judge ballots, and publishes public scoreboards while using Google Sheets and Drive as the single source of truth.

## Quick Example
A trimmed component from `pages/events/index.tsx` that powers the searchable event grid:

```tsx
export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<"MBA" | "Undergraduate">("MBA");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data.events);
      setFilteredEvents(data.events.filter((e: EventItem) => e.category === "MBA"));
    }
    load();
  }, []);

  useEffect(() => {
    const results = events.filter((evt) => {
      const matchCat = evt.category === selectedCategory;
      const matchSearch = evt.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
    setFilteredEvents(results);
  }, [search, selectedCategory, events]);
}
```

## Quick Links
- [Getting Started](#getting-started)
- [Environment Reference](#environment-reference)
- [Documentation Plan](vcic/DocumentationPlan.md)
- [User Guide](vcic/doc/user.md)
- [Admin Guide](vcic/doc/admin.md)

## Why Choose VCIC Scoring System?

### Sheets-first orchestration
- Master Index drives routing, event metadata, and scoreboard availability.
- Each per-event sheet carries tabs for teams, judges, votes, and derived scoreboards with auto-generated IDs.
- Google Drive template duplication plus service account access keeps provisioning simple.

### Judge and attendee experience
- `/events` exposes search, MBA/Undergraduate toggles, and live/final badges.
- `/scoreboard/[eventId]` mirrors sheet data: "Event in Progress" while `status` is Live, full standings (overall plus round tables) once Final.
- `/judge/[sheetId]/vote/[judgeId]` enforces unique placements per round and links to `/history` for quick audits.

### Admin-friendly workflows
- Preferred path: `POST /api/admin/create-event` duplicates the template, seeds teams/judges, and appends Master Index rows with status `Live`.
- Manual fallback stays entirely in Sheets: copy the template, update Master Index, edit teams/judges only, and flip `status` to `Final` when ready.
- Service account credentials live in `.env.local`, so there is no extra database to maintain.

### Next.js developer ergonomics
- Next.js 15 (pages router) + React 19, Tailwind via PostCSS, and TanStack Query keep the UI modern.
- Local `npm run dev` gives hot reload, while `npm run build && npm start` matches deployment.
- Components live under `vcic/components`, and API routes under `vcic/pages/api`.

### Proven VCIC workflows
- Supports MBA and Undergraduate formats, including multi-round scoring (Due Diligence, Written Deliverables, Partner Meeting).
- Handles event soft-deletes via `is_active` flags in Sheets instead of destructive edits.
- Troubleshooting playbook is documented for admin token errors, duplicate IDs, or blank scoreboards.

## Feature Highlights
- Flexbox-based layouts styled with Tailwind CSS.
- Searchable, filterable event list with status chips and host info.
- Judge voting UI with unique placement enforcement and history view.
- Live/final scoreboard states derived directly from Sheets data.
- `/api/admin/create-event` endpoint for automated provisioning.
- Built-in documentation for both users and admins (`vcic/doc`).

## Getting Started
1. Install Node.js 18 or newer (npm included).
2. Create a Google Cloud service account with Sheets and Drive access to:
   - The Master Index sheet (global event list).
   - The event template sheet copied per event.
   - The Drive folder where event copies will live.
3. Duplicate `.env.local.example` or create `.env.local` and provide the credentials below.
4. Install dependencies and start the dev server:

```bash
cd vcic
npm install
npm run dev # http://localhost:3000
```

For production:

```bash
npm run build
npm start
```

## Environment Reference

| Variable | Description |
| --- | --- |
| `GOOGLE_CLIENT_EMAIL` | Service account email that owns the sheets. |
| `GOOGLE_PRIVATE_KEY` | Service account private key (escape line breaks as `\n`). |
| `MASTER_INDEX_SHEET_ID` | Spreadsheet ID of the Master Index (1 sheet). |
| `EVENT_SHEET_TEMPLATE_ID` | Spreadsheet ID for the event template copy. |
| `GOOGLE_DRIVE_FOLDER_ID` | Folder ID where duplicated sheets are stored. |
| `ADMIN_TOKEN` | Shared secret required by `/api/admin` routes. |

## Core Workflows

### Event discovery
- Path: `/events`
- Includes search, MBA/Undergraduate toggles, live/final badges, date, host, and direct scoreboard link.

### Scoreboards
- Path: `/scoreboard/[eventId]`
- Live status: shows "Event in Progress."
- Final status: renders overall rankings plus round tables with 3/2/1 scoring rule.

### Judge voting
- Path: `/judge/[sheetId]/vote/[judgeId]`
- Rounds: Due Diligence, Written Deliverables, Partner Meeting.
- Places: 1st, 2nd, 3rd; the UI enforces unique teams per round.
- History: `/judge/[sheetId]/history/[judgeId]` lists prior submissions.

### Admin operations
- API: `POST /api/admin/create-event` (requires `ADMIN_TOKEN`). Payload includes Master Index metadata plus arrays of teams and judges (name + photo URL). Duplicate `event_id` returns HTTP 409.
- Manual fallback:
  1. Copy the event template sheet and rename it.
  2. Add a Master Index row with the new `event_id`, `event_name`, `sheet_id`, date/host fields, and `status` (`Live` or `Final`).
  3. In the event sheet, edit only `teams` and `judges` (name, `photo_url`, `is_active`). IDs populate automatically once a name is provided.
  4. Switch `status` to `Final` when you want the public scoreboard to appear.

## Troubleshooting
- "Invalid or missing admin token" -> confirm `ADMIN_TOKEN` in `.env.local` and request bodies.
- HTTP 409 on `create-event` -> `event_id` already exists in the Master Index.
- "Event not found" during judge voting -> Master Index `sheet_id` is missing or incorrect.
- Blank scoreboard -> ensure Master Index `status` is `Final` and the event sheet `scoreboard` tab contains data.

## Need Help?
- User flows: [vcic/doc/user.md](vcic/doc/user.md)
- Admin workflows and edge cases: [vcic/doc/admin.md](vcic/doc/admin.md)

## Contributing
Issues and pull requests are welcome. Please keep edits focused on the Sheets-driven workflow documented above and include updates to `vcic/doc` when behavior changes.

## License
Distributed under the [MIT License](LICENSE).
