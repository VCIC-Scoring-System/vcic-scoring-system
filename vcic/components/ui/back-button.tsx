import Link from "next/link";

interface BackButtonProps {
  href: string;
  className?: string;
}

export default function BackButton({ href, className = "" }: BackButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center w-[30px] h-[28px] bg-neutral-100 border border-black rounded-[5px] text-black text-[20px] ${className}`}
    >
      &lt;
    </Link>
  );
}
