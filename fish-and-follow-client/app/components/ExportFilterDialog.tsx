import { useState } from "react";
import type { Contact, YearEnum, GenderEnum } from "~/types/contact";
import { yearOptions, genderOptions } from "~/types/contact";
import { Button } from "./ui/button";

interface FilterCriteria {
  campus: string[];
  major: string[];
  year: YearEnum[];
  gender: GenderEnum[];
  isInterested?: "all" | "true" | "false";
  followUpStatusNumbers: number[];
  dateRange: {
    from: string;
    to: string;
  };
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
    followUpStatusNumbers: [],
    dateRange: { from: "", to: "" },
    advancedFilters: {
      hasEmail: "all",
      emailDomain: "",
      phonePrefix: ""
    }
  });

  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');

  // Get unique values for filter options
  const uniqueCampuses = Array.from(new Set(contacts.map(c => c.campus))).sort();
  const uniqueMajors = Array.from(new Set(contacts.map(c => c.major))).sort();

  const getExportStats = (contactsToAnalyze: Contact[]) => {
    return {
      total: contactsToAnalyze.length,
      withEmail: contactsToAnalyze.filter(c => c.email && c.email.trim()).length,
      withPhone: contactsToAnalyze.filter(c => c.phoneNumber && c.phoneNumber.trim()).length,
      interested: contactsToAnalyze.filter(c => c.isInterested).length,
      byFollowUpStatus: contactsToAnalyze.reduce((acc, c) => {
        const statusName = c?.followUpStatusDescription || `Status ${c.followUpStatusNumber}`;
        acc[statusName] = (acc[statusName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
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

      // Follow-up status filter
      if (filters.followUpStatusNumbers.length > 0 && !filters.followUpStatusNumbers.includes(contact.followUpStatusNumber || 0)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const contactDate = contact.createdAt ? new Date(contact.createdAt) : null;
        if (!contactDate) return false;

        if (filters.dateRange.from) {
          if (contactDate < new Date(filters.dateRange.from)) return false;
        }

        if (filters.dateRange.to) {
          if (contactDate > new Date(filters.dateRange.to)) return false;
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
        if (!contact.email || !contact.email.includes(filters.advancedFilters.emailDomain)) return false;
      }

      if (filters.advancedFilters.phonePrefix) {
        if (!contact.phoneNumber.includes(filters.advancedFilters.phonePrefix)) return false;
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
      followUpStatusNumbers: [],
      dateRange: { from: "", to: "" },
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
${filters.campus.length > 0 ? `• Campus: ${filters.campus.join(', ')}\n` : ''}${filters.major.length > 0 ? `• Major: ${filters.major.join(', ')}\n` : ''}${filters.year.length > 0 ? `• Year: ${filters.year.join(', ')}\n` : ''}${filters.gender.length > 0 ? `• Gender: ${filters.gender.join(', ')}\n` : ''}${filters.isInterested !== 'all' ? `• Interest: ${filters.isInterested === 'true' ? 'Interested' : 'Not Interested'}\n` : ''}
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
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Export Contacts</h2>
              <p className="text-sm text-gray-600 mt-1">Filter and export your contact data</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Filters Panel - Mobile First */}
          <div className="w-full lg:w-1/3 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-gray-200 space-y-4 sm:space-y-6">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
                  {uniqueCampuses.map(campus => (
                    <label key={campus} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.campus.includes(campus)}
                        onChange={() => handleArrayFilterChange('campus', campus)}
                        className="rounded-md mr-2"
                      />
                      <span className="text-sm">{campus}</span>
                    </label>
                  ))}
                </div>
              </div>

            {/* Major Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Major</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {uniqueMajors.map(major => (
                  <label key={major} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.major.includes(major)}
                      onChange={() => handleArrayFilterChange('major', major)}
                      className="mr-2"
                    />
                    <span className="text-sm">{major}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Year and Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <div className="border border-gray-300 rounded-md p-2 space-y-1">
                  {Object.entries(genderOptions).map(([value, label]) => (
                    <label key={value} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.gender.includes(value as GenderEnum)}
                        onChange={() => handleArrayFilterChange('gender', value)}
                        className="rounded"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year
                </label>
                <div className="border border-gray-300 rounded-md p-2 space-y-1">
                  {Object.entries(yearOptions).map(([value, label]) => (
                    <label key={value} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.year.includes(value as YearEnum)}
                        onChange={() => handleArrayFilterChange('year', value)}
                        className="rounded"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Interest Level */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Interest Level</label>
              <select
                value={filters.isInterested}
                onChange={(e) => setFilters(prev => ({ ...prev, isInterested: e.target.value as "all" | "true" | "false" }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="true">Interested only</option>
                <option value="false">Not interested only</option>
              </select>
            </div>
          </div>

          {/* Preview and Export Panel */}
          <div className="lg:w-1/3 p-4 sm:p-6 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Export Preview</h3>
            
            <div className="mb-6">
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{filteredContacts.length}</div>
                  <div className="text-sm text-gray-600">contacts will be exported</div>
                </div>
              </div>
            </div>

            {/* Export Format */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={(e) => setExportFormat(e.target.value as 'csv' | 'excel')}
                    className="mr-2"
                  />
                  <span className="text-sm">CSV (.csv)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="excel"
                    checked={exportFormat === 'excel'}
                    onChange={(e) => setExportFormat(e.target.value as 'csv' | 'excel')}
                    className="mr-2"
                  />
                  <span className="text-sm">Excel (.xlsx)</span>
                </label>
              </div>
            </div>

            {/* Export Actions */}
            <div className="space-y-3">
              <Button 
                onClick={resetFilters}
                variant="outline"
                className="w-full text-sm"
                size="sm"
              >
                Reset All Filters
              </Button>
              <Button 
                onClick={handleExport}
                disabled={filteredContacts.length === 0}
                className="bg-orange-600 hover:bg-orange-700 w-full text-sm"
                size="sm"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export {filteredContacts.length}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
