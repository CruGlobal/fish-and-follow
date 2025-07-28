import { useState } from "react";
import type { Contact, YearEnum, GenderEnum } from "~/lib/contactStore";
import { yearOptions, genderOptions } from "~/lib/contactStore";
import { Button } from "./ui/button";

interface FilterCriteria {
  campus: string[];
  major: string[];
  year: YearEnum[];
  gender: GenderEnum[];
  isInterested: "all" | "true" | "false";
  dateRange: {
    from: string;
    to: string;
  };
  searchTerm: string;
  advancedFilters: {
    hasEmail: "all" | "true" | "false";
    emailDomain: string;
    phonePrefix: string;
  };
}

interface ExportFilterDialogProps {
  contacts: Contact[];
  onExport: (filteredContacts: Contact[], format: 'csv' | 'excel') => void;
  onClose: () => void;
}

export function ExportFilterDialog({ contacts, onExport, onClose }: ExportFilterDialogProps) {
  const [filters, setFilters] = useState<FilterCriteria>({
    campus: [],
    major: [],
    year: [],
    gender: [],
    isInterested: "all",
    dateRange: { from: "", to: "" },
    searchTerm: "",
    advancedFilters: {
      hasEmail: "all",
      emailDomain: "",
      phonePrefix: ""
    }
  });

  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  // Get unique values for filter options
  const uniqueCampuses = Array.from(new Set(contacts.map(c => c.campus))).sort();
  const uniqueMajors = Array.from(new Set(contacts.map(c => c.major))).sort();

  // Validation helper functions
  const validateExportData = () => {
    const errors = [];
    
    if (!contacts || contacts.length === 0) {
      errors.push("No contacts available");
    }
    
    if (!['csv', 'excel'].includes(exportFormat)) {
      errors.push("Invalid export format");
    }
    
    return errors;
  };

  const getExportStats = (contactsToAnalyze: Contact[]) => {
    return {
      total: contactsToAnalyze.length,
      withEmail: contactsToAnalyze.filter(c => c.email && c.email.trim()).length,
      withPhone: contactsToAnalyze.filter(c => c.phoneNumber && c.phoneNumber.trim()).length,
      interested: contactsToAnalyze.filter(c => c.isInterested).length,
      byYear: contactsToAnalyze.reduce((acc, c) => {
        acc[c.year] = (acc[c.year] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byCampus: contactsToAnalyze.reduce((acc, c) => {
        acc[c.campus] = (acc[c.campus] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  };

  // Apply all filters
  const getFilteredContacts = (): Contact[] => {
    return contacts.filter(contact => {
      // Campus filter
      if (filters.campus.length > 0 && !filters.campus.includes(contact.campus)) {
        return false;
      }

      // Major filter
      if (filters.major.length > 0 && !filters.major.includes(contact.major)) {
        return false;
      }

      // Year filter
      if (filters.year.length > 0 && !filters.year.includes(contact.year)) {
        return false;
      }

      // Gender filter
      if (filters.gender.length > 0 && !filters.gender.includes(contact.gender)) {
        return false;
      }

      // Interest filter
      if (filters.isInterested !== "all") {
        const isInterestedBool = filters.isInterested === "true";
        if (contact.isInterested !== isInterestedBool) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const contactDate = contact.createdAt ? new Date(contact.createdAt) : null;
        if (!contactDate) return false;

        if (filters.dateRange.from) {
          const fromDate = new Date(filters.dateRange.from);
          if (contactDate < fromDate) return false;
        }

        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
          toDate.setHours(23, 59, 59, 999); // End of day
          if (contactDate > toDate) return false;
        }
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchableText = `${contact.firstName} ${contact.lastName} ${contact.email || ""} ${contact.phoneNumber} ${contact.campus} ${contact.major}`.toLowerCase();
        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      // Advanced filters
      if (filters.advancedFilters.hasEmail !== "all") {
        const hasEmail = !!contact.email && contact.email.trim() !== "";
        const shouldHaveEmail = filters.advancedFilters.hasEmail === "true";
        if (hasEmail !== shouldHaveEmail) return false;
      }

      if (filters.advancedFilters.emailDomain) {
        if (!contact.email || !contact.email.includes(filters.advancedFilters.emailDomain)) {
          return false;
        }
      }

      if (filters.advancedFilters.phonePrefix) {
        if (!contact.phoneNumber.includes(filters.advancedFilters.phonePrefix)) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredContacts = getFilteredContacts();

  const handleArrayFilterChange = (key: 'campus' | 'major' | 'year' | 'gender', value: string) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[];
      return {
        ...prev,
        [key]: currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
  };

  const resetFilters = () => {
    setFilters({
      campus: [],
      major: [],
      year: [],
      gender: [],
      isInterested: "all",
      dateRange: { from: "", to: "" },
      searchTerm: "",
      advancedFilters: {
        hasEmail: "all",
        emailDomain: "",
        phonePrefix: ""
      }
    });
  };

  const handleExport = async () => {
    // Set loading state
    setIsExporting(true);
    
    try {
      // JavaScript validation controls
      
      // 1. Check if we have any contacts to export
      if (!contacts || contacts.length === 0) {
        alert("⚠️ No contacts available to export.");
        return;
      }

      // 2. Check if filtered contacts exist
      if (!filteredContacts || filteredContacts.length === 0) {
        const confirmExportEmpty = window.confirm(
          "⚠️ No contacts match your current filters.\n\nWould you like to:\n• Click 'OK' to reset filters and export all contacts\n• Click 'Cancel' to modify your filters"
        );
        
        if (!confirmExportEmpty) {
          return; // User wants to modify filters
        } else {
          // Reset filters and export all contacts
          resetFilters();
          onExport(contacts, exportFormat);
          onClose();
          return;
        }
      }

      // 3. Warning for large exports
      if (filteredContacts.length > 1000) {
        const confirmLargeExport = window.confirm(
          `⚠️ Large Export Warning\n\nYou are about to export ${filteredContacts.length.toLocaleString()} contacts.\n\nThis may take a while and create a large file.\n\nDo you want to continue?`
        );
        
        if (!confirmLargeExport) {
          return;
        }
      }

      // 4. Format validation
      if (!['csv', 'excel'].includes(exportFormat)) {
        alert("❌ Invalid export format selected. Please choose CSV or Excel.");
        return;
      }

      // 5. Check for sensitive data warning
      const hasSensitiveData = filteredContacts.some(contact => 
        contact.email || contact.phoneNumber
      );
      
      if (hasSensitiveData) {
        const confirmSensitiveData = window.confirm(
          "🔒 Privacy Notice\n\nThe export contains personal information (emails and phone numbers).\n\nPlease ensure you comply with data protection regulations and handle this data securely.\n\nDo you want to proceed with the export?"
        );
        
        if (!confirmSensitiveData) {
          return;
        }
      }

      // 6. Final confirmation with export summary
      const stats = getExportStats(filteredContacts);
      const exportSummary = `📊 Export Summary:
• ${filteredContacts.length} contact${filteredContacts.length !== 1 ? 's' : ''}
• Format: ${exportFormat.toUpperCase()}
• Date: ${new Date().toLocaleDateString()}
• With Email: ${stats.withEmail}
• With Phone: ${stats.withPhone}
• Interested: ${stats.interested}

Active Filters:
${filters.campus.length > 0 ? `• Campus: ${filters.campus.join(', ')}\n` : ''}${filters.major.length > 0 ? `• Major: ${filters.major.join(', ')}\n` : ''}${filters.year.length > 0 ? `• Year: ${filters.year.join(', ')}\n` : ''}${filters.gender.length > 0 ? `• Gender: ${filters.gender.join(', ')}\n` : ''}${filters.isInterested !== 'all' ? `• Interest: ${filters.isInterested === 'true' ? 'Interested' : 'Not Interested'}\n` : ''}${filters.searchTerm ? `• Search: "${filters.searchTerm}"\n` : ''}
Ready to export?`;

      const finalConfirm = window.confirm(exportSummary);
      
      if (!finalConfirm) {
        return;
      }

      // 7. Execute export with loading simulation
      console.log('🚀 Starting export...', {
        count: filteredContacts.length,
        format: exportFormat,
        timestamp: new Date().toISOString(),
        stats
      });

      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      onExport(filteredContacts, exportFormat);
      
      // Success notification
      setTimeout(() => {
        alert(`✅ Export completed successfully!\n\n${filteredContacts.length} contact${filteredContacts.length !== 1 ? 's' : ''} exported in ${exportFormat.toUpperCase()} format.\n\nFile should be downloading now.`);
      }, 100);
      
      onClose();
      
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert(`❌ Export failed!\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or contact support.`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Export Contacts</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 touch-manipulation"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Filter and export your contacts. {filteredContacts.length} of {contacts.length} contacts selected.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Filters Panel - Mobile First */}
          <div className="w-full lg:w-1/3 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-gray-200 space-y-4 sm:space-y-6">
            {/* Search Term */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Term
              </label>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                placeholder="Search by name, email, phone..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Simple Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Filters
              </label>
              <div className="space-y-2">
                <Button
                  variant={filters.isInterested === "true" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, isInterested: prev.isInterested === "true" ? "all" : "true" }))}
                  className="w-full justify-start"
                >
                  ✅ Interested Only
                </Button>
                <Button
                  variant={filters.advancedFilters.hasEmail === "true" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    advancedFilters: { 
                      ...prev.advancedFilters, 
                      hasEmail: prev.advancedFilters.hasEmail === "true" ? "all" : "true" 
                    }
                  }))}
                  className="w-full justify-start"
                >
                  📧 Has Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport(contacts, 'csv')}
                  className="w-full justify-start bg-green-50 hover:bg-green-100 border-green-300"
                >
                  ⚡ Export All (CSV)
                </Button>
              </div>
            </div>

            {/* Campus & Major Filters */}
            <div className="space-y-4">
              {/* Campus Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campus
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
                  {uniqueCampuses.map(campus => (
                    <label key={campus} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.campus.includes(campus)}
                        onChange={() => handleArrayFilterChange('campus', campus)}
                        className="rounded"
                      />
                      <span>{campus}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Major Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Major
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
                  {uniqueMajors.map(major => (
                    <label key={major} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.major.includes(major)}
                        onChange={() => handleArrayFilterChange('major', major)}
                        className="rounded"
                      />
                      <span>{major}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Gender Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <div className="border border-gray-300 rounded-md p-2 space-y-1">
                  {genderOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.gender.includes(option.value)}
                        onChange={() => handleArrayFilterChange('gender', option.value)}
                        className="rounded"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year
                </label>
                <div className="border border-gray-300 rounded-md p-2 space-y-1">
                  {yearOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.year.includes(option.value)}
                        onChange={() => handleArrayFilterChange('year', option.value)}
                        className="rounded"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input
                    type="date"
                    value={filters.dateRange.from}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, from: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    value={filters.dateRange.to}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, to: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <div className="space-y-2">
                {[
                  { value: 'csv', label: '📊 CSV', desc: 'Excel compatible' },
                  { value: 'excel', label: '📈 Excel+', desc: 'Enhanced with extra columns' }
                ].map(format => (
                  <label key={format.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="exportFormat"
                      value={format.value}
                      checked={exportFormat === format.value}
                      onChange={(e) => setExportFormat(e.target.value as any)}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="text-sm font-medium">{format.label}</div>
                      <div className="text-xs text-gray-500">{format.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Preview Panel - Mobile Optimized */}
          <div className="flex-1 p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                Contacts to Export ({filteredContacts.length})
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Review the contacts that will be exported with your current filters.
              </p>
            </div>

            {filteredContacts.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m0 0V3" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts match your filters</h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">Try adjusting your filters to include more contacts.</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="hidden sm:table-cell px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campus</th>
                        <th className="hidden md:table-cell px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Major</th>
                        <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interested</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredContacts.map(contact => (
                        <tr key={contact.id} className="hover:bg-gray-50">
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                              <div className="sm:hidden text-xs text-gray-500">{contact.email || 'No email'}</div>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                            {contact.email || '-'}
                          </td>
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                            <div>
                              <div>{contact.campus}</div>
                              <div className="md:hidden text-xs text-gray-500">{contact.major}</div>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                            {contact.major}
                          </td>
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap">
                            <span className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${
                              contact.isInterested 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {contact.isInterested ? 'Yes' : 'No'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with actions - Mobile Optimized */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Button variant="outline" onClick={resetFilters} size="sm" className="w-full sm:w-auto">
              Reset Filters
            </Button>
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              {filteredContacts.length} contacts selected
            </div>
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} size="sm" className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={filteredContacts.length === 0 || isExporting}
              className={`${
                filteredContacts.length === 0 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-orange-600 hover:bg-orange-700'
              } flex-1 sm:flex-none text-sm`}
              size="sm"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {filteredContacts.length === 0 
                    ? 'No Contacts' 
                    : `Export ${filteredContacts.length} ${exportFormat.toUpperCase()}`
                  }
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
