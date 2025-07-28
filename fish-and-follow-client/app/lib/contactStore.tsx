import { useState, useEffect } from "react";

// Types basés sur votre schéma de base de données
export type YearEnum = "1" | "2" | "3" | "4" | "5" | "Master" | "PhD";
export type GenderEnum = "male" | "female" | "other" | "prefer_not_to_say";

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string; // facultatif
  campus: string;
  major: string;
  year: YearEnum;
  isInterested: boolean;
  gender: GenderEnum;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewContactData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  campus: string;
  major: string;
  year: YearEnum;
  isInterested: boolean;
  gender: GenderEnum;
}

// Sample data for testing
const mockContacts: Contact[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    phoneNumber: "+1234567890",
    email: "john.smith@email.com",
    campus: "Paris",
    major: "Computer Science",
    year: "3",
    isInterested: true,
    gender: "male",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "2",
    firstName: "Maria",
    lastName: "Garcia",
    phoneNumber: "+33987654321",
    email: "maria.garcia@email.com",
    campus: "Lyon",
    major: "Marketing",
    year: "2",
    isInterested: false,
    gender: "female",
    createdAt: "2025-01-14T14:30:00Z",
    updatedAt: "2025-01-14T14:30:00Z",
  },
  {
    id: "3",
    firstName: "Ahmed",
    lastName: "Hassan",
    phoneNumber: "+33555123456",
    campus: "Marseille",
    major: "Engineering",
    year: "4",
    isInterested: true,
    gender: "male",
    createdAt: "2025-01-13T09:15:00Z",
    updatedAt: "2025-01-13T09:15:00Z",
  },
];

// Hook de gestion des contacts
export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les contacts depuis localStorage au montage
  useEffect(() => {
    const savedContacts = localStorage.getItem("contacts");
    if (savedContacts) {
      try {
        setContacts(JSON.parse(savedContacts));
      } catch {
        setContacts(mockContacts);
      }
    } else {
      setContacts(mockContacts);
    }
  }, []);

  // Sauvegarder les contacts dans localStorage à chaque modification
  useEffect(() => {
    if (contacts.length > 0) {
      localStorage.setItem("contacts", JSON.stringify(contacts));
    }
  }, [contacts]);

  const addContact = (contactData: NewContactData) => {
    try {
      const newContact: Contact = {
        ...contactData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setContacts(prev => [...prev, newContact]);
      setError(null);
    } catch (err) {
      setError("Failed to add contact");
    }
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    try {
      setContacts(prev =>
        prev.map(contact =>
          contact.id === id
            ? { ...contact, ...updates, updatedAt: new Date().toISOString() }
            : contact
        )
      );
      setError(null);
    } catch (err) {
      setError("Failed to update contact");
    }
  };

  const deleteContact = (id: string) => {
    try {
      setContacts(prev => prev.filter(contact => contact.id !== id));
      setError(null);
    } catch (err) {
      setError("Failed to delete contact");
    }
  };

  const clearError = () => setError(null);

  const exportContacts = (contactsToExport?: Contact[], format: 'csv' | 'excel' = 'csv') => {
    const contactsData = contactsToExport || contacts;
    
    if (contactsData.length === 0) {
      alert("No contacts to export");
      return;
    }

    const formatDate = (dateString?: string) => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString();
    };

    if (format === 'excel') {
      // Excel-like CSV with enhanced formatting
      const headers = ["First Name", "Last Name", "Email", "Phone", "Campus", "Major", "Year", "Gender", "Interested", "Created At", "Updated At", "Full Name", "Contact Summary"];
      const csvContent = [
        headers.join(","),
        ...contactsData.map(contact => [
          contact.firstName,
          contact.lastName,
          contact.email || "",
          contact.phoneNumber,
          contact.campus,
          contact.major,
          contact.year,
          contact.gender,
          contact.isInterested ? "Yes" : "No",
          formatDate(contact.createdAt),
          formatDate(contact.updatedAt),
          `${contact.firstName} ${contact.lastName}`,
          `${contact.firstName} ${contact.lastName} - ${contact.campus} - ${contact.major} (Year ${contact.year})`
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `contacts_export_enhanced_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    // Standard CSV Export (default)
    const headers = ["First Name", "Last Name", "Email", "Phone", "Campus", "Major", "Year", "Gender", "Interested", "Created At"];
    const csvContent = [
      headers.join(","),
      ...contactsData.map(contact => [
        contact.firstName,
        contact.lastName,
        contact.email || "",
        contact.phoneNumber,
        contact.campus,
        contact.major,
        contact.year,
        contact.gender,
        contact.isInterested ? "Yes" : "No",
        formatDate(contact.createdAt)
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `contacts_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    contacts,
    isLoading,
    error,
    addContact,
    updateContact,
    deleteContact,
    clearError,
    exportContacts,
  };
}

// Options for dropdowns
export const yearOptions: { value: YearEnum; label: string }[] = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
  { value: "5", label: "5th Year" },
  { value: "Master", label: "Master's" },
  { value: "PhD", label: "PhD" },
];

export const genderOptions: { value: GenderEnum; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];
