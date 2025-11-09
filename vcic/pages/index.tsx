import { useRouter } from "next/router";
import Header from "@/components/header";

export default function Home() {
  const router = useRouter();

  const pages = [
    { name: "Events Page", path: "/events", description: "Browse and select events" },
    { name: "Judge Selection", path: "/judge-selection", description: "Select judges for voting" },
    { name: "Judge Voting", path: "/judge-voting", description: "Submit votes for teams" },
    { name: "Vote Confirmation", path: "/vote-confirmation", description: "Confirm submitted votes" },
    { name: "Previous Votes", path: "/previous-votes", description: "View voting history" },
    { name: "Overall Scoreboard", path: "/scoreboard-overall", description: "View overall rankings" },
    { name: "Round by Round Scoreboard", path: "/scoreboard-rounds", description: "View scores by round" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          VCIC Scoring System
        </h1>

        <p className="text-center mb-8 text-gray-600">
          Welcome to the VCIC Scoring System. Select a page to navigate:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {pages.map((page) => (
            <button
              key={page.path}
              onClick={() => router.push(page.path)}
              className="p-6 bg-[#5883b8] hover:bg-[#4a6d9a] text-white rounded-lg shadow-md transition-colors"
            >
              <h2 className="text-xl font-semibold mb-2">{page.name}</h2>
              <p className="text-sm text-gray-100">{page.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-12 max-w-2xl mx-auto bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Quick Start Guide</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Start at the <strong>Events Page</strong> to browse available events</li>
            <li>Select an event to go to <strong>Judge Selection</strong></li>
            <li>Choose a judge to proceed to <strong>Judge Voting</strong></li>
            <li>Submit your votes and view the <strong>Vote Confirmation</strong></li>
            <li>Check <strong>Previous Votes</strong> to review your voting history</li>
            <li>View the <strong>Scoreboards</strong> to see rankings</li>
          </ol>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Note: This is a demonstration with placeholder data.</p>
          <p>Replace placeholder images and connect to your backend API.</p>
        </div>
      </main>
    </div>
  );
}
