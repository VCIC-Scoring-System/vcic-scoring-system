import { Card, CardContent } from "@/components/ui/card";

interface TeamGridProps {
  eventTitle: string;
  people: string[];
  onCardClick?: (index: number) => void;
}

export default function TeamGrid({ eventTitle, people, onCardClick }: TeamGridProps) {
  return (
    <div className="w-full max-w-5xl mx-auto bg-white shadow-lg rounded-md overflow-hidden border">
      <div className="py-6 text-center border-b">
        {/* 🔥 改成黑色文字 */}
        <h2 className="text-2xl font-semibold text-black">{eventTitle}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
        {people.map((name, idx) => (
          <Card
            key={idx}
            onClick={() => onCardClick?.(idx)}
            className="
              w-full flex flex-col items-center pt-4 pb-2 shadow-sm 
              hover:shadow-lg transition cursor-pointer
            "
          >
            <CardContent className="flex flex-col items-center p-0 w-full">
              <div className="w-full aspect-square bg-gray-200 flex items-center justify-center rounded-md">
                <div className="w-2/3 h-2/3 bg-gray-400 rounded-full" />
              </div>

              {/* 🔥 名字加粗 */}
              <p className="mt-3 font-bold text-center text-base">
                {name || "Unnamed"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

