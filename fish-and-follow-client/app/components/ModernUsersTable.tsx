import { useState, useMemo } from "react";
import type { User, UserRole } from "~/lib/userStore";

const roleOptions = [
  { value: "admin" as const, label: "Administrator" },
  { value: "staff" as const, label: "Staff Member" },
];

interface UsersTableProps {
  users: User[];
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onUpdateRole: (id: string, role: UserRole) => void;
}

interface EditingUser {
  id: string;
  field: string;
}

export function ModernUsersTable({ 
  users, 
  onUpdateUser, 
  onDeleteUser, 
  onToggleStatus, 
  onUpdateRole, 
}: UsersTableProps) {
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // Filtrage et tri
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = filterRole === "all" || user.role === filterRole;
      const matchesStatus = filterStatus === "all" || 
        (filterStatus === "active" && user.isActive) ||
        (filterStatus === "inactive" && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

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

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[#A0E9FF]/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-[#CDF5FD] rounded-lg focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as UserRole | "all")}
              className="w-full px-4 py-2 border border-[#CDF5FD] rounded-lg focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent"
            >
              <option value="all">All Roles</option>
              {roleOptions.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
              className="w-full px-4 py-2 border border-[#CDF5FD] rounded-lg focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-[#A0E9FF]/30 p-6 hover:shadow-md transition-all duration-300">
            {/* User Avatar and Basic Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00A9FF] to-[#89CFF3] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {editingUser?.id === user.id && editingUser?.field === 'firstName' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="text-sm px-2 py-1 border rounded focus:ring-1 focus:ring-[#00A9FF]"
                        onBlur={handleSave}
                        onKeyDown={(e) => e.key === 'Enter' ? handleSave() : e.key === 'Escape' ? handleCancel() : null}
                        autoFocus
                      />
                    ) : (
                      <span 
                        onClick={() => handleEdit(user.id, 'firstName', user.firstName)}
                        className="cursor-pointer hover:text-[#00A9FF]"
                      >
                        {user.firstName} {user.lastName}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              
              {/* Status Toggle */}
              <button
                onClick={() => onToggleStatus(user.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.isActive)}`}
              >
                {user.isActive ? 'Synchronized' : 'Not Synced'}
              </button>
            </div>

            {/* Last Login */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">Last Login</label>
              <p className="text-sm text-gray-800">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
              </p>
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

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[#CDF5FD] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#89CFF3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
