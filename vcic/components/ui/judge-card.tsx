import Image from "next/image";
import Link from "next/link";

interface Judge {
  id: string;
  name: string;
  image: string;
}

interface JudgeCardProps {
  judges: Judge[];
  eventId?: string;
  className?: string;
}

export default function JudgeCard({ judges, eventId, className = "" }: JudgeCardProps) {
  // Display first 2 judges in a 2-column layout
  const displayJudges = judges.slice(0, 2);

  return (
    <div className={`grid grid-cols-2 gap-[20px] ${className}`}>
      {displayJudges.map((judge) => (
        <Link
          key={judge.id}
          href={eventId ? `/judge-voting?eventId=${eventId}&judgeId=${judge.id}` : "#"}
          className="flex flex-col items-center cursor-pointer"
        >
          <div className="relative w-full aspect-square rounded-full overflow-hidden bg-gray-300 mb-[10px]">
            <Image
              src={judge.image}
              alt={judge.name}
              fill
              className="object-cover"
            />
          </div>
          <p className="text-[20px] font-bold text-black text-center">{judge.name}</p>
        </Link>
      ))}
    </div>
  );
}
