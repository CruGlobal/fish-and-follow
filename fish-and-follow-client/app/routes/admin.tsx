import { useState } from "react";
import type { Route } from "./+types/admin";
import type { UserRole } from "~/types/user";
import type { Contact } from "~/types/contact";

import { ExportFilterDialog } from "~/components/ExportFilterDialog";
import { useUsers } from "~/lib/userStore";
import { useContacts } from "~/hooks/useContacts";
import { useContactStats } from "~/hooks/useContactStats";
import { StatCard, PageHeader, ContentCard } from "~/components/ui";
import { UsersTable } from "~/components/UsersTable";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin Panel - Fish and Follow" },
    { name: "description", content: "Manage accounts and system settings" },
  ];
}

export default function Admin() {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const {
    users,
    updateUser,
    deleteUser,
    isLoading,
    isFilterLoading,
    filters,
    updateFilters,
  } = useUsers();
  const { contacts, exportContacts } = useContacts();
  const { stats: contactStats } = useContactStats();

  // Helper function to update user role
  const handleUpdateRole = (id: string, role: UserRole) => {
    confirm(`Are you sure you want to change this user's role to ${role}?`) &&
      updateUser(id, { role });
  };

  // Helper function to toggle user status
  const handleToggleStatus = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      updateUser(id, { isActive: !user.isActive });
    }
  };

  const handleExport = (
    filteredContacts: Contact[],
    format: "csv" | "excel"
  ) => {
    exportContacts(filteredContacts, format);
  };

  // Calculate user statistics (keep these frontend-based as they're user-specific)
  const totalUsers = users.length;
  const adminUsers = users.filter((user) => user.role === "admin").length;
  const staffUsers = users.filter((user) => user.role === "staff").length;
  const activeUsers = users.filter((user) => user.isActive).length;

  // Use server-based contact stats instead of frontend calculation
  const totalContacts = contactStats?.total || 0;
  const contactsThisMonth = contacts.filter((contact) => {
    if (!contact.createdAt) return false;
    const contactDate = new Date(contact.createdAt);
    const now = new Date();
    return (
      contactDate.getMonth() === now.getMonth() &&
      contactDate.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div className="min-h-screen app-bg py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Administration"
          subtitle="Manage users, permissions and monitor your system activity"
          centered={true}
        />

        {/* Dashboard Statistics - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total Users"
            value={totalUsers}
            subtitle={`Active: ${activeUsers}`}
            percentage={`${
              totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
            }%`}
            icon={
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            }
            gradientFrom="brand-primary"
            gradientTo="brand-secondary"
          />

          <StatCard
            title="Administrators"
            value={adminUsers}
            subtitle={`Staff: ${staffUsers}`}
            percentage={`Total: ${totalUsers}`}
            icon={
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            gradientFrom="brand-secondary"
            gradientTo="brand-accent"
          />

          <StatCard
            title="Total Contacts"
            value={totalContacts}
            subtitle={`This month: ${contactsThisMonth}`}
            percentage={`+${contactsThisMonth}`}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "var(--brand-primary)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
            gradientFrom="brand-accent"
            gradientTo="brand-light"
          />

          <StatCard
            title="Activity"
            value="Active"
            subtitle="System Status"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "var(--brand-primary)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            }
            gradientFrom="brand-light"
            gradientTo="brand-secondary"
          />
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <ContentCard blur={true} className="mb-6 sm:mb-8">
          <div className="px-6 py-4 border-b border-[#CDF5FD]">
            <h3 className="text-lg font-semibold text-gray-800">
              Quick Actions
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setShowExportDialog(true)}
                className="flex items-center p-3 sm:p-4 bg-gradient-to-r from-[#A0E9FF]/20 to-[#CDF5FD]/30 border-2 border-dashed border-[#89CFF3] rounded-xl hover:border-[#00A9FF] hover:bg-gradient-to-r hover:from-[#89CFF3]/20 hover:to-[#A0E9FF]/30 transition-all duration-300 group touch-manipulation cursor-pointer"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#00A9FF] to-[#89CFF3] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-semibold text-gray-800">
                    Export Contacts
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Download contact data
                  </p>
                </div>
              </button>

              <button className="flex items-center p-3 sm:p-4 bg-gradient-to-r from-[#CDF5FD]/30 to-[#A0E9FF]/20 border-2 border-dashed border-[#89CFF3] rounded-xl hover:border-[#00A9FF] hover:bg-gradient-to-r hover:from-[#A0E9FF]/20 hover:to-[#89CFF3]/20 transition-all duration-300 group touch-manipulation cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-[#89CFF3] to-[#A0E9FF] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-semibold text-gray-800">
                    Add User
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Create new user account
                  </p>
                </div>
              </button>
            </div>
          </div>
        </ContentCard>

        {/* User Management */}
        <ContentCard blur={true} padding="none">
          <div className="px-6 py-4 border-b border-[#CDF5FD]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                User Management
              </h3>
              <span className="text-sm text-gray-500">
                {totalUsers} users total
              </span>
            </div>
          </div>
          <div className="p-6">
            <UsersTable
              users={users}
              onUpdateUser={updateUser}
              onDeleteUser={deleteUser}
              onToggleStatus={handleToggleStatus}
              onUpdateRole={handleUpdateRole}
              isLoading={isLoading}
              isFilterLoading={isFilterLoading}
              filters={filters}
              onUpdateFilters={updateFilters}
            />
          </div>
        </ContentCard>

        {/* Export Filter Dialog */}
        {showExportDialog && (
          <ExportFilterDialog
            contacts={contacts}
            onExport={handleExport}
            onClose={() => setShowExportDialog(false)}
          />
        )}
      </div>
    </div>
  );
}
