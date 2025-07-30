import { useState } from "react";
import { Link } from "react-router";

export default function ModernNavigation() {
  const [activeTab, setActiveTab] = useState("home");

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      href: "/",
    },
    {
      id: "contact-form",
      label: "Contact",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      href: "/contacts",
    },
    {
      id: "resources",
      label: "Resources",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      href: "/resources",
    },
    {
      id: "admin",
      label: "Settings",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: "/admin",
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:bg-[#FCF3D9]/90 lg:backdrop-blur-xl lg:border-r lg:border-white/20 lg:shadow-xl">
        <div className="flex flex-col flex-grow pt-6 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00A9FF] via-[#89CFF3] to-[#A0E9FF] rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Fish & Follow</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                onClick={() => setActiveTab(item.id)}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 transform ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-[#00A9FF] to-[#89CFF3] text-white shadow-lg scale-105"
                    : "text-gray-700 hover:bg-white/50 hover:text-[#00A9FF] hover:scale-102 hover:shadow-md"
                }`}
              >
                <div className={`mr-3 transition-all duration-300 ${
                  activeTab === item.id ? "scale-110" : "group-hover:scale-105"
                }`}>{item.icon}</div>
                <span className={`transition-all duration-300 ${
                  activeTab === item.id ? "font-semibold" : ""
                }`}>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Welcome Message */}
          <div className="px-6 mt-8">
            <div className="p-5 bg-gradient-to-br from-white/60 to-[#A0E9FF]/20 rounded-2xl border border-white/30 shadow-lg backdrop-blur-sm">
              <p className="text-sm text-gray-700 font-semibold mb-3">Collect and connect easily</p>
              <Link
                to="/contact-form"
                className="inline-flex items-center px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#00A9FF] via-[#89CFF3] to-[#A0E9FF] rounded-xl hover:from-[#89CFF3] hover:via-[#A0E9FF] hover:to-[#00A9FF] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started
                <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 bg-[#FCF3D9]/95 backdrop-blur-xl border border-white/20 shadow-2xl z-50 rounded-3xl">
        <div className="flex items-center justify-around h-14 px-2">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-12 h-11 rounded-xl transition-all duration-300 transform ${
                activeTab === item.id
                  ? "bg-gradient-to-br from-[#00A9FF] to-[#89CFF3] text-white shadow-lg scale-110 -translate-y-1"
                  : "text-gray-600 hover:text-[#00A9FF] hover:bg-white/40 hover:scale-105 hover:-translate-y-0.5"
              }`}
            >
              <div className={`w-5 h-5 mb-0.5 transition-all duration-300 ${
                activeTab === item.id ? "scale-110" : ""
              }`}>{item.icon}</div>
              <span className={`text-xs font-medium transition-all duration-300 ${
                activeTab === item.id ? "font-semibold" : ""
              }`}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
