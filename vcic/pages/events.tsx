import { useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/header";
import Image from "next/image";

interface Event {
  id: string;
  name: string;
  location: string;
  type: string;
  status: "live" | "final";
  date: string;
  hostedBy: string;
  logo: string;
}

const mockEvents: Event[] = [
  {
    id: "1",
    name: "2025 MBA Mountain",
    location: "(Colorado)",
    type: "Regional Finals",
    status: "live",
    date: "January 31, 2025",
    hostedBy: "University Logo",
    logo: "/placeholder-logo.jpg",
  },
  {
    id: "2",
    name: "2025 MBA Mountain",
    location: "(Colorado)",
    type: "Regional Finals",
    status: "live",
    date: "January 31, 2025",
    hostedBy: "University Logo",
    logo: "/placeholder-logo.jpg",
  },
  {
    id: "3",
    name: "2025 MBA Mountain",
    location: "(Colorado)",
    type: "Regional Finals",
    status: "live",
    date: "January 31, 2025",
    hostedBy: "University Logo",
    logo: "/placeholder-logo.jpg",
  },
  {
    id: "4",
    name: "2025 MBA Asia",
    location: "(NTU)",
    type: "Regional Finals",
    status: "final",
    date: "March 1, 2025",
    hostedBy: "University Logo",
    logo: "/placeholder-logo.jpg",
  },
  {
    id: "5",
    name: "2025 MBA Asia",
    location: "(NTU)",
    type: "Regional Finals",
    status: "final",
    date: "March 1, 2025",
    hostedBy: "University Logo",
    logo: "/placeholder-logo.jpg",
  },
  {
    id: "6",
    name: "2025 MBA Asia",
    location: "(NTU)",
    type: "Regional Finals",
    status: "final",
    date: "March 1, 2025",
    hostedBy: "University Logo",
    logo: "/placeholder-logo.jpg",
  },
];

export default function EventsPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"MBA" | "Undergraduate">("MBA");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="relative w-full min-h-screen bg-white">
      <Header />

      <main className="px-[47px] py-[20px]">
        <h1 className="text-[24px] font-bold text-black text-center mb-[20px]">
          VCIC Events
        </h1>

        {/* Search bar */}
        <div className="relative w-[345px] h-[36px] mb-[12px]">
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full px-[35px] bg-neutral-100 border border-black rounded-[5px] text-[15px]"
          />
          <svg
            className="absolute left-[10px] top-1/2 -translate-y-1/2 w-[25px] h-[24px]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-[7px] mb-[25px]">
          <button
            onClick={() => setSelectedTab("MBA")}
            className={`flex-1 h-[36px] rounded-[5px] border border-black text-[15px] ${
              selectedTab === "MBA" ? "bg-[#c8ddf6]" : "bg-neutral-100"
            }`}
          >
            MBA
          </button>
          <button
            onClick={() => setSelectedTab("Undergraduate")}
            className={`flex-1 h-[36px] rounded-[5px] border border-black text-[15px] ${
              selectedTab === "Undergraduate" ? "bg-[#c8ddf6]" : "bg-neutral-100"
            }`}
          >
            Undergraduate
          </button>
          <button className="w-[38px] h-[36px] bg-neutral-100 border border-black rounded-[5px] flex items-center justify-center">
            <svg
              className="w-[26px] h-[24px]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>
        </div>

        {/* Events grid */}
        <div className="grid grid-cols-2 gap-[16px]">
          {mockEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => router.push(`/judge-selection?eventId=${event.id}`)}
              className="bg-neutral-100 border border-black rounded-[5px] overflow-hidden"
            >
              {/* Event header */}
              <div className="bg-[#5883b8] border-b border-black h-[53px] flex items-center justify-center px-[10px]">
                <p className="text-[15px] font-semibold text-white text-center">
                  {event.name}
                  <br />
                  {event.location}
                </p>
              </div>

              {/* Event content */}
              <div className="p-[10px] text-left">
                <div className="flex justify-between items-center mb-[5px]">
                  <p className="text-[14px] text-black">{event.type}</p>
                  <p className="text-[14px] text-black text-right">
                    {event.status === "live" ? "live 🟢" : "final 🏁"}
                  </p>
                </div>
                <p className="text-[13px] text-black text-center mb-[10px]">
                  {event.date}
                </p>
                <p className="text-[13px] text-black text-center mb-[5px]">
                  Hosted by
                </p>
                <div className="relative w-full h-[37px] mb-[5px]">
                  <Image
                    src={event.logo}
                    alt={event.hostedBy}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* View Scoreboard button */}
              <div className="bg-[#373839] border-t border-black h-[33px] flex items-center justify-center">
                <p className="text-[15px] font-medium text-white">
                  View Scoreboard
                </p>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
