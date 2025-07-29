import { useState } from "react";
import type { Route } from "./+types/admin";

import { ExportFilterDialog } from "~/components/ExportFilterDialog";
import { PageHeaderCentered } from "~/components/PageHeaderCentered";
import { UsersTable } from "~/components/UsersTable";
import type { Contact } from "~/lib/contactStore";
import { useContacts } from "~/lib/contactStore";
import { requireAdminRole } from "~/lib/requireAdminRole";
import { useUsers } from "~/lib/userStore";

export async function clientLoader() {
  await requireAdminRole();
  return null
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin Panel - Fish and Follow" },
    { name: "description", content: "Manage accounts and system settings" },
  ];
}

export default function Admin() {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const { users, updateUser, deleteUser, toggleUserStatus, updateUserRole } =
    useUsers();
  const { contacts, exportContacts } = useContacts();

  const handleExport = (
    filteredContacts: Contact[],
    format: "csv" | "excel"
  ) => {
    exportContacts(filteredContacts, format);
  };

  // Calculate statistics
  const totalUsers = users.length;
  const adminUsers = users.filter((user) => user.role === "admin").length;
  const staffUsers = users.filter((user) => user.role === "staff").length;
  const activeUsers = users.filter((user) => user.isActive).length;

  const totalContacts = contacts.length;
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
    <div className="min-h-screen bg-gray-50 py-2 sm:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <PageHeaderCentered
          title="Administration"
          description="Manage users, permissions and monitor your system activity"
        />

        {/* Dashboard Statistics - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
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
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  Total Users
                </p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                  {totalUsers}
                </p>
              </div>
            </div>
            <div className="mt-2 sm:mt-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-500">Active: {activeUsers}</span>
                <span className="text-green-600">
                  {totalUsers > 0
                    ? Math.round((activeUsers / totalUsers) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-green-600"
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
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  Administrators
                </p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                  {adminUsers}
                </p>
              </div>
            </div>
            <div className="mt-2 sm:mt-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-500">Staff: {staffUsers}</span>
                <span className="text-gray-500">Total: {totalUsers}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  Total Contacts
                </p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                  {totalContacts}
                </p>
              </div>
            </div>
            <div className="mt-2 sm:mt-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-500">
                  This month: {contactsThisMonth}
                </span>
                <span className="text-blue-600">+{contactsThisMonth}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  Activity
                </p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                  Active
                </p>
              </div>
            </div>
            <div className="mt-2 sm:mt-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-500">System</span>
                <span className="text-green-600">Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <div className="bg-white rounded-lg shadow mb-4 sm:mb-8">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">
              Quick Actions
            </h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={() => setShowExportDialog(true)}
                className="flex items-center p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group touch-manipulation"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600"
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
                <div className="ml-3 sm:ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    Smart Export
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Advanced filtering & formats
                  </p>
                </div>
              </button>

              <a
                href="/contacts"
                className="flex items-center p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group touch-manipulation"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    Manage Contacts
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    View all contacts
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* User Management Section - Mobile Optimized */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                User Management
              </h3>
            </div>
          </div>
          <div className="p-2 sm:p-6">
            <div className="overflow-x-auto">
              <UsersTable
                users={users}
                onUpdateUser={updateUser}
                onDeleteUser={deleteUser}
                onToggleStatus={toggleUserStatus}
                onUpdateRole={updateUserRole}
                // onUpdatePermissions={updateUserPermissions} // Permissions disabled
              />
            </div>
          </div>
        </div>

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
