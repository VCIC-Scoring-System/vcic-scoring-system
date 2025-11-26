import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// --- Types ---
type ScoreboardRow = {
  teamName: string;
  totalScore: number;
};

type ScoreboardResponse = {
  status: "Live" | "Final";
  eventName: string;
  message?: string;
  hostLogoUrl?: string;
  hostName?: string;
  overallRankings?: ScoreboardRow[];
  dueDiligence?: ScoreboardRow[];
  writtenDeliverable?: ScoreboardRow[];
  partnerMeeting?: ScoreboardRow[];
};

// --- Specific Font Sizes ---
const fontSizes = [
  "text-[28px]",
  "text-[26px]",
  "text-[24px]",
  "text-[23px]",
  "text-[23px]",
  "text-[23px]",
];

const fetchScoreboard = async (
  eventId: string
): Promise<ScoreboardResponse> => {
  const res = await fetch(`/api/scoreboard/${eventId}`);
  if (!res.ok) throw new Error("Failed to load scoreboard");
  return res.json();
};

export default function ScoreboardPage() {
  const router = useRouter();
  const { eventId } = router.query;

  const { data, isLoading, isError } = useQuery<ScoreboardResponse, Error>({
    queryKey: ["scoreboard", eventId],
    queryFn: () => fetchScoreboard(eventId as string),
    enabled: !!eventId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center space-y-4 p-8">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-[600px] w-full max-w-6xl rounded-none" />
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-grow flex items-center justify-center text-red-600">
          Error loading scoreboard.
        </div>
        <Footer />
      </div>
    );
  }

  // --- VIEW 1: LIVE EVENT ---
  if (data.status === "Live") {
    return (
      <div className="min-h-screen flex flex-col bg-white text-black">
        <Header />

        {/* Back Button (Icon Only) */}
        <div className="container mx-auto px-4 mt-6">
          <div className="self-start">
            <Button
              variant="outline"
              className="pl-2 pr-4 border-gray-400 text-gray-700 hover:bg-gray-100"
              onClick={() => router.push("/")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <main className="flex-grow flex justify-center px-4 py-6">
          <div className="w-full max-w-[420px] bg-white p-8">
            <h1 className="text-[28px] font-bold text-black text-center mb-[25px]">
              {data.eventName}
            </h1>
            <div className="bg-white border-2 border-gray-400 p-[40px] text-center rounded-md shadow-sm">
              <h2 className="text-2xl font-bold text-vcic-blue-500 mb-[20px]">
                Event in Progress!
              </h2>
              <p className="text-xl text-black">
                {data.message ||
                  "This event is ongoing. Please check back later."}
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- VIEW 2: FINAL SCOREBOARD ---
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-6 max-w-8xl">
        {/* Top Title Section */}
        <div className="text-center mb-3 relative">
          {/* Back Button */}
          <div className="left-0 hidden md:block">
            <div className="place-self-start">
              <Button
                variant="outline"
                className="pl-2 pr-4 border-gray-400 text-gray-700 hover:bg-gray-100"
                onClick={() => router.push("/")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Back Button */}
          <div className="md:hidden flex justify-start">
            <div className="self-start">
              <Button
                variant="outline"
                className="pl-2 pr-4 border-gray-400 text-gray-700 hover:bg-gray-100"
                onClick={() => router.push("/")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Event Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {data.eventName}
          </h1>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-13 gap-4 h-full items-stretch">
          {/* --- LEFT PANEL: Overall Rankings (Blue) --- */}
          <div className="lg:col-span-4 flex flex-col bg-scoreboard-blue-dark p-10 py-6 md:p-6">
            <h2 className="text-white text-2xl font-bold text-center mb-4">
              Overall Rankings
            </h2>

            <div className="bg-scoreboard-blue-light p-6 flex-grow flex flex-col">
              <div className="bg-white px-8 py-6 shadow-sm h-full">
                <div className="flex flex-col gap-4">
                  {data.overallRankings?.map((team, index) => {
                    const fontSizeClass =
                      fontSizes[index] || fontSizes[fontSizes.length - 1];
                    return (
                      <div
                        key={team.teamName}
                        className="flex justify-between items-center"
                      >
                        <span
                          className={`${fontSizeClass} font-bold text-black`}
                        >
                          {team.teamName}
                        </span>
                        <span
                          className={`${fontSizeClass} font-bold text-black`}
                        >
                          {team.totalScore}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Host Logo Area */}
            <div className="bg-white mt-6 p-2 flex justify-center items-center h-20 overflow-hidden">
              {data.hostLogoUrl ? (
                // Priority 1: Host Logo
                <div className="relative h-full w-full">
                  <Image
                    src={data.hostLogoUrl}
                    alt="Host Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : data.hostName ? (
                // Priority 2: Host Name (Text)
                <span className="text-gray-900 font-bold text-lg text-center leading-tight px-2">
                  {data.hostName}
                </span>
              ) : (
                // Priority 3: VCIC Fallback Logo
                <div className="relative h-full w-full">
                  <Image
                    src="/vcic-logo.png"
                    alt="VCIC Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* --- RIGHT PANEL: Round by Round (Gray) --- */}
          <div className="lg:col-span-9 flex flex-col bg-scoreboard-gray p-10 py-6 md:p-6">
            <h2 className="text-white text-2xl font-bold text-center mb-4">
              Round by Round Scoreboards
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-4 flex-grow">
              <RoundCard
                title="Due Diligence"
                data={data.dueDiligence}
                bgColor="bg-scoreboard-pink"
              />
              <RoundCard
                title="Written Deliverables"
                data={data.writtenDeliverable}
                bgColor="bg-scoreboard-purple"
              />
              <RoundCard
                title="Partner Meetings"
                data={data.partnerMeeting}
                bgColor="bg-scoreboard-green"
              />
            </div>

            {/* Footer Info - Centered on Mobile */}
            <div className="mt-6 flex flex-col md:flex-row justify-between items-center md:items-end">
              <div className="text-white text-lg leading-snug text-center md:text-left mb-4 md:mb-1 md:ml-8 items-center">
                <p>3 points per #1 vote</p>
                <p>2 points per #2 vote</p>
                <p>1 point per #3 vote</p>
              </div>

              <div className="relative h-20 w-72 shrink-0 md:mr-8">
                <Image
                  src="/UNC-kenan-flagler-logo.png"
                  alt="UNC Kenan-Flagler Business School"
                  fill
                  // Centered on mobile, Right on desktop
                  className="object-contain object-center md:object-right"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// --- Helper Component for Round Cards ---
function RoundCard({
  title,
  data,
  bgColor,
}: {
  title: string;
  data?: ScoreboardRow[];
  bgColor: string;
}) {
  return (
    <div
      className={`border-24 lg:border-16 border-t-4 lg:border-t-4 border-black flex flex-col h-full ${bgColor}`}
    >
      {/* Black Header Bar */}
      <div className="bg-black text-white text-center py-2 px-1 min-h-[50px] flex items-center justify-center">
        <h3 className="font-bold text-xl lg:text-lg leading-tight">{title}</h3>
      </div>

      {/* Body */}
      <div className="py-6 px-8 flex-grow flex flex-col gap-3">
        {data?.map((row) => (
          <div
            key={row.teamName}
            className="flex justify-between items-center pb-1"
          >
            <span className="text-black font-bold text-[22px] truncate mr-1">
              {row.teamName}
            </span>
            <span className="text-black font-bold text-[23px]">
              {row.totalScore}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
