import { useState, useMemo } from "react";
import type { User, UserRole } from "~/lib/userStore";
import { roleOptions /* availablePermissions */ } from "~/lib/userStore"; // Permissions commentées

interface UsersTableProps {
  users: User[];
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onUpdateRole: (id: string, role: UserRole) => void;
  onUpdatePermissions?: (id: string, permissions: string[]) => void; // Permissions optionnelles
}

interface EditingUser {
  id: string;
  field: string;
}

export function UsersTable({ 
  users, 
  onUpdateUser, 
  onDeleteUser, 
  onToggleStatus, 
  onUpdateRole, 
  onUpdatePermissions 
}: UsersTableProps) {
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  // Variables pour les permissions supprimées (commentées)
  // const [selectedUser, setSelectedUser] = useState<User | null>(null);
  // const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [sortField, setSortField] = useState<keyof User>("lastName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filtrage et tri
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
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

    // Tri
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === bValue) return 0;
      
      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [users, searchTerm, filterRole, filterStatus, sortField, sortDirection]);

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const startEditing = (user: User, field: string) => {
    setEditingUser({ id: user.id, field });
    setEditValue(String(user[field as keyof User] || ""));
  };

  const saveEdit = () => {
    if (!editingUser) return;

    onUpdateUser(editingUser.id, {
      [editingUser.field]: editValue,
    });

    setEditingUser(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditValue("");
  };

  const isEditing = (userId: string, field: string) => {
    return editingUser?.id === userId && editingUser?.field === field;
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

  const renderEditableCell = (user: User, field: string, value: any) => {
    if (isEditing(user.id, field)) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveEdit();
            if (e.key === "Escape") cancelEdit();
          }}
          className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      );
    }

    return (
      <span
        className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-2 py-1 rounded transition-colors block w-full"
        onClick={() => startEditing(user, field)}
        title="Cliquer pour éditer"
      >
        {value || "-"}
      </span>
    );
  };

  // Fonctions de gestion des permissions (TOUTES COMMENTÉES - Permissions supprimées)
  /*
  const openPermissionsModal = (user: User) => {
    if (!onUpdatePermissions) return; // Permissions désactivées
    setSelectedUser(user);
    setShowPermissionsModal(true);
  };

  const handlePermissionToggle = (permissionId: string) => {
    if (!selectedUser || !onUpdatePermissions) return; // Vérification si permissions disponibles

    const currentPermissions = selectedUser.permissions;
    const newPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter(p => p !== permissionId)
      : [...currentPermissions, permissionId];

    onUpdatePermissions(selectedUser.id, newPermissions);
    setSelectedUser({ ...selectedUser, permissions: newPermissions });
  };

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, typeof availablePermissions> = {};
    availablePermissions.forEach(permission => {
      if (!groups[permission.category]) {
        groups[permission.category] = [];
      }
      groups[permission.category].push(permission);
    });
    return groups;
  }, []);
  */

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtre par rôle */}
          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as UserRole | "all")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All roles</option>
              {roleOptions.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          {/* Filtre par statut */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{filteredAndSortedUsers.length}</div>
            <div className="text-sm text-gray-500">Total users</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">{filteredAndSortedUsers.filter(u => u.isActive).length}</div>
            <div className="text-sm text-gray-500">Active</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-red-600">{filteredAndSortedUsers.filter(u => u.role === 'admin').length}</div>
            <div className="text-sm text-gray-500">Administrators</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{filteredAndSortedUsers.filter(u => u.role === 'staff').length}</div>
            <div className="text-sm text-gray-500">Staff</div>
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
                  <SortButton field="firstName">First Name</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="lastName">Last Name</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="email">Email</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="role">Role</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="isActive">Status</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="lastLogin">Last Login</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <p>No users found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || filterRole !== "all" || filterStatus !== "all" 
                          ? "Try modifying your search filters"
                          : "Start by adding some users"
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedUsers.map((user) => {
                  const roleConfig = getRoleConfig(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {renderEditableCell(user, "firstName", user.firstName)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {renderEditableCell(user, "lastName", user.lastName)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {renderEditableCell(user, "email", user.email)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <select
                          value={user.role}
                          onChange={(e) => onUpdateRole(user.id, e.target.value as UserRole)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => onToggleStatus(user.id)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            user.isActive ? 'bg-green-400' : 'bg-red-400'
                          }`}></span>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.lastLogin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
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

      {/* Permissions modal removed - no longer needed */}
    </div>
  );
}
