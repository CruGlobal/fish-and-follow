import { useState } from "react";
import type { User, UserRole } from "~/types/user"


interface UsersTableProps {
  users: User[];
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onUpdateRole: (id: string, role: UserRole) => void;
  onUpdatePermissions?: (id: string, permissions: string[]) => void; // Permissions optionnelles
  isLoading?: boolean;
  isFilterLoading?: boolean;
  filters?: {
    search?: string;
    role?: string;
    status?: string;
  };
  onUpdateFilters?: (filters: { search?: string; role?: string; status?: string }) => void;
}

const roleOptions: { value: UserRole; label: string; description: string; color: string }[] = [
  { 
    value: "admin", 
    label: "Administrator", 
    description: "Full system access",
    color: "red"
  },
  { 
    value: "staff", 
    label: "Staff", 
    description: "Contact management and limited access",
    color: "blue"
  }
];

export function UsersTable({ 
  users, 
  onUpdateUser, 
  onDeleteUser, 
  onToggleStatus, 
  onUpdateRole, 
  onUpdatePermissions,
  isLoading = false,
  isFilterLoading = false,
  filters = {},
  onUpdateFilters = () => {}
}: UsersTableProps) {
  const [sortField, setSortField] = useState<keyof User>("lastName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Server-side data - no client-side filtering needed
  const displayUsers = users;

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getRoleConfig = (role: UserRole) => {
    return roleOptions.find(r => r.value === role);
  };

  const SortButton = ({ field, children }: { field: keyof User; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
    >
      <span>{children}</span>
      <div className="flex flex-col">
        <svg 
          className={`w-3 h-3 ${sortField === field && sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </button>
  );

  const renderCell = (value: any) => {
    return (
      <span className="px-2 py-1">
        {value || "-"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filtres et recherche */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="md:col-span-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
                            <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search || ''}
                onChange={(e) => onUpdateFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          {/* Filtre par rôle */}
          <div>
            <select
              value={filters.role || 'all'}
              onChange={(e) => onUpdateFilters({ ...filters, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All roles</option>
              {roleOptions.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-500">Total Users</div>
            <div className="text-2xl font-bold text-gray-900">{displayUsers.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-500">Administrators</div>
            <div className="text-2xl font-bold text-red-600">{displayUsers.filter((u: User) => u.role === 'admin').length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-500">Staff Members</div>
            <div className="text-2xl font-bold text-blue-600">{displayUsers.filter((u: User) => u.role === 'staff').length}</div>
          </div>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="firstName">User Name</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="email">Email</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="role">Role</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <p>No users found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {(filters.search || filters.role !== "all" || filters.status !== "all")
                          ? "Try modifying your search filters"
                          : "Start by adding some users"
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayUsers.map((user: User) => {
                  const roleConfig = getRoleConfig(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {renderCell(user.username)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {renderCell(user.email)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <select
                          value={user.role}
                          onChange={(e) => onUpdateRole(user.id, e.target.value as UserRole)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer ${
                            roleConfig?.color === 'red' ? 'bg-red-100 text-red-800 focus:ring-red-500' :
                            roleConfig?.color === 'blue' ? 'bg-blue-100 text-blue-800 focus:ring-blue-500' :
                            'bg-green-100 text-green-800 focus:ring-green-500'
                          }`}
                        >
                          {roleOptions.map(role => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 transition-colors cursor-pointer"
                            title="Delete user"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
