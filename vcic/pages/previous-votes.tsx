import { useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/header";
import BackButton from "@/components/ui/back-button";
import Image from "next/image";

type Round = "Due Diligence" | "Written Deliverables" | "Partner Meeting";

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

export default function PreviousVotesPage() {
  const router = useRouter();
  const [selectedRound, setSelectedRound] = useState<Round>("Due Diligence");

  const rounds: Round[] = ["Due Diligence", "Written Deliverables", "Partner Meeting"];

  return (
    <div className="relative w-full min-h-screen bg-white">
      <Header />

      <div className="px-[23px] pt-[5px]">
        <BackButton href="/vote-confirmation" className="mt-[5px]" />

        <h1 className="text-[24px] font-bold text-black text-center mt-[5px]">
          2025 MBA Central (Texas)
        </h1>

        <h2 className="text-[24px] font-bold text-black text-center mt-[2px]">
          View Previous Votes
        </h2>

        <p className="text-[20px] font-medium text-black text-center mt-[5px]">
          Voted as: Jane Doe
        </p>

        <h3 className="text-[20px] font-semibold text-black text-center mt-[15px]">
          Round and Vote Summary
        </h3>

        <p className="text-[16px] font-medium text-black text-center mt-[10px] mb-[15px]">
          Click the tab to view your votes for that round.
        </p>

        {/* Round tabs */}
        <div className="flex gap-[7px] mb-[20px]">
          {rounds.map((round) => (
            <button
              key={round}
              onClick={() => setSelectedRound(round)}
              className={`flex-1 h-[36px] rounded-[5px] border border-black text-[14px] ${
                selectedRound === round
                  ? "bg-[#c8ddf6]"
                  : "bg-neutral-100"
              }`}
            >
              {round}
            </button>
          ))}
        </div>

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

        <p className="text-[14px] font-semibold text-black text-center mb-[15px]">
          Want to change your vote or vote for another round?
        </p>

        {/* Back to Voting button */}
        <button
          onClick={() => router.push("/judge-selection")}
          className="w-[185px] h-[50px] mx-auto block bg-[#5883b8] rounded-[10px] text-white text-[18px] font-semibold mb-[30px]"
        >
          Back to Voting
        </button>
      </div>
    </div>
  );
}
