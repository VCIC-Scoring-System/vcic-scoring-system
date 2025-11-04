import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full bg-[#5883B8] p-4">
      <Image
        src="/vcic-header-logo.png" // Path from the 'public' folder
        alt="VCIC and UNC KFBS Logo"
        width={300} // Set a base width (will be resized)
        height={40} // Set a base height
        className="h-10 w-auto" // Control the size with Tailwind
      />
    </header>
  );
}
