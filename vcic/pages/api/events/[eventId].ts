// pages/api/events/[eventId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { sheets } from '@/lib/googleSheetsClient'; // Import your helper
import { EventData, Team, Judge, ApiError } from '@/lib/types';

// ---
// Helper function to find the Sheet ID from the MasterIndex
// ---
async function getEventSheetId(eventId: string): Promise<string> {
  const masterSheetId = process.env.MASTER_INDEX_SHEET_ID;
  const range = 'MasterIndex!A2:C'; // We need event_id (col A) and sheet_id (col C)

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: masterSheetId,
    range: range,
  });

  const rows = response.data.values;
  if (!rows) {
    throw new Error('MasterIndex sheet is empty.');
  }

  // Find the row that matches our eventId
  const eventRow = rows.find((row) => row[0] === eventId);
  if (!eventRow) {
    throw new Error(`Event with ID "${eventId}" not found in MasterIndex.`);
  }

  const sheetId = eventRow[2]; // sheet_id is in column C
  return sheetId;
}

// ---
// Helper function to read a tab and return structured data
// ---
async function fetchTabAsJson(spreadsheetId: string, tabName: string, range: string) {
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
    const { eventId } = req.query;
    if (typeof eventId !== 'string') {
      return res.status(400).json({ error: 'Invalid eventId' });
    }

    // 1. Find the specific Event Sheet ID to read from
    const eventSheetId = await getEventSheetId(eventId);

    // 2. Fetch all teams and judges from that sheet in parallel
    const [teamRows, judgeRows] = await Promise.all([
      fetchTabAsJson(eventSheetId, 'teams', 'A2:D'), // id, name, photo, is_active
      fetchTabAsJson(eventSheetId, 'judges', 'A2:D'), // id, name, photo, is_active
    ]);

    // 3. Process and filter the data
    const teams: Team[] = teamRows
      .map((row) => ({
        team_id: row[0],
        team_name: row[1],
        photo_url: row[2],
        is_active: row[3] === 'TRUE',
      }))
      .filter((team) => team.is_active); // Only return active teams

    const judges: Judge[] = judgeRows
      .map((row) => ({
        judge_id: row[0],
        judge_name: row[1],
        photo_url: row[2],
        is_active: row[3] === 'TRUE',
      }))
      .filter((judge) => judge.is_active); // Only return active judges

    res.status(200).json({ teams, judges });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
}