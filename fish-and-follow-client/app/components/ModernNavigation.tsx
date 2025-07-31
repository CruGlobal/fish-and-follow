import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from '~/hooks/useAuth';
import { HomeIcon, Contact, Book, Settings, MessageCircle, LogOut, LogIn, QrCode, Menu, X } from 'lucide-react'

export default function ModernNavigation() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname.split('/')[1] || 'home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout: onLogout } = useAuth();

  const publicLinks = [
    { id: "home", href: "/", label: "Home", icon: <HomeIcon className="w-5 h-5" /> },
    { id: "contact-form", href: "/contact-form", label: "Contact Form", icon: <Contact className="w-5 h-5" /> },
    { id: "resources", href: "/resources", label: "Resources", icon: <Book className="w-5 h-5" /> },
  ];

  const authenticatedLinks = [
    { id: "contacts", href: "/contacts", label: "Contacts", icon: <Contact className="w-5 h-5" /> },
    { id: "qe", href: "/qr", label: "QR Code", icon: <QrCode className="w-5 h-5" /> },
    ...(user?.role === "admin" ? [{ id: "admin", href: "/admin", label: "Admin", icon: <Settings className="w-5 h-5" /> }] : []),
    { id: "bulkmessaging", href: "/bulkmessaging", label: "Bulk Messaging", icon: <MessageCircle className="w-5 h-5" /> },
  ];

  const getVisibleLinks = () => {
    if (isAuthenticated) {
      return [...publicLinks, ...authenticatedLinks];
    }
    return publicLinks;
  };
  const visibleLinks = getVisibleLinks();


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
            {visibleLinks.map((item) => (
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
                <div className={`mr-3 transition-[scale] duration-300 ${
                  activeTab === item.id ? "scale-110" : "group-hover:scale-105"
                }`}>{item.icon}</div>
                <span className={`transition-[scale] duration-300 ${
                  activeTab === item.id ? "font-semibold" : ""
                }`}>{item.label}</span>
              </Link>
            ))}
          </nav>
            {/* Login/Logout Button */}
            <div className="flex justify-center px-6 mt-6">
            {isAuthenticated ? (
              <button
                onClick={onLogout}
                className="group w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white/60 hover:bg-white/80 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg border border-white/30 hover:border-red-200 hover:text-red-600 transform hover:scale-102 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2 transition-colors duration-300 group-hover:text-red-500" />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="group w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#00A9FF] to-[#89CFF3] hover:from-[#89CFF3] hover:to-[#00A9FF] rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-102"
              >
                <LogIn className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                Login
              </Link>
            )}
            </div>

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
      <div className="lg:hidden">
        {/* Expandable Menu Content */}
        <div className={`fixed bottom-28 left-6 right-6 bg-[#FCF3D9]/95 backdrop-blur-xl border border-white/20 shadow-2xl z-40 rounded-3xl transition-all duration-300 transform ${
          isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
          <div className="p-4 grid grid-cols-2 gap-3">
            {visibleLinks.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center p-3 rounded-2xl transition-all duration-300 transform ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-[#00A9FF] to-[#89CFF3] text-white shadow-lg"
                    : "text-gray-700 bg-white/60 hover:bg-white/80 hover:text-[#00A9FF]"
                }`}
              >
                <div className="mr-3">{item.icon}</div>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
            
            {/* Login/Logout Button in Mobile Menu */}
            <div className="col-span-2 pt-2 border-t border-white/20">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center p-3 text-sm font-medium text-gray-700 bg-white/60 hover:bg-white/80 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg border border-white/30 hover:border-red-200 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center p-3 text-sm font-medium text-white bg-gradient-to-r from-[#00A9FF] to-[#89CFF3] hover:from-[#89CFF3] hover:to-[#00A9FF] rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`w-14 h-14 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 ${
              isMobileMenuOpen
                ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white rotate-180"
                : "bg-gradient-to-r from-[#00A9FF] to-[#89CFF3] text-white"
            }`}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 mx-auto" />
            ) : (
              <Menu className="w-6 h-6 mx-auto" />
            )}
          </button>
        </div>

        {/* Backdrop overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
    </>
  );
}
