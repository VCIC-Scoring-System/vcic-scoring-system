# VCIC Scoring System - User Guide

This guide covers the current web experience based on the implemented Next.js + Google Sheets app: browsing events, viewing scoreboards, and judge voting flows.

## Event list
- Path: `/events`
- Features: search box, category tabs (MBA / Undergraduate), status badge ("live" 🟢 or "final" 🏁), date, host, and a button to open the scoreboard for each event.

## Scoreboard
- Path: `/scoreboard/[eventId]`
- Live status: shows "Event in Progress."
- Final status: shows overall rankings and per-round tables (Due Diligence, Written Deliverables, Partner Meeting), plus the scoring rule displayed in-app: 3 points for #1 votes, 2 points for #2 votes, 1 point for #3 votes.

## Judge voting
- Path: `/judge/[sheetId]/vote/[judgeId]`
- Rounds: "Due Diligence," "Written Deliverables," "Partner Meeting."
- Places: "1st Place," "2nd Place," "3rd Place."
- Flow:
  1) Choose a round.
  2) Choose a place.
  3) Tap a team card (only active teams appear).
  4) Submit. The app enforces unique teams per 1st/2nd/3rd for the selected round.
- Vote history: link in the header goes to `/judge/[sheetId]/history/[judgeId]` to review prior submissions by round/place.
