import React, { useEffect, useState, useCallback } from 'react'
import DebouncedPaginatedSearch from '~/components/DebouncedPaginatedSearch'
import SelectedContactsBadges from '~/components/SelectedContactsBadges'
import TemplateSelector from '~/components/TemplateSelector';
import { apiService, type ContactSummary } from '~/lib/api';
import { Card, CardContent } from '~/components/ui/card';
import { ErrorAlert } from '~/components/ui/ErrorAlert';

// Updated interface to match ContactSummary from API
interface ContactItem {
  name: string;  // Full name (first_name + last_name)
  key: string;   // Contact ID
}

// Helper function to convert ContactSummary to ContactItem
const contactToItem = (contact: ContactSummary): ContactItem => {
  if (!contact || !contact.id) {
    console.warn('Invalid contact object:', contact);
    return {
      name: 'Unknown Contact',
      key: 'unknown-' + Math.random(),
    };
  }
  
  return {
    name: `${contact.firstName || 'Unknown'} ${contact.lastName || 'Contact'}`,
    key: contact.id,
  };
};

export default function BulkMessaging() {
  const [items, setItems] = useState<ContactItem[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all contacts on component mount
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true);
        setError(null);
        const contacts = await apiService.getContacts();
        // Handle the case where contacts might be undefined or null
        const contactItems = (contacts || []).map(contactToItem);
        setItems(contactItems);
        
        if (contactItems.length === 0) {
          console.error('No contacts found in database');
        }
      } catch (err) {
        console.error('Failed to load contacts:', err);
        setError('Failed to load contacts. Please try again.');
        setItems([]); // Ensure items is always an array
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const contacts = await apiService.searchContacts(query);
      // Handle the case where contacts might be undefined or null
      const contactItems = (contacts || []).map(contactToItem);
      setItems(contactItems);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
      setItems([]); // Ensure items is always an empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  const handleContactSelect = useCallback((key: string) => {
    setSelectedContacts(prev => {
      // Check if contact is already selected
      if (prev.some(contact => contact.key === key)) {
        return prev; // No change if already selected
      }
      const selectedItem = items.find(item => item.key === key);
      if (selectedItem) {
        return [...prev, selectedItem];
      }
      return prev;
    });
  }, [items]);

  const handleRemoveContact = useCallback((key: string) => {
    setSelectedContacts(prev => prev.filter(contact => contact.key !== key));
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedContacts([]);
  }, []);


  return (
    <main className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bulk Messaging</h1>
        <p className="text-gray-600">Search and select contacts for bulk messaging</p>
      </div>

      {error && <ErrorAlert message={error} className="mb-4" />}

      {loading && (
        <Card className="mb-4">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading contacts...</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && items.length === 0 && (
        <Card className="mb-4">
          <CardContent className="text-center py-8">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts available</h3>
              <p className="text-gray-600">
                No contacts were found in the database. Please add some contacts first before attempting bulk messaging.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-4">
        <SelectedContactsBadges
          selectedContacts={selectedContacts}
          onRemoveContact={handleRemoveContact}
          onClearAll={handleClearAll}
        />
      </div>

      <div className="mb-6">
        <DebouncedPaginatedSearch 
          items={items.map(({ key, name }) => [key, name])} 
          onSearch={handleSearch} 
          onSelect={handleContactSelect}
          selectedItems={selectedContacts.map(contact => contact.key)}
        />
      </div>
      
      {selectedContacts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            <p>Please select contacts above to send template messages.</p>
          </CardContent>
        </Card>
      ) : (
        <TemplateSelector selectedContacts={selectedContacts} />
      )}
    </main>
  )
}