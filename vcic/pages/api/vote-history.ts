// pages/api/vote-history.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { sheets } from '@/lib/googleSheetsClient';
import { 
  ApiError, 
  VoteHistoryResponse, 
  RoundName, 
  HistoryTeam} from '@/lib/types';

// Helper: Get event name from MasterIndex using sheetId
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

  // Find the index of specific columns to be safe
  const sheetIdIndex = headers.indexOf('sheet_id');
  const eventNameIndex = headers.indexOf('event_name');

  if (sheetIdIndex === -1 || eventNameIndex === -1) return 'Event Title';

  const eventRow = rows.find((row) => row[sheetIdIndex] === sheetId);
  if (!eventRow) {
    return 'Event Title';
  }

  return eventRow[eventNameIndex] || 'Event Title';
}

// Helper: Fetch data from a tab
async function fetchTabAsJson(spreadsheetId: string, tabName: string, range: string) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!${range}`,
  });
  return response.data.values || [];
}

// Main API handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VoteHistoryResponse | ApiError>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { sheetId, judgeId } = req.query;

    if (typeof sheetId !== 'string' || typeof judgeId !== 'string') {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    // Fetch all required data in parallel
    const [eventName, teamRows, judgeRows, votesRows] = await Promise.all([
      getEventNameBySheetId(sheetId),
      fetchTabAsJson(sheetId, 'teams', 'A2:D'),
      fetchTabAsJson(sheetId, 'judges', 'A2:D'),
      fetchTabAsJson(sheetId, 'votes_data', 'A2:F'), // A:judge_id, B:round, C:team_id, D:rank
    ]);

    // Build teams map using the shared HistoryTeam type
    const teamsMap = new Map<string, HistoryTeam>();
    teamRows.forEach((row) => {
      teamsMap.set(row[0], {
        team_id: row[0],
        team_name: row[1],
        photo_url: row[2],
      });
    });

    // Find judge name
    const judgeRow = judgeRows.find((row) => row[0] === judgeId);
    const judgeName = judgeRow ? judgeRow[1] : 'Unknown Judge';

    // Initialize roundVotes structure
    const roundVotes: VoteHistoryResponse['roundVotes'] = {
      'Due Diligence': {
        '1st Place': null,
        '2nd Place': null,
        '3rd Place': null,
      },
      'Written Deliverables': {
        '1st Place': null,
        '2nd Place': null,
        '3rd Place': null,
      },
      'Partner Meeting': {
        '1st Place': null,
        '2nd Place': null,
        '3rd Place': null,
      },
    };

    // Process votes for this judge
    votesRows.forEach((row) => {
      const voteJudgeId = row[0];
      const round = row[1] as RoundName;
      const teamId = row[2];
      const rank = parseInt(row[3], 10); // 1, 2, or 3

      if (voteJudgeId === judgeId && roundVotes[round]) {
        const team = teamsMap.get(teamId);
        if (team) {
          if (rank === 1) {
            roundVotes[round]['1st Place'] = team;
          } else if (rank === 2) {
            roundVotes[round]['2nd Place'] = team;
          } else if (rank === 3) {
            roundVotes[round]['3rd Place'] = team;
          }
        }
      }
    });

    res.status(200).json({
      eventName,
      judgeName,
      roundVotes,
    });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
}
