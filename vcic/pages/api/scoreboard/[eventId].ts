// pages/api/scoreboard/[eventId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { sheets } from '@/lib/googleSheetsClient';
import { ApiError } from '@/lib/types'; // Assuming ApiError is in your types file

// ---
// Define the data types for this API's response
// ---
type ScoreboardRow = {
  teamName: string;
  totalScore: number;
};
type ScoreboardData = {
  status: 'Final';
  eventName: string;
  hostLogoUrl: string;
  hostName: string;
  overallRankings: ScoreboardRow[];
  dueDiligence: ScoreboardRow[];
  writtenDeliverable: ScoreboardRow[];
  partnerMeeting: ScoreboardRow[];
};
type ScoreboardWaiting = {
  status: 'Live';
  message: string;
  eventName: string;
};

// ---
// Helper: Gets the Event's info (Sheet ID and Status) from the MasterIndex
// ---
async function getEventInfo(eventId: string) {
  const masterSheetId = process.env.MASTER_INDEX_SHEET_ID;
  const headerRange = 'MasterIndex!A1:H1'; // Fetch headers
  const dataRange = 'MasterIndex!A2:H'; // Data rows

  const [headerResponse, dataResponse] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: masterSheetId, range: headerRange }),
    sheets.spreadsheets.values.get({ spreadsheetId: masterSheetId, range: dataRange }),
  ]);

  const headers = headerResponse.data.values?.[0] || [];
  const rows = dataResponse.data.values || [];
  if (!rows.length) throw new Error('MasterIndex sheet is empty.');

  const eventRow = rows.find((row) => row[headers.indexOf('event_id')] === eventId);
  if (!eventRow) throw new Error(`Event with ID "${eventId}" not found.`);

  return {
    eventName: eventRow[headers.indexOf('event_name')] || '',
    sheetId: eventRow[headers.indexOf('sheet_id')] || '',
    hostLogoUrl: eventRow[headers.indexOf('host_logo_url')] || '',
    hostName: eventRow[headers.indexOf('host_name')] || '',
    status: (eventRow[headers.indexOf('status')] || 'Live') as 'Live' | 'Final',
  };
}

// ---
// Helper: Fetches a pre-calculated scoreboard table
// ---
async function fetchScoreboardRange(spreadsheetId: string, columnRange: string): Promise<ScoreboardRow[]> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'scoreboard'!${columnRange}`, // e.g., 'A2:B' for all rows in those columns
  });
  const rows = response.data.values || [];
  return rows
    .filter(row => row[0] && row[1]) // Skip empty/incomplete rows
    .map((row) => ({
      teamName: row[0],
      totalScore: parseInt(row[1], 10) || 0, // Fallback to 0 if NaN
    }));
}

// ---
// The Main API Handler
// ---
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScoreboardData | ScoreboardWaiting | ApiError>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { eventId } = req.query;
    if (typeof eventId !== 'string') {
      return res.status(400).json({ error: 'Invalid eventId' });
    }

    // 1. Get the event's high-level info
    const eventInfo = await getEventInfo(eventId);

    // 2. Check the Status and respond accordingly
    if (eventInfo.status === 'Live') {
      // If "Live", send a waiting message
      return res.status(200).json({
        status: 'Live',
        eventName: eventInfo.eventName,
        message: 'This event is ongoing. Check back later for final results!',
      });
    }

    // 3. If "Final", fetch all the pre-calculated scoreboard data
    // NOTE: Update these column ranges to match your scoreboard tab layout (e.g., 'A2:B' for Overall)
    const [overall, dueDiligence, written, partner] = await Promise.all([
      fetchScoreboardRange(eventInfo.sheetId, 'A2:B'), // Overall Rankings
      fetchScoreboardRange(eventInfo.sheetId, 'D2:E'), // Due Diligence
      fetchScoreboardRange(eventInfo.sheetId, 'F2:G'), // Written Deliverable
      fetchScoreboardRange(eventInfo.sheetId, 'H2:I'), // Partner Meeting
    ]);

    // 4. Send the complete, final data
    res.status(200).json({
      status: 'Final',
      eventName: eventInfo.eventName,
      hostLogoUrl: eventInfo.hostLogoUrl,
      hostName: eventInfo.hostName,
      overallRankings: overall,
      dueDiligence: dueDiligence,
      writtenDeliverable: written,
      partnerMeeting: partner,
    });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = errorMessage.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
}