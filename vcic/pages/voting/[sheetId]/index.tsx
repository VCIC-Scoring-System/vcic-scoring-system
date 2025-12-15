import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EventData } from "@/lib/types";
import Head from "next/head";

// Fetcher function
const fetchVoteData = async (sheetId: string): Promise<EventData> => {
  const res = await fetch(`/api/vote-data/${sheetId}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to load data");
  }
  return res.json();
};

export default function JudgeSelectionPage() {
  const router = useRouter();
  const { sheetId } = router.query;

  // State to track which judge is being clicked (for loading effect)
  const [isNavigating, setIsNavigating] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<EventData, Error>({
    queryKey: ["voteData", sheetId],
    queryFn: () => fetchVoteData(sheetId as string),
    enabled: !!sheetId,
  });

  const handleSelectJudge = (judgeId: string) => {
    setIsNavigating(judgeId);
    router.push({
      pathname: `/voting/${sheetId}/vote`,
      query: { judgeId },
    });
  };

  // Determine the name (fallback to "VCIC Voting" if loading)
  const eventName = data?.eventName || "VCIC Voting";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Head>
        <title>{eventName}</title>
      </Head>

      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          {isLoading ? (
            <Skeleton className="h-10 w-1/2 mx-auto mb-2" />
          ) : (
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {/* Display the actual Event Name */}
              {data?.eventName || "Loading Event..."}
            </h1>
          )}
          <p className="text-gray-500 text-sm md:text-base mt-2 md:mt-3">
            Select your profile to begin the voting process.
          </p>
        </div>

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center max-w-2xl mx-auto">
            Unable to load judges. Please check the link and try again.
          </div>
        )}

        {/* Loading State (Skeletons) */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="flex flex-col items-center space-y-3">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        )}

        {/* Success State: Judge Grid */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {data.judges.map((judge) => (
              <Card
                key={judge.judge_id}
                onClick={() => handleSelectJudge(judge.judge_id)}
                className={`
                  cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-sm
                  active:scale-95 bg-white
                  ${
                    isNavigating === judge.judge_id
                      ? "opacity-50"
                      : "opacity-100"
                  }
                `}
              >
                <CardContent className="flex flex-col items-center p-6">
                  {/* Avatar Container */}
                  <div className="relative w-24 h-24 mb-4">
                    <Image
                      src={judge.photo_url || "/judge-placeholder.jpg"}
                      alt={judge.judge_name}
                      fill
                      className="rounded-full object-cover border-2 border-gray-100 shadow-sm"
                      sizes="(max-width: 768px) 200px, 250px"
                    />
                  </div>

                  {/* Name */}
                  <h3 className="font-semibold text-gray-900 text-center text-base leading-tight">
                    {judge.judge_name}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
