import { useState, useEffect } from "react";
import { apiService } from "./api";
import { mapApiContactToContact } from "./mappers/contactMappers";
import type { Contact, YearEnum, GenderEnum } from "~/types/contact";

// Hook de gestion des contacts
export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les contacts depuis localStorage au montage
  useEffect(() => {
    // query database for contacts
    setIsLoading(true);
    setError(null);

    apiService.getFullContacts().then(fetchedContacts => {
      // Map API contacts to local Contact interface
      const mappedContacts: Contact[] = fetchedContacts.map(mapApiContactToContact);
      setContacts(mappedContacts);
      setIsLoading(false);
    }).catch(err => {
      console.error("Failed to fetch contacts:", err);
      setError("Failed to fetch contacts");
      setIsLoading(false);
    });

    const savedContacts = localStorage.getItem("contacts");
    if (savedContacts) {
      try {
        setContacts(JSON.parse(savedContacts));
      } catch {
        setContacts([]);
      }
    } else {
      setContacts([]);
    }
  }, []);

  // Sauvegarder les contacts dans localStorage à chaque modification
  useEffect(() => {
    if (contacts.length > 0) {
      localStorage.setItem("contacts", JSON.stringify(contacts));
    }
  }, [contacts]);

  const addContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
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
      const headers = ["First Name", "Last Name", "Email", "Phone", "Campus", "Major", "Year", "Gender", "Follow-up Status", "Notes", "Created At", "Updated At", "Full Name", "Contact Summary"];
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
          contact.followUpStatusNumber || "",
          contact.notes || "",
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
    const headers = ["First Name", "Last Name", "Email", "Phone", "Campus", "Major", "Year", "Gender", "Follow-up Status", "Notes", "Created At"];
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
        contact.followUpStatusNumber || "",
        contact.notes || "",
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