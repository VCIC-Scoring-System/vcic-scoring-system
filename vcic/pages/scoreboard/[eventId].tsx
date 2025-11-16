import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Header from "@/components/header";

// -------- Types --------

interface TeamRanking {
  name: string;
  score: number;
}

interface RoundData {
  title: string;
  bgColor: string;
  scores: { teamName: string; score: number }[];
}

// -------- Font sizes for overall (unchanged UI) --------
const fontSizes = [
  "text-[28px]",
  "text-[26px]",
  "text-[24px]",
  "text-[23px]",
  "text-[23px]",
  "text-[23px]",
];

export default function ScoreboardPage() {
  const router = useRouter();
  const { eventId } = router.query;

  const [overall, setOverall] = useState<TeamRanking[] | null>(null);
  const [rounds, setRounds] = useState<RoundData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const [eventName, setEventName] = useState("");

  const roundColors: Record<string, string> = {
    "Due Diligence": "#eecdcd",
    "Written Deliverables": "#d8d3e7",
    "Partner Meetings": "#dce9d5",
  };

  const roundOrder = [
    "Due Diligence",
    "Written Deliverables",
    "Partner Meetings",
  ];

  // -------- Fetch API --------
  useEffect(() => {
    if (!eventId) return;

    async function load() {
      try {
        const res = await fetch(`/api/scoreboard/${eventId}`);
        const data = await res.json();

        // Check if event is Live or Final
        if (data.status === 'Live') {
          setIsLive(true);
          setLiveMessage(data.message);
          setEventName(data.eventName);
          setLoading(false);
          return;
        }

        // -------- Overall Map (从后端的 overallRankings 转换) --------
        const mappedOverall = data.overallRankings.map(
          (item: { teamName: string; totalScore: number }) => ({
            name: item.teamName,
            score: item.totalScore,
          })
        );

        // -------- Round Map (从后端的各个轮次数据转换) --------
        const roundDataMap: Record<string, any[]> = {
          "Due Diligence": data.dueDiligence,
          "Written Deliverables": data.writtenDeliverable,
          "Partner Meetings": data.partnerMeeting,
        };

        const mappedRounds: RoundData[] = roundOrder.map((round) => ({
          title: round,
          bgColor: roundColors[round],
          scores: (roundDataMap[round] || []).map(
            (item: { teamName: string; totalScore: number }) => ({
              teamName: item.teamName,
              score: item.totalScore,
            })
          ),
        }));

        setEventName(data.eventName);
        setOverall(mappedOverall);
        setRounds(mappedRounds);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load scoreboard:", err);
        setLoading(false);
      }
    }

    load();
  }, [eventId]);

  if (loading)
    return <p className="text-center mt-20">Loading...</p>;

  // -------- Live 状态处理 --------
  if (isLive) {
    return (
      <div className="min-h-screen bg-white text-black">
        <Header />

        <div className="flex items-center justify-center p-[28px]">
          <div className="w-full max-w-[420px] bg-white p-[30px]">
            <h1 className="text-[28px] font-bold text-black text-center mb-[25px]">
              {eventName}
            </h1>

            <div className="bg-white border-2 border-gray-400 p-[40px] text-center rounded-md">
              <h2 className="text-[24px] font-bold text-[#5883B8] mb-[20px]">
                Event in Progress!
              </h2>
              <p className="text-[20px] text-black">
                {liveMessage}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!overall || !rounds)
    return <p className="text-center mt-20">No data available</p>;

  // -------- Final 状态 Render --------
  return (
    <div className="relative w-full min-h-screen bg-white flex items-center justify-center p-[28px]">
      <div className="relative w-full max-w-[420px] bg-[#23538f] p-[30px] rounded-[10px]">

        {/* ---------------------------------------------------- */}
        {/*                    Overall Rankings                  */}
        {/* ---------------------------------------------------- */}

        <h1 className="text-[28px] font-bold text-white text-center mb-[25px]">
          Overall Rankings
        </h1>

        <div className="bg-white border-[25px] border-[#4f84c1] mb-[35px]">
          <div className="py-[20px]">
            {overall.map((team, index) => (
              <div
                key={team.name}
                className="flex items-center justify-between px-[20px] py-[8px]"
              >
                <span className={`${fontSizes[index]} font-bold text-black`}>
                  {team.name}
                </span>
                <span className={`${fontSizes[index]} font-bold text-black`}>
                  {team.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/*               Round-by-Round Scoreboards            */}
        {/* ---------------------------------------------------- */}

        <h2 className="text-[28px] font-bold text-white text-center mb-[30px]">
          Round by Round Scoreboards
        </h2>

        <div className="space-y-[40px] mb-[35px]">
          {rounds.map((round) => (
            <div key={round.title}>
              <h3 className="text-[24px] font-bold text-white text-center mb-[15px]">
                {round.title}
              </h3>

              <div
                className="border-[20px] border-black rounded-[5px] p-[20px]"
                style={{
                  backgroundColor: round.bgColor,
                  borderTopWidth: "55px",
                }}
              >
                {round.scores.map((score) => (
                  <div
                    key={score.teamName}
                    className="flex items-center justify-between mb-[12px] last:mb-0"
                  >
                    <span className="text-[26px] font-bold text-black">
                      {score.teamName}
                    </span>
                    <span className="text-[26px] font-bold text-black">
                      {score.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ---------------------------------------------------- */}
        {/*                    Scoring Explanation               */}
        {/* ---------------------------------------------------- */}

        <div className="text-[24px] font-semibold text-white text-center mb-[20px] leading-normal">
          <p>3 points per #1 vote</p>
          <p>2 points per #2 vote</p>
          <p>1 point per #3 vote</p>
        </div>

        {/* ---------------------------------------------------- */}
        {/*                      Footer Logo                     */}
        {/* ---------------------------------------------------- */}

        <div className="relative w-full h-[58px]">
          <Image
            src="/unc-kfbs-logo.png"
            alt="UNC KFBS Logo"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}

