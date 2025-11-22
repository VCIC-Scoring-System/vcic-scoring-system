import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { useRouter } from "next/router";

// Event type
interface EventItem {
  id: string;
  name: string;
  category: "MBA" | "Undergraduate";
  status: "live" | "final"; // 🟢 or 🏁
  date: string;
  host: {
    name: string;
    logo: string; // logo URL
  };
}

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "MBA" | "Undergraduate"
  >("MBA");
  const [loading, setLoading] = useState(true);

  // Fetch events from API
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();

        setEvents(data.events);
        setFilteredEvents(
          data.events.filter((e: EventItem) => e.category === "MBA")
        );
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Apply filters
  useEffect(() => {
    const results = events.filter((evt) => {
      const matchCat = evt.category === selectedCategory;
      const matchSearch = evt.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });

    setFilteredEvents(results);
  }, [search, selectedCategory, events]);

  if (loading)
    return (
      <p className="text-center mt-20 text-lg text-black">Loading events...</p>
    );

  return (
    <div className="bg-white min-h-screen pb-10">
      <Header />

      {/* Page Title */}
      <h1 className="text-[28px] font-bold text-black text-center mt-[20px]">
        VCIC Events
      </h1>

      {/* Search Box */}
      <div className="px-6 mt-[15px]">
        <div className="flex items-center px-3 py-2 border rounded-md bg-white shadow-sm">
          <span className="text-gray-500 text-lg mr-2">🔍</span>
          <input
            className="flex-1 outline-none text-[16px] text-black"
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex px-6 mt-4 gap-2">
        <button
          onClick={() => setSelectedCategory("MBA")}
          className={`flex-1 px-4 py-2 text-sm rounded-md ${
            selectedCategory === "MBA"
              ? "bg-[#5883B8] text-white hover:bg-[#4a6ea0]"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          MBA
        </button>

        <button
          onClick={() => setSelectedCategory("Undergraduate")}
          className={`flex-1 px-4 py-2 text-sm rounded-md ${
            selectedCategory === "Undergraduate"
              ? "bg-[#5883B8] text-white hover:bg-[#4a6ea0]"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Undergraduate
        </button>
      </div>

      {/* Event Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 mt-6">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-white border border-gray-300 rounded-[10px] overflow-hidden shadow-sm"
          >
            {/* Event Name Bar */}
            <div className="bg-[#4f84c1] px-2 py-2 text-center text-white text-[15px] font-semibold">
              {evt.name}
            </div>

            {/* Body */}
            <div className="px-3 py-2 text-[15px]">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-black">
                  {evt.status === "live" ? "live 🟢" : "final 🏁"}
                </span>
              </div>

              {/* Date */}
              <p className="mt-1 text-black">{evt.date}</p>

              {/* Hosted By */}
              <p className="mt-2 text-[14px] text-black">
                Hosted by {evt.host.name}
              </p>

              {/* Scoreboard Button */}
              <button
                onClick={() => router.push(`/scoreboard/${evt.id}`)}
                className="w-full bg-[#333333] text-white py-2 rounded-md mt-3 text-[15px] text-center"
              >
                View Scoreboard
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
