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
    exportContacts(filteredContacts, format);
  };

  const stats = {
    total: contacts.length,
    interested: contacts.filter(c => c.isInterested).length,
    notInterested: contacts.filter(c => !c.isInterested).length,
    maleCount: contacts.filter(c => c.gender === 'male').length,
    femaleCount: contacts.filter(c => c.gender === 'female').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Modern Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-2">
            {/* Icon moderne */}
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Contact Management</h1>
              <p className="text-sm sm:text-base text-gray-600">
                💼 Centralized database with smart analytics
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Mobile First Design */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Total Contacts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Total</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                <div className="w-8 h-1 bg-blue-200 rounded-full mx-auto">
                  <div className="h-1 bg-blue-500 rounded-full" style={{width: '100%'}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Interested Contacts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Interested</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.interested}</p>
                <div className="w-8 h-1 bg-emerald-200 rounded-full mx-auto">
                  <div className="h-1 bg-emerald-500 rounded-full" style={{width: `${(stats.interested / stats.total) * 100}%`}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Not Interested */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Not Interested</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.notInterested}</p>
                <div className="w-8 h-1 bg-red-200 rounded-full mx-auto">
                  <div className="h-1 bg-red-500 rounded-full" style={{width: `${(stats.notInterested / stats.total) * 100}%`}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Male Count */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Male</p>
                <p className="text-xl sm:text-2xl font-bold text-violet-600">{stats.maleCount}</p>
                <div className="w-8 h-1 bg-violet-200 rounded-full mx-auto">
                  <div className="h-1 bg-violet-500 rounded-full" style={{width: `${(stats.maleCount / stats.total) * 100}%`}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Female Count */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Female</p>
                <p className="text-xl sm:text-2xl font-bold text-pink-600">{stats.femaleCount}</p>
                <div className="w-8 h-1 bg-pink-200 rounded-full mx-auto">
                  <div className="h-1 bg-pink-500 rounded-full" style={{width: `${(stats.femaleCount / stats.total) * 100}%`}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Contact Database</h2>
                <p className="text-sm text-gray-500 mt-1">
                  📊 Manage all contacts with inline editing
                </p>
              </div>
              
              {/* Action Buttons - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  onClick={() => setShowExportDialog(true)}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl px-4 py-2.5 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center min-h-[44px] font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">Smart Export</span>
                  <span className="sm:hidden">Export</span>
                </Button>
                
                <AddContactDialog
                  onAddContact={addContact}
                  trigger={
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl px-4 py-2.5 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center min-h-[44px] font-medium">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="hidden sm:inline">Add Contact</span>
                      <span className="sm:hidden">Add</span>
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

          <div className="p-4 sm:p-6">
            {/* Mobile-friendly tip section */}
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Quick Edit Tips</p>
                  <p className="text-xs text-blue-700">
                    � <strong>Mobile:</strong> Tap any cell to edit • 
                    💻 <strong>Desktop:</strong> Click to edit • 
                    ⚡ Changes save automatically
                  </p>
                </div>
              </div>
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
