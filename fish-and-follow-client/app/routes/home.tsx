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
    <div className="min-h-screen bg-gradient-to-br from-[#CDF5FD] to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Hero Section */}
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#00A9FF] to-[#89CFF3] rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
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
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
