import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

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

export default function VoteConfirmationPage() {
  const router = useRouter();
  const { sheetId, judgeId, round, first, second, third } = router.query;

  const [data, setData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sheetId || !judgeId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/vote-data/${sheetId}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sheetId, judgeId]);

  if (loading || !data) return <p className="text-center mt-20">Loading...</p>;

  const currentJudge = data.judges.find((j) => j.judge_id === judgeId);

  const findTeam = (id: string | string[] | undefined) =>
    data.teams.find((t) => t.team_id === id) ?? {
      team_id: "none",
      team_name: "Unknown Team",
      photo_url: "/placeholder-team.jpg",
      is_active: false,
    };

  const results = [
    { place: "1st Place", emoji: "🥇", team: findTeam(first) },
    { place: "2nd Place", emoji: "🥈", team: findTeam(second) },
    { place: "3rd Place", emoji: "🥉", team: findTeam(third) },
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />

      <main className="flex-1 px-6 py-6 max-w-md mx-auto">
        {/* Event Title */}
        <h1 className="text-2xl font-bold text-center text-black">
          {data.eventName}
        </h1>

        {/* Voting as */}
        <div className="text-center mt-2">
          <p className="text-lg font-medium text-black">
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

        <h2 className="text-xl font-semibold text-center mt-6 text-black">
          Thanks for Voting!
        </h2>

        <p className="text-lg text-center mt-2 text-black">
          Your vote for "{round}" has been successfully submitted.
        </p>

        {/* Summary */}
        <h3 className="text-xl font-semibold text-center mt-8 text-black">
          Vote Summary
        </h3>

        <div className="space-y-4 mt-4">
          {results.map(({ place, emoji, team }, index) => (
            <Card key={index} className="border border-black rounded-lg">
              <CardContent className="flex items-center p-4">
                {/* Left side text */}
                <div className="flex-1">
                  <p className="text-lg">
                    {emoji} {place}
                  </p>
                  <p className="text-sm text-gray-700">{team.team_name}</p>
                </div>

                {/* Team images */}
                <div className="relative w-36 h-20 rounded-md overflow-hidden bg-gray-200">
                  <Image
                    src={team.photo_url}
                    alt={team.team_name}
                    fill
                    className="object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Button */}
        <div className="flex justify-center mt-8">
          <Button
            className="px-12 py-3 bg-[#5883b8] text-white hover:bg-[#4a6ea0] text-lg font-semibold"
            onClick={() =>
              router.push(`/judge/${sheetId}/vote/${judgeId}`)
            }
          >
            Back to Voting
          </Button>
        </div>
      </main>
    </div>
  );
}
