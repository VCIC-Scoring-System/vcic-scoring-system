import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/ui/footer";
import JudgeCard from "@/components/ui/judge-card";

// Mock data for judges
const mockJudges = [
  { id: "1", name: "John Doe", image: "/placeholder-judge.jpg" },
  { id: "2", name: "Jane Doe", image: "/placeholder-judge.jpg" },
  { id: "3", name: "John Doe", image: "/placeholder-judge.jpg" },
  { id: "4", name: "Jane Doe", image: "/placeholder-judge.jpg" },
  { id: "5", name: "John Doe", image: "/placeholder-judge.jpg" },
  { id: "6", name: "Jane Doe", image: "/placeholder-judge.jpg" },
];

export default function JudgeSelectionPage() {
  const [eventName] = useState("2025 MBA Central (Texas)");

  return (
    <div className="relative w-full min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 px-[46px] py-[20px]">
        <h1 className="text-[24px] font-bold text-black text-center mb-[20px]">
          {eventName}
        </h1>

        <div className="space-y-[20px]">
          {/* First row of judges */}
          <JudgeCard judges={mockJudges.slice(0, 2)} eventId="event-123" />

          {/* Second row of judges */}
          <JudgeCard judges={mockJudges.slice(2, 4)} eventId="event-123" />

          {/* Third row of judges */}
          <JudgeCard judges={mockJudges.slice(4, 6)} eventId="event-123" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
