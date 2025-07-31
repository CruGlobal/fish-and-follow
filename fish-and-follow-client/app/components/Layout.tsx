import { Outlet } from "react-router";
import ModernNavigation from "~/components/ModernNavigation";

export default function Layout() {
  return (
    <div className="min-h-screen app-bg">
      <ModernNavigation />
      
      {/* Main Content */}
      <div className="lg:pl-64 pb-16 lg:pb-0">
        <Outlet />
      </div>
    </div>
  );
}
