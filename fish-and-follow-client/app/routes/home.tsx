import { MoveRight } from "lucide-react";
import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Fish & Follow - Welcome" },
    { name: "description", content: "Welcome to Fish & Follow" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen app-bg">
      <div className="container mx-auto px-4 py-16">`
        {/* Hero Section */}
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
              <img src="/logo.png" alt="Fish & Follow Logo" className="w-32 h-32" />
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-800 mb-12">
            Fish & Follow
          </h1>

          {/* CTA Button */}
          <div>
            <Link
              to="/contact-form"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#00A9FF] to-[#89CFF3] text-white font-semibold rounded-xl hover:from-[#89CFF3] hover:to-[#00A9FF] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started
              <MoveRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
