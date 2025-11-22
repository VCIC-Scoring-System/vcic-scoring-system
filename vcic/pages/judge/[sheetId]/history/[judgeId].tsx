import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

type Round = "Due Diligence" | "Written Deliverables" | "Partner Meeting";

interface Team {
  team_id: string;
  team_name: string;
  photo_url: string;
}

interface SheetHistoryData {
  eventName: string;
  judgeName: string;
  roundVotes: Record<
    Round,
    Record<"1st Place" | "2nd Place" | "3rd Place", Team | null>
  >;
}

export default function HistoryPage() {
  const router = useRouter();
  const { sheetId, judgeId } = router.query;

  const [data, setData] = useState<SheetHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState<Round>("Due Diligence");

  const rounds: Round[] = [
    "Due Diligence",
    "Written Deliverables",
    "Partner Meeting",
  ];

  // Fetch from Google Sheet
  useEffect(() => {
    if (!sheetId || !judgeId) return;

    async function fetchHistory() {
      try {
        const res = await fetch(
          `/api/vote-history?sheetId=${sheetId}&judgeId=${judgeId}`
        );
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [sheetId, judgeId]);

  if (loading || !data) return <p className="text-center mt-20">Loading...</p>;

  const voteResults = data.roundVotes[selectedRound];

  const allPlaces = [
    { place: "1st Place", emoji: "🥇" },
    { place: "2nd Place", emoji: "🥈" },
    { place: "3rd Place", emoji: "🥉" },
  ] as const;

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />

      <div className="p-5 max-w-md mx-auto">
        {/* Event Title */}
        <h1 className="text-2xl font-bold text-center text-black">
          {data.eventName}
        </h1>

        {/* Subtitle */}
        <h2 className="text-xl font-semibold text-center mt-3 text-black">
          View Previous Votes
        </h2>

        {/* Judge */}
        <p className="text-lg text-center mt-1 text-black">
          Voted as:{" "}
          <span className="underline font-semibold">{data.judgeName}</span>
        </p>

        {/* Round Tabs */}
        <h3 className="text-lg font-semibold text-center mt-6 text-black">
          Round and Vote Summary
        </h3>
        <p className="text-sm text-gray-600 text-center">
          Click the tab to view your votes for that round.
        </p>

        <div className="flex flex-row gap-1 sm:gap-2 justify-center mt-2 px-2">
          {rounds.map((round) => (
            <Button
              key={round}
              onClick={() => setSelectedRound(round)}
              className={`flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm ${
                selectedRound === round
                  ? "bg-[#5883B8] text-white hover:bg-[#4a6ea0]"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {round}
            </Button>
          ))}
        </div>

        {/* Vote Summary Cards */}
        <div className="space-y-4 mt-6">
          {allPlaces.map(({ place, emoji }) => {
            const team = voteResults[place as keyof typeof voteResults];

            return (
              <Card key={place} className="border border-black">
                <CardContent className="flex items-center p-4">
                  {/* Left text */}
                  <div className="flex-1">
                    <p className="text-lg text-black">
                      {emoji} {place}
                    </p>
                    <p className="text-sm text-black">
                      {team ? team.team_name : "No vote"}
                    </p>
                  </div>

                  {/* Team image */}
                  <div className="relative w-36 h-20 rounded-md bg-gray-200 overflow-hidden">
                    <Image
                      src={team?.photo_url ?? "/placeholder-team.jpg"}
                      alt={team?.team_name ?? "No vote"}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Back to voting */}
        <p className="mt-8 text-center text-black text-sm">
          Want to change your vote or vote for another round?
        </p>

        <div className="flex justify-center mt-3">
          <Button
            className="px-12 py-3 bg-[#5883b8] text-white hover:bg-[#4a6ea0] text-lg font-semibold"
            onClick={() => router.push(`/judge/${sheetId}/vote/${judgeId}`)}
          >
            Back to Voting
          </Button>
        </div>
      </div>
    </div>
  );
}
