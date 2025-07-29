import { Outlet } from "react-router";
import ModernNavigation from "~/components/ModernNavigation";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CDF5FD] to-white">
      <ModernNavigation />
      
      {/* Main Content */}
      <div className="lg:pl-64 pb-16 lg:pb-0">
        <Outlet />
      </div>
    </div>
  );
}
