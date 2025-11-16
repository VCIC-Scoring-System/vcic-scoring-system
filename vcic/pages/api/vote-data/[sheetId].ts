// pages/api/vote-data/[sheetId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { sheets } from '@/lib/googleSheetsClient'; // Import your helper
import { EventData, Team, Judge, ApiError } from '@/lib/types';

// ---
// Helper function to read a tab and return structured data (This is fine)
// ---
async function fetchTabAsJson(spreadsheetId: string, tabName: string, range: string) {
  // ... (Your existing function, no changes needed)
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!${range}`,
  });
  return response.data.values || [];
}

// ---
// Helper: Gets the Event Name from MasterIndex using sheetId (reverse lookup)
// ---
async function getEventNameBySheetId(sheetId: string): Promise<string> {
  const masterSheetId = process.env.MASTER_INDEX_SHEET_ID;
  const headerRange = 'MasterIndex!A1:H1';
  const dataRange = 'MasterIndex!A2:H';

  const [headerResponse, dataResponse] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: masterSheetId, range: headerRange }),
    sheets.spreadsheets.values.get({ spreadsheetId: masterSheetId, range: dataRange }),
  ]);

  const headers = headerResponse.data.values?.[0] || [];
  const rows = dataResponse.data.values || [];

  const eventRow = rows.find((row) => row[headers.indexOf('sheet_id')] === sheetId);
  if (!eventRow) {
    return 'Event Title'; // Fallback if not found
  }

  return eventRow[headers.indexOf('event_name')] || 'Event Title';
}

// ---
// The Main API Handler
// ---
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EventData | ApiError>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. GET THE SECRET sheetId FROM THE URL (NOT eventId)
    const { sheetId } = req.query;
    if (typeof sheetId !== 'string') {
      return res.status(400).json({ error: 'Invalid sheetId' });
    }

    // 2. Fetch event name, teams and judges in parallel
    const [eventName, teamRows, judgeRows] = await Promise.all([
      getEventNameBySheetId(sheetId),
      fetchTabAsJson(sheetId, 'teams', 'A2:D'), // id, name, photo, is_active
      fetchTabAsJson(sheetId, 'judges', 'A2:D'), // id, name, photo, is_active
    ]);

    // 3. Process and filter the data (Your code is perfect)
    const teams: Team[] = teamRows
      .map((row) => ({
        team_id: row[0],
        team_name: row[1],
        photo_url: row[2],
        is_active: row[3] === 'TRUE',
      }))
      .filter((team) => team.is_active);

    const judges: Judge[] = judgeRows
      .map((row) => ({
        judge_id: row[0],
        judge_name: row[1],
        photo_url: row[2],
        is_active: row[3] === 'TRUE',
      }))
      .filter((judge) => judge.is_active);

    res.status(200).json({ eventName, teams, judges });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
}