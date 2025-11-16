
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

type Round = "Due Diligence" | "Written Deliverables" | "Partner Meeting";
type Place = "1st Place" | "2nd Place" | "3rd Place";

interface Team {
  team_id: string;
  team_name: string;
  photo_url: string;
  is_active: boolean;
}

interface Judge {
  judge_id: string;
  judge_name: string;
  photo_url: string;
  is_active: boolean;
}

interface SheetData {
  eventName: string;
  teams: Team[];
  judges: Judge[];
}

const rounds: Round[] = [
  "Due Diligence",
  "Written Deliverables",
  "Partner Meeting",
];

const places: Place[] = ["1st Place", "2nd Place", "3rd Place"];

export default function JudgeVotingPage() {
  const router = useRouter();
  const { sheetId, judgeId } = router.query;

  const [data, setData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);

  // 当前 Round 和 Place
  const [selectedRound, setSelectedRound] = useState<Round>("Due Diligence");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // 所有轮次的投票
  const [votes, setVotes] = useState(() => {
    const initial: any = {};
    rounds.forEach((r) => {
      initial[r] = {
        "1st Place": null,
        "2nd Place": null,
        "3rd Place": null,
      };
    });
    return initial as Record<Round, Record<Place, string | null>>;
  });

  // Fetch Google Sheet data
  useEffect(() => {
    if (!sheetId || !judgeId) return;

    async function fetchData() {
      try {
        const res = await fetch(`/api/vote-data/${sheetId}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [sheetId, judgeId]);

  // 选 Team
  const selectTeam = (teamId: string) => {
    if (!selectedPlace) return;
    setVotes((prev) => ({
      ...prev,
      [selectedRound]: {
        ...prev[selectedRound],
        [selectedPlace]: teamId,
      },
    }));
  };

  // 提交
  const handleSubmit = async () => {
    const r = votes[selectedRound];
    if (!r["1st Place"] || !r["2nd Place"] || !r["3rd Place"]) {
      alert("Please select all three places for this round.");
      return;
    }

    if (typeof judgeId !== 'string' || typeof sheetId !== 'string') {
      return;
    }

    try {
      const res = await fetch(`/api/vote?sheetId=${sheetId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judge_id: judgeId,
          round: selectedRound,
          ranks: {
            rank1_team_id: r["1st Place"],
            rank2_team_id: r["2nd Place"],
            rank3_team_id: r["3rd Place"],
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to submit vote');

      const params = new URLSearchParams({
        round: selectedRound,
        judgeId: judgeId,
        first: r["1st Place"]!,
        second: r["2nd Place"]!,
        third: r["3rd Place"]!,
      });

      router.push(`/judge/${sheetId}/confirmation?${params.toString()}`);
    } catch (e) {
      console.error(e);
      alert('Failed to submit vote. Please try again.');
    }
  };

  if (loading || !data) {
    return <p className="text-center mt-20">Loading...</p>;
  }

  const currentJudge = data.judges.find(j => j.judge_id === judgeId);

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />

      <div className="p-5 max-w-md mx-auto">

        {/* Event Title with Back Button */}
        <div className="relative flex items-center justify-center mb-2">
          <button
            onClick={() => router.push(`/judge/${sheetId}`)}
            className="absolute left-0 p-2 border-2 border-gray-400 text-gray-600 hover:text-gray-900 hover:border-gray-600 hover:bg-gray-50 rounded-lg transition"
            aria-label="Back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          <h1 className="text-xl font-bold text-center">
            {data.eventName}
          </h1>
        </div>

        {/* Voting as */}
        <div className="text-center mt-2">
          <p className="text-lg font-medium">
            Voting as:{" "}
            <span
              onClick={() => router.push(`/judge/${sheetId}/history/${judgeId}`)}
              className="underline cursor-pointer font-semibold hover:text-[#5883B8] transition"
            >
              {currentJudge?.judge_name || "Unknown Judge"}
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Click your name to view previous votes
          </p>
        </div>

        {/* Round Selector */}
        <p className="text-lg font-medium text-center mt-4">Round:</p>

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


        {/* Vote */}
        <p className="text-lg font-medium text-center mt-6">Vote:</p>
        <p className="text-sm text-center text-gray-600">
          Select your choices for First, Second, and Third places.
        </p>

        {/* Place Selector */}
        <div className="flex flex-row gap-2 justify-center mt-2">
          {places.map((place) => (
            <Button
              key={place}
              onClick={() => setSelectedPlace(place)}
              className={`px-4 py-2 text-sm ${
                selectedPlace === place
                  ? "bg-[#5883B8] text-white hover:bg-[#4a6ea0]"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {place}
            </Button>
          ))}
        </div>


        {/* Team Grid */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {data.teams.map((team) => {
            const isSelected =
              votes[selectedRound][selectedPlace ?? "1st Place"] === team.team_id;

            return (
              <Card
                key={team.team_id}
                onClick={() => selectTeam(team.team_id)}
                className={`cursor-pointer hover:shadow-md transition-all ${
                  isSelected
                    ? "border-4 border-[#5883B8] shadow-lg bg-blue-50"
                    : "border-2 border-gray-200"
                }`}
              >
                <CardContent className="p-3 flex flex-col items-center">
                  <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-200">
                    <Image
                      src={team.photo_url || '/placeholder-team.jpg'}
                      alt={team.team_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-2 font-semibold text-center">
                    {team.team_name}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleSubmit}
            className="px-12 py-3 text-lg font-semibold bg-[#5883b8] text-white hover:bg-[#4a6ea0]"
          >
            Submit Vote
          </Button>
        </div>
      </div>
    </div>
  );
}

