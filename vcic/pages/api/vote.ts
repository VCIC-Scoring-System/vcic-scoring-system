// pages/api/vote.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { sheets } from '@/lib/googleSheetsClient'; // Import your helper
import { VotePayload, ApiError } from '@/lib/types';

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

    // Optional: Validate ranks are unique
    const ranksSet = new Set([payload.ranks.rank1_team_id, payload.ranks.rank2_team_id, payload.ranks.rank3_team_id]);
    if (ranksSet.size !== 3) {
      return res.status(400).json({ error: 'Ranks must be unique teams' });
    }

    // 1. Get the Event Sheet ID
    const eventSheetId = await getEventSheetId(eventId);

    // 2. Fetch all existing votes_data rows (A: judge_id, B: round, C: rank1, D: rank2, E: rank3, F: last_updated)
    const votesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: eventSheetId,
      range: 'votes_data!A2:F',
    });
    const votesRows = votesResponse.data.values || [];

    // 3. Find if a matching row exists (by judge_id and round)
    let matchingRowIndex = -1;
    for (let i = 0; i < votesRows.length; i++) {
      if (votesRows[i][0] === payload.judge_id && votesRows[i][1] === payload.round) {
        matchingRowIndex = i + 2; // +2 because A2 start (index 0 is row 2)
        break;
      }
    }

    const now = new Date().toISOString(); // Timestamp for last_updated
    const newRow = [
      payload.judge_id,
      payload.round,
      payload.ranks.rank1_team_id,
      payload.ranks.rank2_team_id,
      payload.ranks.rank3_team_id,
      now,
    ];

    // 4. Upsert: Update if found, append if not
    if (matchingRowIndex !== -1) {
      // Update existing row (columns A-F at that row)
      await sheets.spreadsheets.values.update({
        spreadsheetId: eventSheetId,
        range: `votes_data!A${matchingRowIndex}:F${matchingRowIndex}`,
        valueInputOption: 'RAW',
        requestBody: { values: [newRow] },
      });
    } else {
      // Append new row
      await sheets.spreadsheets.values.append({
        spreadsheetId: eventSheetId,
        range: 'votes_data!A:F',
        valueInputOption: 'RAW',
        requestBody: { values: [newRow] },
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
}