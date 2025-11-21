import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import TeamGrid from "@/components/team-grid";

interface Judge {
  name: string;
  judgeId: string;
}

export default function JudgeSelectionPage() {
  const router = useRouter();
  const { sheetId } = router.query;

  const [eventTitle, setEventTitle] = useState("");
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Google Sheet API
  useEffect(() => {
    if (!sheetId) return;

    const fetchJudges = async () => {
      try {
        const res = await fetch(`/api/vote-data/${sheetId}`);
        const data = await res.json();

        setEventTitle(data.eventName || "Event Title");
        // Map the API response to our Judge interface
        const judgeList = (data.judges || []).map((j: any) => ({
          name: j.judge_name,
          judgeId: j.judge_id,
        }));
        setJudges(judgeList);
      } catch (err) {
        console.error("Failed to fetch judges:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJudges();
  }, [sheetId]);

  // 点击头像 → 跳转投票页
  const handleCardClick = (index: number) => {
    const judge = judges[index];
    if (!judge) return;

    router.push(`/judge/${sheetId}/vote/${judge.judgeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center pt-20">
        <Header />
        <p className="mt-10 text-lg text-gray-600">Loading judges...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="mt-6">
        <TeamGrid
          eventTitle={eventTitle}
          people={judges.map((j) => j.name)}
          onCardClick={handleCardClick}
        />
      </div>
    </div>
  );
}
