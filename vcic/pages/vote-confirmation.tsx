import { useRouter } from "next/router";
import Header from "@/components/header";
import Footer from "@/components/ui/footer";
import Image from "next/image";

interface VoteResult {
  place: string;
  emoji: string;
  teamName: string;
  teamImage: string;
}

const mockVoteResults: VoteResult[] = [
  {
    place: "1st Place",
    emoji: "🥇",
    teamName: "Team Ash",
    teamImage: "/placeholder-team.jpg",
  },
  {
    place: "2nd Place",
    emoji: "🥈",
    teamName: "Team Cherry",
    teamImage: "/placeholder-team.jpg",
  },
  {
    place: "3rd Place",
    emoji: "🥉",
    teamName: "Team Birch",
    teamImage: "/placeholder-team.jpg",
  },
];

export default function VoteConfirmationPage() {
  const router = useRouter();

  return (
    <div className="relative w-full min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 px-[42px] py-[20px]">
        <h1 className="text-[24px] font-bold text-black text-center mb-[5px]">
          2025 MBA Central (Texas)
        </h1>

        <p className="text-[20px] font-medium text-black text-center mb-[20px]">
          Voting as: <span className="underline">Jane Doe</span>
        </p>

        <h2 className="text-[20px] font-semibold text-black text-center mb-[10px]">
          Thanks for Voting!
        </h2>

        <p className="text-[20px] font-medium text-black text-center mb-[35px]">
          Your vote for &quot;Due Diligence&quot; has been successfully submitted.
        </p>

        <h3 className="text-[20px] font-semibold text-black text-center mb-[20px]">
          Vote Summary
        </h3>

        {/* Vote results */}
        <div className="space-y-[20px] mb-[35px]">
          {mockVoteResults.map((result, index) => (
            <div
              key={index}
              className="relative h-[115px] bg-neutral-100 border border-black rounded-[10px] p-[20px] flex items-center"
            >
              <div className="flex-1">
                <p className="text-[20px] font-normal text-black mb-[5px]">
                  {result.emoji} {result.place}
                </p>
                <p className="text-[15px] font-normal text-black">
                  {result.teamName}
                </p>
              </div>
              <div className="relative w-[150px] h-[100px] overflow-hidden rounded-[5px]">
                <Image
                  src={result.teamImage}
                  alt={result.teamName}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-[16px]">
          <button
            onClick={() => router.push("/judge-selection")}
            className="flex-1 h-[50px] bg-[#5883b8] rounded-[10px] text-white text-[18px] font-semibold"
          >
            Back to Voting
          </button>
          <button
            onClick={() => router.push("/previous-votes")}
            className="flex-1 h-[50px] bg-[#5883b8] rounded-[10px] text-white text-[18px] font-semibold"
          >
            View Previous Votes
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
