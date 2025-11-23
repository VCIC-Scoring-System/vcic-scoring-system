import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

// --- Data Type Definition ---
interface EventItem {
  id: string;
  name: string;
  category: "MBA" | "Undergraduate";
  status: "live" | "final";
  date: string;
  host: {
    name: string;
    logo: string;
  };
}

export default function HomePage() {
  // State
  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | "MBA" | "Undergraduate"
  >("All");
  const [loading, setLoading] = useState(true);

  // Fetch events
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/events");
        if (!res.ok) throw new Error(`API Error: ${res.status}`);

        const rawData = await res.json();

        // Your API returns { events: [...] }
        const eventsArray = rawData.events || [];

        // Sort by Date (Newest First)
        const sortedData = eventsArray.sort(
          (a: EventItem, b: EventItem) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setEvents(sortedData);
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filter Logic
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // 1. Filter by Category
      const matchCat =
        selectedCategory === "All" || evt.category === selectedCategory;

      // 2. Filter by Search (Name or Host)
      const term = search.toLowerCase();
      const matchSearch =
        evt.name.toLowerCase().includes(term) ||
        evt.host.name.toLowerCase().includes(term);

      return matchCat && matchSearch;
    });
  }, [events, search, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-lg text-gray-500 animate-pulse">
            Loading events...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          VCIC Events
        </h1>

        {/* --- Controls Section --- */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          {/* 1. Search Box */}
          <div className="relative w-full md:w-96 md:order-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              className="w-full pl-10 pr-4 py-2 text-gray-600 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-vcic-blue-500 focus:border-transparent transition-all"
              type="text"
              placeholder="Search events or hosts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* 2. Category Tabs */}
          <div className="w-full md:w-auto md:order-1">
            <div className="grid grid-cols-3 w-full gap-2">
              {(["All", "MBA", "Undergraduate"] as const).map((cat) => (
                <Button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`
                    flex-1 h-auto py-2.5 px-6 text-sm font-semibold transition-all
                    ${
                      selectedCategory === cat
                        ? "bg-vcic-blue-500 text-white hover:bg-vcic-blue-600 shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm"
                    }
                  `}
                >
                  {cat === "All" ? "All Events" : cat}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* --- Event Grid --- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
            >
              {/* Event Name Bar (Blue Header) */}
              <div className="bg-vcic-blue-500 px-2 text-center h-20 flex items-center justify-center">
                <h3 className="text-white text-base font-bold leading-tight line-clamp-2">
                  {evt.name}
                </h3>
              </div>

              {/* Body */}
              <div className="px-4 py-3 flex flex-col flex-grow bg-gray-50/30">
                {/* Date & Status Row */}
                <div className="flex justify-between items-center text-sm font-medium text-gray-500 mb-3 pb-2 border-b border-gray-100">
                  <span>{evt.date}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="capitalize tracking-wider text-xs">
                      {evt.status}
                    </span>
                    <span
                      className={`block h-2.5 w-2.5 rounded-full ${
                        evt.status === "live" ? "bg-green-500" : "bg-stone-500"
                      }`}
                    />
                  </div>
                </div>

                {/* Host Info */}
                <div className="flex-grow flex flex-col items-center justify-center text-center py-1">
                  <span className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                    Hosted by
                  </span>

                  {/* Host Logo or Name */}
                  <div className="relative h-10 w-28 flex items-center justify-center">
                    {evt.host.logo ? (
                      <Image
                        src={evt.host.logo}
                        alt={evt.host.name}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-700 line-clamp-2">
                        {evt.host.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Scoreboard Button */}
                <Link href={`/scoreboard/${evt.id}`} className="w-full">
                  <div className="w-full bg-vcic-dark hover:bg-vcic-dark/80 text-white text-center py-2.5 rounded-lg mt-4 text-sm font-semibold transition-colors cursor-pointer">
                    View Scoreboard
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl">No events found.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
