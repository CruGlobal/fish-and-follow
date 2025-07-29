import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";

interface NavigationProps {
  currentPath?: string;
}

export function Navigation({ currentPath }: NavigationProps) {
  const { isAuthenticated, user, logout: onLogout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();

  const publicLinks = [
    { href: "/", label: t("navigation.contactForm") },
    { href: "/resources", label: t("navigation.resources") },
  ];

  const authenticatedLinks = [
    { href: "/contacts", label: t("navigation.contacts") },
    { href: "/admin", label: t("navigation.admin") },
    { href: "/bulkmessaging", label: t("navigation.bulkMessaging") },
  ];

  const isCurrentPath = (path: string) => currentPath === path;

  const getVisibleLinks = () => {
    if (isAuthenticated) {
      return [...publicLinks, ...authenticatedLinks];
    }
    return publicLinks;
  };

  const visibleLinks = getVisibleLinks();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const lngs: Record<"en" | "pt", { nativeName: string }> = {
    en: { nativeName: "English" },
    pt: { nativeName: "Português" },
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                {t("navigation.brand")}
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isCurrentPath(link.href)
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <select
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              value={i18n.language}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              {Object.keys(lngs).map((lng) => (
                <option key={lng} value={lng}>
                  {
                    (lngs as Record<string, { nativeName: string }>)[lng]
                      .nativeName
                  }
                </option>
              ))}
            </select>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {t("navigation.welcome")},{" "}
                  {user?.displayName || user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  {t("navigation.logout")}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isCurrentPath("/login")
                    ? "border-blue-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {t("navigation.login")}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Link
              to="/profile"
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              {t("navigation.profile")}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isCurrentPath(link.href)
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile auth section */}
            <div className="border-t border-gray-200 pt-2">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <div className="block pl-3 pr-4 py-2 text-base font-medium text-gray-600">
                    {t("navigation.welcome")},{" "}
                    {user?.displayName || user?.username}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  >
                    {t("navigation.logout")}
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isCurrentPath("/login")
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("navigation.login")}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
