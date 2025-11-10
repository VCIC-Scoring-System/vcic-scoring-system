// pages/api/vote.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { sheets } from '@/lib/googleSheetsClient'; // Import your helper
import { VotePayload, ApiError } from '@/lib/types';
import { sheets_v4 } from 'googleapis';

// ---
// Helper function to find the Sheet ID from the MasterIndex (reused from [eventId].ts)
// ---
async function getEventSheetId(eventId: string): Promise<string> {
  const masterSheetId = process.env.MASTER_INDEX_SHEET_ID;
  const range = 'MasterIndex!A2:C'; // event_id (A), sheet_id (C)

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: masterSheetId,
    range: range,
  });

  const rows = response.data.values;
  if (!rows) {
    throw new Error('MasterIndex sheet is empty.');
  }

  const eventRow = rows.find((row) => row[0] === eventId);
  if (!eventRow) {
    throw new Error(`Event with ID "${eventId}" not found in MasterIndex.`);
  }

  return eventRow[2]; // sheet_id
}

// ---
// The Main API Handler
// ---
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success: true } | ApiError>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { eventId } = req.query;
    if (typeof eventId !== 'string') {
      return res.status(400).json({ error: 'Invalid eventId' });
    }

    const payload: VotePayload = req.body;
    if (!payload.judge_id || !payload.round || !payload.ranks || !payload.ranks.rank1_team_id || !payload.ranks.rank2_team_id || !payload.ranks.rank3_team_id) {
      return res.status(400).json({ error: 'Invalid vote payload' });
    }
    const ranks = [payload.ranks.rank1_team_id, payload.ranks.rank2_team_id, payload.ranks.rank3_team_id];
    const ranksSet = new Set(ranks);
    if (ranksSet.size !== 3) {
      return res.status(400).json({ error: 'Ranks must be unique teams' });
    }

    // 1. Get the Event Sheet ID
    const eventSheetId = await getEventSheetId(eventId);

    // 2. Get the *sheetId* (the tab ID, e.g., 0) for 'votes_data'
    // This is needed for DeleteDimension requests
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: eventSheetId,
    });
    const sheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === 'votes_data'
    );
    if (!sheet || sheet.properties?.sheetId == null) {
      throw new Error("Could not find the 'votes_data' tab.");
    }
    const votesSheetId = sheet.properties.sheetId;

    // 3. Fetch all existing votes_data rows
    const votesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: eventSheetId,
      range: 'votes_data!A2:F', // A: judge_id, B: round
    });
    const votesRows = votesResponse.data.values || [];

    // 4. Find and collect row indices to delete
    const rowsToDelete: number[] = [];
    for (let i = 0; i < votesRows.length; i++) {
      if (votesRows[i][0] === payload.judge_id && votesRows[i][1] === payload.round) {
        rowsToDelete.push(i + 2); // +2 for A2 start
      }
    }

    // 5. Prepare the "requests" for the single batchUpdate
    const requests: sheets_v4.Schema$Request[] = [];

    // 5a. Create the "delete" requests
    // We must delete in reverse order to not mess up the indices
    rowsToDelete.reverse().forEach((rowIndex) => {
      requests.push({
        deleteDimension: {
          range: {
            sheetId: votesSheetId,
            dimension: 'ROWS',
            startIndex: rowIndex - 1, // API is 0-indexed, so row 2 is index 1
            endIndex: rowIndex,     // Deletes 1 row
          },
        },
      });
    });

    // 5b. Prepare the new rows to append
    const now = new Date().toISOString();
    const newRows = [
      [payload.judge_id, payload.round, payload.ranks.rank1_team_id, 1, 3, now],
      [payload.judge_id, payload.round, payload.ranks.rank2_team_id, 2, 2, now],
      [payload.judge_id, payload.round, payload.ranks.rank3_team_id, 3, 1, now],
    ];

    // 5c. Create the "append" request
    requests.push({
      appendCells: {
        sheetId: votesSheetId,
        rows: newRows.map(row => ({
          values: row.map(cell => ({ userEnteredValue: { stringValue: String(cell) } }))
        })),
        fields: '*',
      },
    });

    // 6. Execute the single, atomic batchUpdate
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: eventSheetId,
      requestBody: {
        requests: requests,
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
}