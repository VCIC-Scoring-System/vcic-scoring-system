export function Footer() {
  return (
    <footer className="w-full bg-vcic-dark text-white py-8 mt-auto">
      <div className="container mx-auto text-center px-4">
        <p className="text-sm text-gray-300">
          © {new Date().getFullYear()} Venture Capital Investment Competition
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Powered by UNC Kenan-Flagler Business School
        </p>
      </div>
    </footer>
  );
}
