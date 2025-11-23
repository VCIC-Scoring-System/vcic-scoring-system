import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VoteHistoryResponse, RoundName } from "@/lib/types";

// Define the rounds constant
const ROUNDS = [
  "Due Diligence",
  "Written Deliverables",
  "Partner Meeting",
] as const;

const fetchHistory = async (sheetId: string, judgeId: string) => {
  const res = await fetch(
    `/api/vote-history?sheetId=${sheetId}&judgeId=${judgeId}`
  );
  if (!res.ok) throw new Error("Failed to load history data");
  return res.json();
};

export default function VoteHistoryPage() {
  const router = useRouter();
  const { sheetId, judgeId } = router.query;

  // State to track which round is currently being viewed
  const [selectedRound, setSelectedRound] = useState<RoundName>(ROUNDS[0]);

  // Fetch history data
  const { data, isLoading, isError } = useQuery<VoteHistoryResponse>({
    queryKey: ["voteHistory", sheetId, judgeId],
    queryFn: () => fetchHistory(sheetId as string, judgeId as string),
    enabled: !!sheetId && !!judgeId,
  });

  const handleBackToVoting = () => {
    router.push({
      pathname: `/voting/${sheetId}/vote`,
      query: { judgeId },
    });
  };

  // Get votes for the currently selected round
  const currentRoundVotes = data?.roundVotes[selectedRound] || {
    "1st Place": null,
    "2nd Place": null,
    "3rd Place": null,
  };

  if (isLoading)
    return <div className="p-10 text-center">Loading history...</div>;
  if (isError || !data)
    return (
      <div className="p-10 text-center text-red-600">
        Error loading history.
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-6 text-center max-w-7xl">
        {/* --- Header Section --- */}
        <div className="text-center w-full mb-4 max-w-5xl mx-auto">
          {/* Top Back Button (Mobile/Desktop Consistent) */}
          <div className="flex flex-col relative">
            <div className="self-start">
              <Button
                variant="outline"
                className="pl-2 pr-4 border-gray-400 text-gray-700 hover:bg-gray-100"
                onClick={() => router.back()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 1. Event Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {data.eventName}
          </h2>

          {/* 2. Voted As */}
          <div className="mt-2 text-lg text-gray-800">
            <span className="font-bold text-gray-800">Voted as: </span>
            <span className="font-bold underline text-gray-900 ml-1">
              {data.judgeName || "Unknown Judge"}
            </span>
          </div>

          {/* 3. Section Title */}
          <div className="mt-4 mb-2">
            <h3 className="text-xl font-bold text-gray-900">
              Round and Previous Votes
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Click the tab to view your votes for that round.
            </p>
          </div>
        </div>

        {/* --- Round Selector --- */}
        <div className="mb-6 max-w-5xl mx-auto">
          <div className="flex w-full gap-2">
            {ROUNDS.map((round) => (
              <Button
                key={round}
                onClick={() => setSelectedRound(round)}
                className={`
                  flex-1 h-auto py-2.5 px-1 text-xs sm:text-sm font-semibold whitespace-normal leading-tight transition-all
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

        {/* --- Vote Summary Cards --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-7xl mx-auto mb-8">
          {["1st Place", "2nd Place", "3rd Place"].map((place) => {
            const rankKey = place as keyof typeof currentRoundVotes;
            const team = currentRoundVotes[rankKey];

            // Medal colors
            let iconColor = "text-yellow-500"; // Gold
            if (place === "2nd Place") iconColor = "text-gray-400"; // Silver
            if (place === "3rd Place") iconColor = "text-orange-700"; // Bronze

            return (
              <Card
                key={place}
                className="overflow-hidden border-gray-200 shadow-sm py-4 sm:py-6"
              >
                <CardContent className="p-0 flex flex-row h-24 sm:h-28">
                  {/* Left Side (Text) */}
                  <div className="flex-1 p-4 flex flex-col justify-center text-left pl-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xl ${iconColor}`}>
                        {place === "1st Place"
                          ? "🥇"
                          : place === "2nd Place"
                          ? "🥈"
                          : "🥉"}
                      </span>
                      <span className="font-bold text-gray-500 text-xs sm:text-sm uppercase tracking-wide">
                        {place}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900 text-lg sm:text-xl truncate">
                      {team?.team_name || "None"}
                    </p>
                  </div>

                  {/* Right Side (Image) */}
                  <div className="w-36 sm:w-48 relative bg-gray-100 overflow-hidden mr-6">
                    {team ? (
                      <Image
                        src={team.photo_url || "/team-placeholder.png"}
                        alt={team.team_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300 text-xs">
                        No Selection
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* --- Bottom Action Button --- */}
        <div className="flex flex-col items-center justify-center max-w-4xl mx-auto pb-5">
          {/* Prompt Text */}
          <p className="text-gray-900 font-semibold mb-4 text-base">
            Want to revote or vote for another round?
          </p>

          {/* Button */}
          <Button
            onClick={handleBackToVoting}
            className="h-12 w-full sm:w-1/2 bg-vcic-blue-500 hover:bg-vcic-blue-600 text-white text-base font-semibold shadow-md"
          >
            {/* Added ChevronLeft icon */}
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Voting
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
