import { useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/header";
import BackButton from "@/components/ui/back-button";
import Image from "next/image";

type Round = "Due Diligence" | "Written Deliverables" | "Partner Meeting";
type Place = "1st Place" | "2nd Place" | "3rd Place";

interface Team {
  id: string;
  name: string;
  image: string;
}

const mockTeams: Team[] = [
  { id: "1", name: "Team Ash", image: "/placeholder-team.jpg" },
  { id: "2", name: "Team Birch", image: "/placeholder-team.jpg" },
  { id: "3", name: "Team Cherry", image: "/placeholder-team.jpg" },
  { id: "4", name: "Team Dogwood", image: "/placeholder-team.jpg" },
  { id: "5", name: "Team Elm", image: "/placeholder-team.jpg" },
];

export default function JudgeVotingPage() {
  const router = useRouter();
  const [selectedRound, setSelectedRound] = useState<Round>("Due Diligence");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [votes, setVotes] = useState<Record<Place, Team | null>>({
    "1st Place": null,
    "2nd Place": null,
    "3rd Place": null,
  });

  const rounds: Round[] = ["Due Diligence", "Written Deliverables", "Partner Meeting"];
  const places: Place[] = ["1st Place", "2nd Place", "3rd Place"];

  const handleSubmit = () => {
    // Validate all places are selected
    if (!votes["1st Place"] || !votes["2nd Place"] || !votes["3rd Place"]) {
      alert("Please select teams for all three places");
      return;
    }

    // Navigate to confirmation page
    router.push("/vote-confirmation");
  };

  return (
    <div className="relative w-full min-h-screen bg-white">
      <Header />

      <div className="px-[23px] pt-[5px]">
        <BackButton href="/judge-selection" className="mt-[5px]" />

        <h1 className="text-[24px] font-bold text-black text-center mt-[5px]">
          2025 MBA Central (Texas)
        </h1>

        <p className="text-[20px] font-medium text-black text-center mt-[5px]">
          Voting as: <span className="underline cursor-pointer">Jane Doe</span>
        </p>

        <div className="mt-[15px]">
          <p className="text-[20px] font-medium text-black text-center mb-[5px]">Round:</p>

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

          <p className="text-[20px] font-medium text-black text-center mb-[5px]">Vote:</p>
          <p className="text-[15px] text-black text-center mb-[20px]">
            Indicate your choices for First, Second, and Third places.
          </p>

          {/* Place selection buttons */}
          <div className="flex gap-[14px] mb-[20px]">
            {places.map((place) => (
              <button
                key={place}
                onClick={() => setSelectedPlace(place)}
                className={`flex-1 h-[36px] rounded-[5px] border border-black text-[14px] ${
                  selectedPlace === place
                    ? "bg-[#c8ddf6]"
                    : "bg-neutral-100"
                }`}
              >
                {place}
              </button>
            ))}
          </div>

          {/* Team selection area */}
          <div className="relative h-[466px] overflow-hidden rounded-[10px] mb-[35px]">
            <div className="grid grid-cols-2 gap-[10px] p-[20px]">
              {mockTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => {
                    if (selectedPlace) {
                      setVotes((prev) => ({
                        ...prev,
                        [selectedPlace]: team,
                      }));
                    }
                  }}
                  className="flex flex-col items-center p-[10px] border border-gray-300 rounded-[10px] hover:bg-gray-50"
                >
                  <div className="relative w-full aspect-video mb-[5px] bg-gray-200 rounded-[5px] overflow-hidden">
                    <Image
                      src={team.image}
                      alt={team.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-[14px] font-medium text-black">{team.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            className="w-[243px] h-[50px] mx-auto block bg-[#5883b8] rounded-[10px] text-white text-[20px] font-semibold"
          >
            Submit Vote
          </button>
        </div>
      </div>
    </div>
  );
}
