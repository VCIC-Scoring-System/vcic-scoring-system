import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EventData, VotePayload } from "@/lib/types";

// --- Types ---
type Rank = 1 | 2 | 3;
type VoteState = {
  [key in Rank]?: string; // Maps Rank (1,2,3) to team_id
};

const ROUNDS = [
  "Due Diligence",
  "Written Deliverables",
  "Partner Meeting",
] as const;

// --- Fetcher ---
const fetchVoteData = async (sheetId: string): Promise<EventData> => {
  const res = await fetch(`/api/vote-data/${sheetId}`);
  if (!res.ok) throw new Error("Failed to load event data");
  return res.json();
};

// --- Submitter ---
const submitVote = async (data: { sheetId: string; payload: VotePayload }) => {
  const res = await fetch(`/api/vote?sheetId=${data.sheetId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data.payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to submit vote");
  }
  return res.json();
};

export default function VotePage() {
  const router = useRouter();
  const { sheetId, judgeId } = router.query;

  // --- State ---
  const [selectedRound, setSelectedRound] = useState<string>(ROUNDS[0]);
  const [activeRankTab, setActiveRankTab] = useState<Rank>(1);
  const [votes, setVotes] = useState<VoteState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Data ---
  const { data, isLoading, isError } = useQuery<EventData, Error>({
    queryKey: ["voteData", sheetId],
    queryFn: () => fetchVoteData(sheetId as string),
    enabled: !!sheetId,
  });

  const mutation = useMutation({
    mutationFn: submitVote,
    onSuccess: () => {
      // Redirect to confirmation
      router.push({
        pathname: `/voting/${sheetId}/confirmation`,
        query: {
          judgeId,
          round: selectedRound, // Pass the round
        },
      });
    },
    onError: (error) => {
      console.error("Submission failed:", error);
      alert("Failed to submit vote. Please try again.");
      setIsSubmitting(false);
    },
  });

  // Find current judge name
  const currentJudge = data?.judges.find((j) => j.judge_id === judgeId);

  // --- Handlers ---

  const handleRoundChange = (round: string) => {
    setSelectedRound(round);
    setVotes({}); // Reset votes for the new round
    setActiveRankTab(1); // Reset view to 1st place
  };

  const handleTeamSelect = (teamId: string) => {
    setVotes((prev) => {
      const newVotes = { ...prev };

      // 1. If this team is already selected in a DIFFERENT rank, remove it from there
      (Object.keys(newVotes) as unknown as Rank[]).forEach((r) => {
        if (newVotes[r] === teamId) delete newVotes[r];
      });

      // 2. Assign team to current active rank
      newVotes[activeRankTab] = teamId;
      return newVotes;
    });
  };

  const handleSubmit = () => {
    // Validation: Must have 3 votes
    if (!votes[1] || !votes[2] || !votes[3]) {
      alert(
        "Please indicate your choices for all 3 places (1st, 2nd, and 3rd) before submitting."
      );
      return;
    }

    setIsSubmitting(true);

    const payload: VotePayload = {
      judge_id: judgeId as string,
      round: selectedRound,
      ranks: {
        rank1_team_id: votes[1]!,
        rank2_team_id: votes[2]!,
        rank3_team_id: votes[3]!,
      },
    };

    mutation.mutate({ sheetId: sheetId as string, payload });
  };

  // --- Render Helpers ---

  // Helper to find which rank a team currently holds (if any)
  const getTeamRank = (teamId: string): Rank | null => {
    if (votes[1] === teamId) return 1;
    if (votes[2] === teamId) return 2;
    if (votes[3] === teamId) return 3;
    return null;
  };

  if (isLoading)
    return <div className="p-8 text-center">Loading voting...</div>;
  if (isError)
    return (
      <div className="p-8 text-center text-red-600">Error loading data.</div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-6 max-w-5xl">
        {/* --- Top Navigation --- */}
        <div className="mb-5">
          {/* Flex column ensures button stays above title on all screens */}
          <div className="flex flex-col relative">
            {/* Back Button */}
            <div className="self-start">
              <Button
                variant="outline"
                className="pl-2 pr-4 border-gray-400 text-gray-700 hover:bg-gray-100"
                // Back to the Judge Selection Screen
                onClick={() => router.push(`/voting/${sheetId}`)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center w-full">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {data?.eventName}
              </h2>

              {/* Judge Name / History Link - INLINE */}
              <div className="flex flex-col items-center mt-2">
                <div className="text-lg font-bold text-gray-800">
                  <span>Voting as: </span>
                  <Link
                    href={`/voting/${sheetId}/history?judgeId=${judgeId}`}
                    className="font-bold underline text-gray-900 hover:text-vcic-blue-500 transition-colors ml-1"
                  >
                    {currentJudge?.judge_name || "Unknown Judge"}
                  </Link>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Click your name to view previous votes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- Round Selector --- */}
        <div className="mb-5 max-w-5xl mx-auto">
          <h3 className="text-center text-lg font-semibold text-gray-900 mb-3">
            Round:
          </h3>
          {/* Flex container to keep buttons on one line */}
          <div className="flex w-full gap-2">
            {ROUNDS.map((round) => (
              <Button
                key={round}
                onClick={() =>
                  round !== selectedRound && handleRoundChange(round)
                }
                // Styles match Place buttons: Flex-1 for equal width, text-xs/sm for responsiveness
                className={`
                  flex-1 h-auto py-2.5 px-1 text-xs sm:text-sm font-semibold whitespace-normal leading-tight
                  ${
                    selectedRound === round
                      ? "bg-vcic-blue-500 text-white hover:bg-vcic-blue-600 shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm"
                  }
                `}
              >
                {round}
              </Button>
            ))}
          </div>
        </div>

        {/* --- Rank Tabs (1st, 2nd, 3rd) --- */}
        <div className="mb-8 max-w-5xl mx-auto">
          <h3 className="text-center text-lg font-semibold text-gray-900 mb-1">
            Vote:
          </h3>
          <p className="text-center text-sm text-gray-500 mb-3">
            Select your choices for First, Second, and Third places.
          </p>

          {/* Flex container to keep buttons on one line */}
          <div className="flex w-full gap-2">
            {([1, 2, 3] as const).map((rank) => {
              const isActive = activeRankTab === rank;

              return (
                <Button
                  key={rank}
                  onClick={() => setActiveRankTab(rank)}
                  className={`
                    flex-1 h-auto py-2.5 text-xs sm:text-sm font-semibold whitespace-normal leading-tight
                    ${
                      isActive
                        ? "bg-vcic-blue-500 text-white hover:bg-vcic-blue-600 shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm"
                    }
                  `}
                >
                  {rank === 1
                    ? "1st Place"
                    : rank === 2
                    ? "2nd Place"
                    : "3rd Place"}
                </Button>
              );
            })}
          </div>
        </div>

        {/* --- Team Grid --- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-12">
          {data?.teams.map((team) => {
            const rank = getTeamRank(team.team_id);
            const isSelected = rank !== null;

            return (
              <Card
                key={team.team_id}
                onClick={() => handleTeamSelect(team.team_id)}
                className={`
                  cursor-pointer relative overflow-hidden transition-all duration-200 border pt-0 pb-3 gap-3
                  ${
                    isSelected
                      ? "ring-3 ring-vcic-blue-500 border-vcic-blue-500"
                      : "hover:shadow-md border-gray-200"
                  }
                `}
              >
                {/* Image Container */}
                <div className="relative aspect-[3/2] w-full bg-gray-100">
                  <Image
                    src={team.photo_url || "/team-placeholder.png"}
                    alt={team.team_name}
                    fill
                    className="object-cover"
                  />

                  {/* --- Rank Badge Overlay --- */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                      <div
                        className={`
                        w-18 h-18 rounded-full flex items-center justify-center shadow-lg
                        border-4 border-white border-dashed text-white font-bold text-xl
                        ${
                          rank === 1
                            ? "bg-yellow-500"
                            : rank === 2
                            ? "bg-gray-400"
                            : "bg-orange-700"
                        }
                      `}
                      >
                        {rank === 1 ? "1st" : rank === 2 ? "2nd" : "3rd"}
                      </div>
                    </div>
                  )}
                </div>

                <CardContent className="text-center">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                    {team.team_name}
                  </h3>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* --- Submit Button --- */}
        <div className="max-w-5xl mx-auto pb-5">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-12 text-lg font-bold bg-vcic-blue-500 hover:bg-vcic-blue-600 text-white shadow-lg"
          >
            {isSubmitting
              ? "Submitting... Please do not close your browser."
              : "Submit Vote"}
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
