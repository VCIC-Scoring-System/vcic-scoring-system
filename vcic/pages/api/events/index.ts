import type { NextApiRequest, NextApiResponse } from 'next';
import { sheets } from '@/lib/googleSheetsClient'; // Import your new client
import { ApiError } from '@/lib/types';

interface EventItem {
  id: string;
  name: string;
  category: "MBA" | "Undergraduate";
  status: "live" | "final";
  date: string;
  host: {
    name: string;
    logo: string;
  };
}

interface EventsResponse {
  events: EventItem[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EventsResponse | ApiError>
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
      return res.status(200).json({ events: [] }); // Return empty array wrapped in events object
    }

    // Convert the array of arrays from Google Sheets into frontend-compatible format
    const events: EventItem[] = values.map((row) => ({
      id: row[0],
      name: row[1],
      // sheet_id: row[2], // No need to send this to the client
      category: row[3] as "MBA" | "Undergraduate",
      date: row[4],
      host: {
        name: row[5],
        logo: row[6],
      },
      status: (row[7] as string).toLowerCase() as "live" | "final",
    }));

    res.status(200).json({ events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch events from Google Sheets' });
  }
}