/**
 * EventSummary: Used for the main event list page.
 * Fetched from the 'MasterIndex' sheet.
 */
export type EventSummary = {
  event_id: string;
  event_name: string;
  event_type: 'MBA' | 'Undergraduate';
  event_date: string;
  host_name: string;
  host_logo_url: string;
  status: 'Live' | 'Final';
};

/**
 * Team: A single team for an event.
 * Fetched from the 'teams' tab of an Event Sheet.
 */
export type Team = {
  team_id: string;
  team_name: string;
  photo_url: string;
  is_active: boolean;
};

/**
 * Judge: A single judge for an event.
 * Fetched from the 'judges' tab of an Event Sheet.
 */
export type Judge = {
  judge_id: string;
  judge_name: string;
  photo_url: string;
  is_active: boolean;
};

/**
 * EventData: The full data payload for a single event.
 * This is the return type for your GET /api/vote-data/[sheetId] route.
 */
export type EventData = {
  eventName: string;
  teams: Team[];
  judges: Judge[];
};

/**
 * VotePayload: The data sent from the frontend to the backend when a judge votes.
 */
export type VotePayload = {
  judge_id: string;
  round: string; // "Due Diligence", "Written Deliverables", etc.
  ranks: {
    rank1_team_id: string;
    rank2_team_id: string;
    rank3_team_id: string;
  };
};

/**
 * ApiError: A standard shape for all API error responses.
 */
export type ApiError = {
  error: string;
};

// A single team sent from the admin form
export type FormTeam = {
  team_name: string;
  photo_url: string;
};

// A single judge sent from the admin form
export type FormJudge = {
  judge_name: string;
  photo_url: string;
};

// The complete payload sent to the create-event API
export type CreateEventPayload = {
  // From MasterIndex
  event_id: string; // e.g., "2025-texas"
  event_name: string;
  event_type: 'MBA' | 'Undergraduate';
  event_date: string;
  host_name: string;
  host_logo_url: string;
  // From Event Sheet
  teams: FormTeam[];
  judges: FormJudge[];
};