import { useState } from "react";
import type { Route } from "./+types/contacts";
import { ContactsTable } from "../components/ContactsTable";
import { AddContactDialog } from "../components/AddContactDialog";
import { ExportFilterDialog } from "../components/ExportFilterDialog";
import { useContacts } from "../lib/contactStore";
import { Button } from "../components/ui/button";
import type { Contact } from "../lib/contactStore";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Contacts - Fish and Follow" },
    { name: "description", content: "Manage all your contacts" },
  ];
}

export default function Contacts() {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const { contacts, addContact, exportContacts, updateContact, deleteContact, error } = useContacts();

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contact Management</h1>
          <p className="mt-2 text-gray-600">
            Manage all your contacts with inline editing and quick add
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Interested</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.interested}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Not Interested</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.notInterested}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Male</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.maleCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Female</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.femaleCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Contact List</h2>
                <p className="text-sm text-gray-500 mt-1">
                  All your contacts with inline editing capability
                </p>
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={handleExportClick}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Smart Export
                </Button>
                <AddContactDialog
                  onAddContact={addContact}
                  trigger={
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                💡 <strong>Tip:</strong> Click on any cell to edit inline. 
                Changes are saved automatically.
              </p>
            </div>

            <ContactsTable
              contacts={contacts}
              onUpdateContact={updateContact}
              onDeleteContact={deleteContact}
            />
          </div>
        </div>

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
