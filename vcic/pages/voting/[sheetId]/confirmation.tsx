import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Define the shape of the history data (from your vote-history API)
type HistoryData = {
  eventName: string;
  judgeName: string;
  roundVotes: Record<
    string,
    {
      "1st Place": { team_name: string; photo_url: string } | null;
      "2nd Place": { team_name: string; photo_url: string } | null;
      "3rd Place": { team_name: string; photo_url: string } | null;
    }
  >;
};

const fetchHistory = async (sheetId: string, judgeId: string) => {
  const res = await fetch(
    `/api/vote-history?sheetId=${sheetId}&judgeId=${judgeId}`
  );
  if (!res.ok) throw new Error("Failed to load confirmation data");
  return res.json();
};

export default function ConfirmationPage() {
  const router = useRouter();
  const { sheetId, judgeId, round } = router.query;

  // We use the history API to get the vote we just submitted
  const { data, isLoading, isError } = useQuery<HistoryData>({
    queryKey: ["voteHistory", sheetId, judgeId],
    queryFn: () => fetchHistory(sheetId as string, judgeId as string),
    enabled: !!sheetId && !!judgeId,
  });

  // Get the votes for the specific round we just finished
  // Default to empty object if data isn't ready
  const currentRoundVotes = data?.roundVotes[round as string] || {
    "1st Place": null,
    "2nd Place": null,
    "3rd Place": null,
  };

  // Helper for the "Back to Voting" button logic
  const handleBackToVoting = () => {
    router.push({
      pathname: `/voting/${sheetId}/vote`,
      query: { judgeId },
    });
  };

  // Helper for "View Your Voting" button logic
  const handleViewHistory = () => {
    router.push({
      pathname: `/voting/${sheetId}/history`,
      query: { judgeId },
    });
  };

  if (isLoading)
    return <div className="p-10 text-center">Loading confirmation...</div>;
  if (isError || !data)
    return (
      <div className="p-10 text-center text-red-600">
        Error loading confirmation.
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 text-center">
        {/* --- Event Title & Judge Identity (Consistent Style) --- */}
        <div className="text-center w-full mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {data.eventName}
          </h2>

          {/* Judge Name / History Link - INLINE */}
          <div className="flex flex-col items-center mt-2">
            <div className="text-lg font-bold text-gray-800">
              <span>Voting as: </span>
              <Link
                href={`/voting/${sheetId}/history?judgeId=${judgeId}`}
                className="font-bold underline text-gray-900 hover:text-vcic-blue-500 transition-colors ml-1"
              >
                {data.judgeName || "Unknown Judge"}
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Click your name to view previous votes
            </p>
          </div>
        </div>

        {/* --- Success Message --- */}
        <div className="mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 inline-block w-full max-w-2xl shadow-sm">
            <h2 className="text-xl font-bold text-green-700 mb-2 text-center">
              Thanks for Voting!
            </h2>
            <p className="text-green-800 text-lg text-center">
              Your vote for &quot;{round}&quot; has been successfully submitted.
            </p>
          </div>
        </div>

        {/* --- Vote Summary Cards --- */}
        <h3 className="text-xl font-bold text-gray-900 mb-4">Vote Summary</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-7xl mx-auto mb-10">
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
                {/* Changed to always be flex-row (Side-by-Side) */}
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

        {/* --- Action Buttons --- */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center max-w-2xl mx-auto pb-5">
          {/* Back to Voting */}
          <Button
            onClick={handleBackToVoting}
            className="h-12 bg-vcic-blue-500 hover:bg-vcic-blue-600 text-white text-base font-semibold shadow-md w-full sm:w-1/2"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Voting
          </Button>

          {/* View Voting History */}
          <Button
            onClick={handleViewHistory}
            className="h-12 bg-vcic-blue-500 hover:bg-vcic-blue-600 text-white text-base font-semibold shadow-md w-full sm:w-1/2"
          >
            View Previous Voting
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
