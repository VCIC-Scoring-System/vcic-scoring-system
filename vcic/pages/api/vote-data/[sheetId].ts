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

    // 2. Fetch all teams and judges from that sheet in parallel
    // (We pass the sheetId from the URL directly to the helper)
    const [teamRows, judgeRows] = await Promise.all([
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

    res.status(200).json({ teams, judges });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
}