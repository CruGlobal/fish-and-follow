import { useState, useMemo } from "react";
import type { Contact, YearEnum, GenderEnum } from "~/types/contact";
import { yearOptions, genderOptions } from "~/types/contact";
import { useFollowUpStatuses, getStatusDescription } from "~/hooks/useFollowUpStatuses";
import { NotesDisplay } from "./NotesDisplay";

interface ContactsTableProps {
  contacts: Contact[];
  isLoading?: boolean;
  isFilterLoading?: boolean;
  filters?: {
    search?: string;
    year?: string;
    gender?: string;
    campus?: string;
    major?: string;
    isInterested?: string;
    followUpStatusNumber?: string;
  };
  onUpdateFilters?: (filters: any) => void;
  onUpdateContact: (id: string, updates: Partial<Contact>) => void;
  onDeleteContact: (id: string) => void;
}

interface EditingContact {
  id: string;
  field: keyof Contact;
}

export function ContactsTable({ 
  contacts, 
  isLoading = false, 
  isFilterLoading = false,
  filters = {}, 
  onUpdateFilters, 
  onUpdateContact, 
  onDeleteContact 
}: ContactsTableProps) {
  const { statuses: followUpStatuses } = useFollowUpStatuses();
  const [editingContact, setEditingContact] = useState<EditingContact | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [sortField, setSortField] = useState<keyof Contact>("lastName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Use server-side filters from props instead of local state
  const filterGender = filters.gender || "all";
  const filterYear = filters.year || "all";
  const filterInterested = filters.isInterested || "all";
  const filterFollowUpStatus = filters.followUpStatusNumber || "all";
  const searchQuery = filters.search || "";

  // Since we're using server-side filtering, we don't need the useServerSearch hook
  // The parent component handles all server communication
  const contactsToDisplay = contacts;

  // For server-side filtering, we just need to sort the contacts that come from the server
  // All filtering is handled server-side by the parent component
  const filteredAndSortedContacts = useMemo(() => {
    let sorted = [...contactsToDisplay];

    // Only sort locally, filtering is done server-side
    sorted.sort((a, b) => {
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

    return sorted;
  }, [contactsToDisplay, sortField, sortDirection]);

  const handleSort = (field: keyof Contact) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const startEditing = (contact: Contact, field: keyof Contact) => {
    setEditingContact({ id: contact.id, field });
    setEditValue(String(contact[field] || ""));
  };

  const saveEdit = () => {
    if (!editingContact) return;

    let value: any = editValue;
    
    // Conversion des valeurs
    if (editingContact.field === "followUpStatusNumber") {
      value = parseInt(editValue);
    }
    
    if (editingContact.field === "isInterested") {
      value = editValue === "true";
    }

    onUpdateContact(editingContact.id, {
      [editingContact.field]: value,
    });

    setEditingContact(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingContact(null);
    setEditValue("");
  };

  const handleDeleteContact = (contact: Contact) => {
    if (window.confirm(`Are you sure you want to delete the contact ${contact.firstName} ${contact.lastName}?`)) {
      onDeleteContact(contact.id);
    }
  };

  const isEditing = (contactId: string, field: keyof Contact) => {
    return editingContact?.id === contactId && editingContact?.field === field;
  };

  const SortButton = ({ field, children }: { field: keyof Contact; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
    >
      <span>{children}</span>
      <div className="flex flex-col">
        <svg
          className={`w-3 h-3 ${
            sortField === field && sortDirection === "asc" ? "text-blue-600" : "text-gray-400"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M5 10l3-3 3 3H5z" />
        </svg>
        <svg
          className={`w-3 h-3 ${
            sortField === field && sortDirection === "desc" ? "text-blue-600" : "text-gray-400"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M15 10l-3 3-3-3h6z" />
        </svg>
      </div>
    </button>
  );

  const renderEditableCell = (contact: Contact, field: keyof Contact, value: any) => {
    if (isEditing(contact.id, field)) {
      // Gestion spéciale pour les champs select
      if (field === "year") {
        return (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") cancelEdit();
            }}
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
            autoFocus
          >
            {Object.entries(yearOptions).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        );
      }

      if (field === "gender") {
        return (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") cancelEdit();
            }}
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
            autoFocus
          >
            {Object.entries(genderOptions).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        );
      }

      if (field === "followUpStatusNumber") {
        return (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") cancelEdit();
            }}
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          >
            {followUpStatuses.map(status => (
              <option key={status.number} value={status.number}>
                {status.description}
              </option>
            ))}
          </select>
        );
      }

      if (field === "isInterested") {
        return (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") cancelEdit();
            }}
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
            autoFocus
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
      }

      // Champ texte normal
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
          className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
          autoFocus
        />
      );
    }

    // Affichage normal
    const displayValue = (() => {
      if (field === "followUpStatusNumber") return getStatusDescription(followUpStatuses, value as number);
      if (field === "isInterested") return value ? "Yes" : "No";
      if (field === "year") return yearOptions[value as YearEnum] || value;
      if (field === "gender") return genderOptions[value as GenderEnum] || value;
      return value || "-";
    })();

    return (
      <button
        onClick={() => startEditing(contact, field)}
        className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded transition-colors"
      >
        {displayValue}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-700">Filters</h3>
            {isFilterLoading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-xs text-gray-500">Updating...</span>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Recherche */}
          <div className="lg:col-span-2">
            <div className="relative">
              {isFilterLoading ? (
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              <input
                type="text"
                placeholder="Search by name, email, phone, campus..."
                value={searchQuery}
                onChange={(e) => onUpdateFilters?.({ ...filters, search: e.target.value })}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => onUpdateFilters?.({ ...filters, search: "" })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filtre par genre */}
          <div>
            <select
              value={filterGender}
              onChange={(e) => onUpdateFilters?.({ ...filters, gender: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All genders</option>
              {Object.entries(genderOptions).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Filtre par année */}
          <div>
            <select
              value={filterYear}
              onChange={(e) => onUpdateFilters?.({ ...filters, year: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All years</option>
              {Object.entries(yearOptions).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Filtre par intérêt */}
          <div>
            <select
              value={filterInterested}
              onChange={(e) => onUpdateFilters?.({ ...filters, isInterested: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Interest Level</option>
              <option value="true">Interested</option>
              <option value="false">Not interested</option>
            </select>
          </div>

          {/* Filtre par statut de suivi */}
          <div>
            <select
              value={filterFollowUpStatus}
              onChange={(e) => onUpdateFilters?.({ ...filters, followUpStatusNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All statuses</option>
              {followUpStatuses.map(status => (
                <option key={status.number} value={status.number.toString()}>
                  {status.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Total: <strong>{filteredAndSortedContacts.length}</strong></span>
          {searchQuery && (
            <span className="text-blue-600">
              🔍 Search results for: "<strong>{searchQuery}</strong>"
            </span>
          )}
          <span>Male: <strong>{filteredAndSortedContacts.filter(c => c.gender === 'male').length}</strong></span>
          <span>Female: <strong>{filteredAndSortedContacts.filter(c => c.gender === 'female').length}</strong></span>
          <span>Interested: <strong>{filteredAndSortedContacts.filter(c => c.isInterested === true).length}</strong></span>
          <span>Not Interested: <strong>{filteredAndSortedContacts.filter(c => c.isInterested === false).length}</strong></span>
          {followUpStatuses.map(status => (
            <span key={status.number}>
              {status.description}: <strong>{filteredAndSortedContacts.filter(c => c.followUpStatusNumber === status.number).length}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* Tableau */}
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
                  <SortButton field="phoneNumber">Phone</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="email">Email</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="campus">Campus</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="major">Major</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="year">Year</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="gender">Gender</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="isInterested">Interested</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="followUpStatusNumber">Follow-up Status</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedContacts.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p>No contacts found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchQuery || filterGender !== "all" || filterYear !== "all" || filterFollowUpStatus !== "all" 
                          ? "Try adjusting your search filters"
                          : "Start by adding some contacts"
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderEditableCell(contact, "firstName", contact.firstName)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderEditableCell(contact, "lastName", contact.lastName)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderEditableCell(contact, "phoneNumber", contact.phoneNumber)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderEditableCell(contact, "email", contact.email)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderEditableCell(contact, "campus", contact.campus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderEditableCell(contact, "major", contact.major)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderEditableCell(contact, "year", contact.year)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderEditableCell(contact, "gender", contact.gender)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderEditableCell(contact, "isInterested", contact.isInterested)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        {renderEditableCell(contact, "followUpStatusNumber", contact.followUpStatusNumber)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <NotesDisplay 
                        notes={contact.notes} 
                        contactName={`${contact.firstName} ${contact.lastName}`}
                        maxPreviewLength={40}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteContact(contact)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete contact"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
