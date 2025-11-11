// pages/api/admin/create-event.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { drive, sheets } from '@/lib/googleSheetsClient';
import { CreateEventPayload, ApiError } from '@/lib/types';

// Helper to generate a unique, short random ID
const generateId = (prefix: 't' | 'j') => {
  return `${prefix}_${Math.random().toString(36).substring(2, 8)}`;
};

type AdminCreatePayload = CreateEventPayload & {
  token: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success: true; eventId: string; sheetId: string } | ApiError>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      ADMIN_TOKEN,
      EVENT_SHEET_TEMPLATE_ID,
      GOOGLE_DRIVE_FOLDER_ID,
      MASTER_INDEX_SHEET_ID,
    } = process.env;

    if (
      !ADMIN_TOKEN ||
      !EVENT_SHEET_TEMPLATE_ID ||
      !GOOGLE_DRIVE_FOLDER_ID ||
      !MASTER_INDEX_SHEET_ID
    ) {
      throw new Error('Server is missing required environment variables.');
    }

    const payload: AdminCreatePayload = req.body;

    // 1. Validate Security Token
    if (payload.token !== ADMIN_TOKEN) {
      return res.status(401).json({ error: 'Invalid or missing admin token' });
    }

    // 2. Validate required fields
    if (
      !payload.event_id ||
      !payload.event_name ||
      !payload.event_type ||
      !payload.event_date ||
      !payload.host_name
    ) {
      return res.status(400).json({ error: 'Missing required event fields' });
    }

    // 3. --- Check for Duplicate event_id ---
    const existingIdsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: MASTER_INDEX_SHEET_ID,
      range: 'MasterIndex!A2:A', // event_id column
    });
    const existingIds = existingIdsResponse.data.values?.flat() || [];
    if (existingIds.includes(payload.event_id)) {
      // 409 Conflict is the correct status code for a duplicate
      return res.status(409).json({ error: 'This Event ID is already taken. Please choose a new one.' });
    }
    // --- END: NEW CHECK ---

    // 4. Copy the template Sheet into the correct folder
    const copyResponse = await drive.files.copy({
      fileId: EVENT_SHEET_TEMPLATE_ID,
      requestBody: {
        name: `Event: ${payload.event_name}`,
        parents: [GOOGLE_DRIVE_FOLDER_ID],
      },
    });
    const newSheetId = copyResponse.data.id;

    if (!newSheetId) {
      throw new Error('Failed to duplicate template Sheet');
    }

    // 5. Populate teams and judges tabs
    const teamRows = (payload.teams || []).map((t) => [
      generateId('t'),
      t.team_name,
      t.photo_url || '',
      'TRUE',
    ]);
    const judgeRows = (payload.judges || []).map((j) => [
      generateId('j'),
      j.judge_name,
      j.photo_url || '',
      'TRUE',
    ]);

    if (teamRows.length > 0 || judgeRows.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: newSheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: [
            { range: 'teams!A2:D', values: teamRows },
            { range: 'judges!A2:D', values: judgeRows },
          ],
        },
      });
    }

    // 6. Add new row to Master Index Sheet
    const masterIndexRow = [
      payload.event_id,
      payload.event_name,
      newSheetId,
      payload.event_type,
      payload.event_date,
      payload.host_name,
      payload.host_logo_url || '',
      'Live',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: MASTER_INDEX_SHEET_ID,
      range: 'MasterIndex!A:H',
      valueInputOption: 'RAW',
      requestBody: {
        values: [masterIndexRow],
      },
    });

    res.status(200).json({ success: true, eventId: payload.event_id, sheetId: newSheetId });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
}