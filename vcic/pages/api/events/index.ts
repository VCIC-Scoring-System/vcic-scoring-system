import type { NextApiRequest, NextApiResponse } from 'next';
import { sheets } from '@/lib/googleSheetsClient'; // Import your new client
import { EventSummary, ApiError } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EventSummary[] | ApiError>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const sheetId = process.env.MASTER_INDEX_SHEET_ID;
    const range = 'MasterIndex!A2:H'; // Get rows from A to H, starting at row 2

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range,
    });

    const values = response.data.values;

    if (!values || values.length === 0) {
      return res.status(200).json([]); // Return empty array if no events
    }

    // Convert the array of arrays from Google Sheets into a clean JSON array
    const events: EventSummary[] = values.map((row) => ({
      event_id: row[0],
      event_name: row[1],
      // sheet_id: row[2], // No need to send this to the client
      event_type: row[3],
      event_date: row[4],
      host_name: row[5],
      host_logo_url: row[6],
      status: row[7] as 'Live' | 'Final',
    }));

    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch events from Google Sheets' });
  }
}