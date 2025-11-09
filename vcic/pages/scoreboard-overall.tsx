import Image from "next/image";

interface TeamRanking {
  name: string;
  score: number;
}

const mockRankings: TeamRanking[] = [
  { name: "Ash", score: 70 },
  { name: "Birch", score: 29 },
  { name: "DogWood", score: 27 },
  { name: "Elm", score: 20 },
  { name: "Cherry", score: 14 },
  { name: "Fir", score: 8 },
];

// Font sizes for rankings (decreasing as rank increases)
const fontSizes = ["text-[28px]", "text-[26px]", "text-[24px]", "text-[23px]", "text-[23px]", "text-[23px]"];

export default function ScoreboardOverallPage() {
  return (
    <div className="relative w-full min-h-screen bg-white flex items-center justify-center p-[28px]">
      <div className="relative w-full max-w-[383px] bg-[#23538f] p-[30px] rounded-[10px]">
        <h1 className="text-[28px] font-bold text-white text-center mb-[25px]">
          Overall Rankings
        </h1>

        {/* Rankings table with border */}
        <div className="bg-white border-[25px] border-[#4f84c1] mb-[25px]">
          <div className="py-[20px]">
            {mockRankings.map((team, index) => (
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

        {/* Footer logo */}
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
