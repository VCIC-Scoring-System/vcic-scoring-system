import Image from "next/image";

export function Header() {
  return (
    <header className="w-full bg-vcic-blue-500 py-4 px-4 shadow-md">
      <div className="container mx-auto flex sm:justify-start">
        <div className="relative h-10 w-50 sm:h-12 sm:w-60">
          <Image
            src="/vcic-header-logo.png"
            alt="VCIC and UNC KFBS Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </div>
      </div>
    </header>
  );
}
