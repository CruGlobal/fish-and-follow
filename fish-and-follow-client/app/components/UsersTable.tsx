import { useState, useMemo } from "react";
import type { User, UserRole } from "~/types/user"

interface EditingUser {
  id: string;
  field: string;
}


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
    color: "gradient"
  },
  { 
    value: "staff", 
    label: "Staff Member", 
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
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");

  // Enhanced filtering with search, role, and status
  const displayUsers = useMemo(() => {
    let filtered = users;

    // Apply server-side filters if available, otherwise use client-side
    if (!filters?.search) {
      // Client-side search if no server-side search
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(user => 
          user.username?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
        );
      }
    }

    // Client-side role filtering
    if (filters?.role && filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Sort users
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === bValue) return 0;
      
      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [users, filters, sortField, sortDirection]);

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleEdit = (userId: string, field: string, currentValue: string) => {
    setEditingUser({ id: userId, field });
    setEditValue(currentValue);
  };

  const handleSave = () => {
    if (!editingUser) return;
    
    const updates: Partial<User> = {
      [editingUser.field]: editValue
    };
    
    onUpdateUser(editingUser.id, updates);
    setEditingUser(null);
    setEditValue("");
  };

  const handleCancel = () => {
    setEditingUser(null);
    setEditValue("");
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-[#00A9FF] to-[#89CFF3] text-white';
      case 'staff':
        return 'bg-gradient-to-r from-[#89CFF3] to-[#A0E9FF] text-white';
      default:
        return 'bg-[#CDF5FD] text-[#00A9FF]';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-700 border-green-200' 
      : 'bg-red-100 text-red-700 border-red-200';
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

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayUsers.map((user: User) => (
        <div key={user.id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-[#A0E9FF]/30 p-6 hover:shadow-md transition-all duration-300">
          {/* User Avatar and Basic Info */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00A9FF] to-[#89CFF3] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {user.username?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {editingUser?.id === user.id && editingUser?.field === 'username' ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="text-sm px-2 py-1 border border-[#CDF5FD] rounded focus:ring-1 focus:ring-[#00A9FF]"
                      onBlur={handleSave}
                      onKeyDown={(e) => e.key === 'Enter' ? handleSave() : e.key === 'Escape' ? handleCancel() : null}
                      autoFocus
                    />
                  ) : (
                    <span 
                      onClick={() => handleEdit(user.id, 'username', user.username || '')}
                      className="cursor-pointer hover:text-[#00A9FF]"
                    >
                      {user.username}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  {editingUser?.id === user.id && editingUser?.field === 'email' ? (
                    <input
                      type="email"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="text-sm px-2 py-1 border border-[#CDF5FD] rounded focus:ring-1 focus:ring-[#00A9FF] w-full"
                      onBlur={handleSave}
                      onKeyDown={(e) => e.key === 'Enter' ? handleSave() : e.key === 'Escape' ? handleCancel() : null}
                      autoFocus
                    />
                  ) : (
                    <span 
                      onClick={() => handleEdit(user.id, 'email', user.email || '')}
                      className="cursor-pointer hover:text-[#00A9FF]"
                    >
                      {user.email}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Role Badge */}
          <div className="mb-4">
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
              {roleOptions.find(r => r.value === user.role)?.label || user.role}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const newRole: UserRole = user.role === 'admin' ? 'staff' : 'admin';
                onUpdateRole(user.id, newRole);
              }}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-[#89CFF3] to-[#A0E9FF] text-white rounded-lg hover:from-[#00A9FF] hover:to-[#89CFF3] transition-all duration-200 text-sm font-medium"
            >
              Switch Role
            </button>
            
            <button
              onClick={() => onDeleteUser(user.id)}
              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );

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
      {/* Enhanced Filters and Search */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[#A0E9FF]/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-[#CDF5FD] rounded-lg focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent"
                value={filters?.search || ''}
                onChange={(e) => onUpdateFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={filters?.role || 'all'}
              onChange={(e) => onUpdateFilters({ ...filters, role: e.target.value })}
              className="w-full px-3 py-2 border border-[#CDF5FD] rounded-lg focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent cursor-pointer"
            >
              <option value="all">All roles</option>
              {roleOptions.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
            <div className="flex rounded-lg border border-[#CDF5FD] p-1 bg-white">
              <button
                onClick={() => setViewMode("cards")}
                className={`flex-1 px-3 py-1 text-sm font-medium rounded-md transition-all ${
                  viewMode === "cards" 
                    ? "bg-gradient-to-r from-[#00A9FF] to-[#89CFF3] text-white" 
                    : "text-gray-600 hover:text-[#00A9FF]"
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex-1 px-3 py-1 text-sm font-medium rounded-md transition-all ${
                  viewMode === "table" 
                    ? "bg-gradient-to-r from-[#00A9FF] to-[#89CFF3] text-white" 
                    : "text-gray-600 hover:text-[#00A9FF]"
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === "cards" ? renderCardView() : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton field="username">User Name</SortButton>
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
      )}
    </div>
  );
}
