import { useState, useMemo } from "react";
import type { Contact, YearEnum, GenderEnum } from "~/lib/contactStore";
import { yearOptions, genderOptions } from "~/lib/contactStore";

interface ContactsTableProps {
  contacts: Contact[];
  onUpdateContact: (id: string, updates: Partial<Contact>) => void;
  onDeleteContact: (id: string) => void;
}

interface EditingContact {
  id: string;
  field: keyof Contact;
}

export function ContactsTable({ contacts, onUpdateContact, onDeleteContact }: ContactsTableProps) {
  const [editingContact, setEditingContact] = useState<EditingContact | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Contact>("lastName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterGender, setFilterGender] = useState<GenderEnum | "all">("all");
  const [filterYear, setFilterYear] = useState<YearEnum | "all">("all");
  const [filterInterested, setFilterInterested] = useState<"all" | "true" | "false">("all");

  // Filtrage et tri des contacts
  const filteredAndSortedContacts = useMemo(() => {
    let filtered = contacts.filter(contact => {
      const matchesSearch = 
        contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phoneNumber.includes(searchTerm) ||
        contact.campus.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.major.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGender = filterGender === "all" || contact.gender === filterGender;
      const matchesYear = filterYear === "all" || contact.year === filterYear;
      const matchesInterested = filterInterested === "all" || 
        (filterInterested === "true" && contact.isInterested) ||
        (filterInterested === "false" && !contact.isInterested);

      return matchesSearch && matchesGender && matchesYear && matchesInterested;
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
  }, [contacts, searchTerm, sortField, sortDirection, filterGender, filterYear, filterInterested]);

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
    
    // Conversion des valeurs booléennes
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
          className={`w-3 h-3 ${sortField === field && sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
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
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          >
            {yearOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
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
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          >
            {genderOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
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
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          >
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>
        );
      }

      // Champs texte standard
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

    // Affichage normal
    const displayValue = (() => {
      if (field === "isInterested") return value ? "Oui" : "Non";
      if (field === "year") return yearOptions.find(opt => opt.value === value)?.label || value;
      if (field === "gender") return genderOptions.find(opt => opt.value === value)?.label || value;
      return value || "-";
    })();

    return (
      <span
        className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-2 py-1 rounded transition-colors block w-full"
        onClick={() => startEditing(contact, field)}
        title="Cliquer pour éditer"
      >
        {displayValue}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Recherche */}
          <div className="lg:col-span-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, email, phone, campus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtre par genre */}
          <div>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value as GenderEnum | "all")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All genders</option>
              {genderOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Filtre par année */}
          <div>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value as YearEnum | "all")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All years</option>
              {yearOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Filtre par intérêt */}
          <div>
            <select
              value={filterInterested}
              onChange={(e) => setFilterInterested(e.target.value as "all" | "true" | "false")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="true">Interested</option>
              <option value="false">Not interested</option>
            </select>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Total: <strong>{filteredAndSortedContacts.length}</strong></span>
          <span>Interested: <strong>{filteredAndSortedContacts.filter(c => c.isInterested).length}</strong></span>
          <span>Hommes: <strong>{filteredAndSortedContacts.filter(c => c.gender === 'male').length}</strong></span>
          <span>Femmes: <strong>{filteredAndSortedContacts.filter(c => c.gender === 'female').length}</strong></span>
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
                  <SortButton field="phoneNumber">Téléphone</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="email">Email</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="campus">Campus</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="major">Filière</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="year">Year</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="gender">Genre</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="isInterested">Intéressé</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedContacts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p>Aucun contact trouvé</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || filterGender !== "all" || filterYear !== "all" || filterInterested !== "all" 
                          ? "Essayez de modifier vos filtres de recherche"
                          : "Commencez par ajouter des contacts"
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
                      <div className="flex items-center">
                        {renderEditableCell(contact, "isInterested", contact.isInterested)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteContact(contact)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Supprimer le contact"
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
