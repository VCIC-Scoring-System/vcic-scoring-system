import Image from "next/image";

interface RoundScore {
  teamName: string;
  score: number;
}

interface RoundData {
  title: string;
  bgColor: string;
  scores: RoundScore[];
}

const mockRoundData: RoundData[] = [
  {
    title: "Due Diligence",
    bgColor: "#eecdcd",
    scores: [
      { teamName: "Ash", score: 21 },
      { teamName: "Birch", score: 14 },
      { teamName: "Dogwood", score: 10 },
      { teamName: "Elm", score: 9 },
      { teamName: "Cherry", score: 0 },
      { teamName: "Fir", score: 0 },
    ],
  },
  {
    title: "Written Deliverables",
    bgColor: "#d8d3e7",
    scores: [
      { teamName: "Ash", score: 26 },
      { teamName: "Elm", score: 11 },
      { teamName: "Dogwood", score: 8 },
      { teamName: "Birch", score: 7 },
      { teamName: "Fir", score: 4 },
      { teamName: "Cherry", score: 4 },
    ],
  },
  {
    title: "Partner Meetings",
    bgColor: "#dce9d5",
    scores: [
      { teamName: "Ash", score: 23 },
      { teamName: "Elm", score: 9 },
      { teamName: "Dogwood", score: 9 },
      { teamName: "Birch", score: 8 },
      { teamName: "Fir", score: 4 },
      { teamName: "Cherry", score: 1 },
    ],
  },
];

export default function ScoreboardRoundsPage() {
  return (
    <div className="relative w-full min-h-screen bg-white flex items-center justify-center p-[19px]">
      <div className="relative w-full max-w-[402px] bg-[#666666] p-[20px] rounded-[10px]">
        <h1 className="text-[28px] font-bold text-white text-center mb-[35px]">
          Round by Round Scoreboards
        </h1>

        {/* Rounds */}
        <div className="space-y-[35px] mb-[35px]">
          {mockRoundData.map((round) => (
            <div key={round.title}>
              <h2 className="text-[24px] font-bold text-white text-center mb-[15px]">
                {round.title}
              </h2>

              <div
                className="border-[20px] border-black rounded-[5px] p-[20px]"
                style={{
                  backgroundColor: round.bgColor,
                  borderTopWidth: "55px"
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

        {/* Scoring explanation */}
        <div className="text-[24px] font-semibold text-white text-center mb-[20px] leading-normal">
          <p>3 points per # 1 vote</p>
          <p>2 points per #2 vote</p>
          <p>1 point per #3 vote</p>
        </div>

        {/* Footer logo */}
        <div className="relative w-full h-[52px]">
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
