import { useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "../lib/api";
import { mapApiContactToContact } from "../lib/mappers/contactMappers";
import type { Contact, YearEnum, GenderEnum, ContactFormData, NewContactData } from "~/types/contact";

// Hook de gestion des contacts

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    search?: string;
    year?: string;
    gender?: string;
    campus?: string;
    major?: string;
    isInterested?: string;
    followUpStatusNumber?: string;
  }>({});

  // Use ref to track the debounce timeout
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Function to fetch contacts with current filters
  const fetchContacts = useCallback(async (filtersToUse?: typeof filters, isFilterUpdate = false) => {
    // Set appropriate loading state
    if (isFilterUpdate) {
      setIsFilterLoading(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    const currentFilters = filtersToUse || filters;

    try {
      const fetchedContacts = await apiService.getFullContacts(
        currentFilters.search,
        {
          year: currentFilters.year,
          gender: currentFilters.gender,
          campus: currentFilters.campus,
          major: currentFilters.major,
          isInterested: currentFilters.isInterested,
          followUpStatusNumber: currentFilters.followUpStatusNumber,
        }
      );
      const mappedContacts: Contact[] = fetchedContacts.map(mapApiContactToContact);
      setContacts(mappedContacts);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
      setError("Failed to fetch contacts");
    } finally {
      setIsLoading(false);
      setIsFilterLoading(false);
    }
  }, [filters]);

  // Debounced fetch function for filter updates
  const debouncedFetchContacts = useCallback((filtersToUse: typeof filters) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      fetchContacts(filtersToUse, true); // Pass true to indicate this is a filter update
    }, 300); // 300ms debounce delay
  }, [fetchContacts]);

  // Fetch contacts from API on mount
  useEffect(() => {
    fetchContacts();
  }, []); // Empty dependency array for initial load only

  // Update filters and fetch new data with debouncing
  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Use debounced fetch for filter updates to prevent excessive API calls
    debouncedFetchContacts(updatedFilters);
  }, [filters, debouncedFetchContacts]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const addContact = async (contactData: ContactFormData) => {
    try {
      setIsLoading(true);
      const newContact = await apiService.submitContact(contactData);
      setContacts(prev => [...prev, newContact]);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to add contact");
      setIsLoading(false);
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      setIsLoading(true);
      const updatedContact = await apiService.updateContact(id, updates);
      setContacts(prev =>
        prev.map(contact =>
          contact.id === id ? updatedContact : contact
        )
      );
      setError(null);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to update contact");
      setIsLoading(false);
    }
  };

  const deleteContact = async (id: string) => {
    try {
      setIsLoading(true);
      await apiService.deleteContact(id);
      setContacts(prev => prev.filter(contact => contact.id !== id));
      setError(null);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to delete contact");
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  const importContacts = async (contactsData: NewContactData[]) => {
    try {
      setIsLoading(true);
      const importedContacts: Contact[] = [];
      
      for (const contactData of contactsData) {
        try {
          const newContact = await apiService.submitContact(contactData);
          importedContacts.push(newContact);
        } catch (err) {
          console.error(`Failed to import contact ${contactData.firstName} ${contactData.lastName}:`, err);
          // Continue with other contacts even if one fails
        }
      }
      
      setContacts(prev => [...prev, ...importedContacts]);
      setError(null);
      setIsLoading(false);
      return importedContacts.length; // Return number of successfully imported contacts
    } catch (err) {
      setError("Failed to import contacts");
      setIsLoading(false);
      throw err;
    }
  };

  const exportContacts = (contactsToExport?: Contact[], format: 'csv' | 'excel' = 'csv') => {
    // Allow followUpStatusDescription for export
    type ExportContact = Contact & { followUpStatusDescription?: string };
    const contactsData: ExportContact[] = (contactsToExport || contacts) as ExportContact[];

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
      const headers = [
        "First Name", "Last Name", "Email", "Phone", "Campus", "Major", "Year", "Gender", "Interested", "Follow-up Status", "Follow-up Status Description", "Notes", "Created At", "Updated At", "Full Name", "Contact Summary"
      ];
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
          contact.followUpStatusNumber,
          contact.followUpStatusDescription || "",
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
    const headers = [
      "First Name", "Last Name", "Email", "Phone", "Campus", "Major", "Year", "Gender", "Interested", "Follow-up Status", "Follow-up Status Description", "Notes", "Created At"
    ];
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
        contact.followUpStatusNumber,
        contact.followUpStatusDescription || "",
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
    isFilterLoading,
    error,
    filters,
    updateFilters,
    addContact,
    updateContact,
    deleteContact,
    clearError,
    importContacts,
    exportContacts,
  };
}
