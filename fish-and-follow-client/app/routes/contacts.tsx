import { useState } from "react";
import type { Route } from "./+types/contacts";
import { ContactsTable } from "../components/ContactsTable";
import { AddContactDialog } from "../components/AddContactDialog";
import { ExportFilterDialog } from "../components/ExportFilterDialog";
import { useContacts } from "~/hooks/useContacts";
import { Button } from "../components/ui/button";
import { StatCard, PageHeader, ContentCard } from "../components/ui";
import type { Contact } from "~/types/contact";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Contacts - Fish and Follow" },
    { name: "description", content: "Manage all your contacts" },
  ];
}

export default function Contacts() {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const { 
    contacts, 
    isLoading,
    isFilterLoading,
    filters,
    updateFilters,
    addContact, 
    exportContacts, 
    updateContact, 
    deleteContact, 
    error 
  } = useContacts();

  const handleExport = (filteredContacts: Contact[], format: 'csv' | 'excel') => {
    // Additional validation before actual export
    if (!filteredContacts || filteredContacts.length === 0) {
      console.warn('⚠️ No contacts to export');
      return;
    }
    
    try {
      console.log(`📊 Exporting ${filteredContacts.length} contacts in ${format} format`);
      exportContacts(filteredContacts, format);
    } catch (error) {
      console.error('❌ Export error in contacts page:', error);
      alert('Failed to export contacts. Please try again.');
    }
  };

  const handleExportClick = () => {
    // Pre-export validation
    if (!contacts || contacts.length === 0) {
      alert('⚠️ No contacts available to export.\n\nAdd some contacts first before exporting.');
      return;
    }
    
    // Check if user has permission to export (you can add more validation here)
    const canExport = true; // Add your permission logic here
    
    if (!canExport) {
      alert('❌ You don\'t have permission to export contacts.');
      return;
    }
    
    console.log('🚀 Opening export dialog with', contacts.length, 'contacts');
    setShowExportDialog(true);
  };

  const stats = {
    total: contacts.length,
    interested: contacts.filter(c => c.isInterested).length,
    notInterested: contacts.filter(c => !c.isInterested).length,
    maleCount: contacts.filter(c => c.gender === 'male').length,
    femaleCount: contacts.filter(c => c.gender === 'female').length,
  };

  return (
    <div className="min-h-screen app-bg py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <PageHeader 
          title="Contact Management"
          subtitle="Manage all your contacts with inline editing and quick add"
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total Contacts"
            value={stats.total}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            gradientFrom="brand-primary"
            gradientTo="brand-secondary"
          />

          <StatCard
            title="Interested"
            value={stats.interested}
            subtitle={`${stats.total > 0 ? Math.round((stats.interested / stats.total) * 100) : 0}% of total`}
            icon={
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            }
            gradientFrom="brand-secondary"
            gradientTo="brand-accent"
            textColor="text-gray-800"
          />

          <StatCard
            title="Not Interested"
            value={stats.notInterested}
            subtitle={`${stats.total > 0 ? Math.round((stats.notInterested / stats.total) * 100) : 0}% of total`}
            icon={
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            }
            gradientFrom="brand-accent"
            gradientTo="brand-light"
            textColor="text-gray-800"
          />

          <StatCard
            title="Male"
            value={stats.maleCount}
            subtitle={`${stats.total > 0 ? Math.round((stats.maleCount / stats.total) * 100) : 0}% of total`}
            icon={
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            }
            gradientFrom="brand-light"
            gradientTo="brand-secondary"
            textColor="text-gray-800"
          />

          <StatCard
            title="Female"
            value={stats.femaleCount}
            subtitle={`${stats.total > 0 ? Math.round((stats.femaleCount / stats.total) * 100) : 0}% of total`}
            icon={
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            }
            gradientFrom="brand-secondary"
            gradientTo="brand-primary"
            textColor="text-gray-800"
          />
        </div>

        {/* Main Content */}
        <ContentCard blur={true} padding="none">
          <div className="px-6 py-4 border-b border-[#A0E9FF]/20">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-medium text-gray-800">Contact List</h2>
                <p className="text-sm text-gray-600 mt-1">
                  All your contacts with inline editing capability
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleExportClick}
                  className="bg-gradient-to-r hover:bg-gradient-to-l transition-all duration-300"
                  style={{
                    background: 'linear-gradient(to right, var(--brand-warning), #f97316)',
                    color: 'white'
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Smart Export
                </Button>
                <AddContactDialog
                  onAddContact={addContact}
                  trigger={
                    <Button 
                      className="text-white border-0"
                      style={{
                        background: 'linear-gradient(to right, var(--brand-primary), var(--brand-secondary))'
                      }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Contact
                    </Button>
                  }
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="p-6">
            <div className="mb-4 p-4 bg-gradient-to-r from-[#A0E9FF]/20 to-[#CDF5FD]/30 rounded-xl border border-[#89CFF3]/30">
              <p className="text-sm text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-2 text-[var(--brand-primary)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <strong>Tip:</strong> Click on any cell to edit inline. Changes are saved automatically.
              </p>
            </div>

            <ContactsTable
              contacts={contacts}
              isLoading={isLoading}
              isFilterLoading={isFilterLoading}
              filters={filters}
              onUpdateFilters={updateFilters}
              onUpdateContact={updateContact}
              onDeleteContact={deleteContact}
            />
          </div>
        </ContentCard>

        {/* Export Filter Dialog */}
        {showExportDialog && (
          <ExportFilterDialog
            contacts={contacts}
            onExport={handleExport}
            onClose={() => setShowExportDialog(false)}
          />
        )}
      </div>
    </div>
  );
}
