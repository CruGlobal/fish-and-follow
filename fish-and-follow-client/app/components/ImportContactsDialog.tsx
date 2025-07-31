import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { NewContactData } from "../types/contact";
import { useFollowUpStatuses } from "../hooks/useFollowUpStatuses";
import { apiService } from "../lib/api";
import { NotesDisplay } from "./NotesDisplay";

interface ImportContactsDialogProps {
  onImportContacts?: (contacts: NewContactData[]) => void;
  onImportComplete?: () => void;
  trigger: React.ReactNode;
}

export function ImportContactsDialog({ onImportContacts, onImportComplete, trigger }: ImportContactsDialogProps) {
  const { statuses: followUpStatuses } = useFollowUpStatuses();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewData, setPreviewData] = useState<NewContactData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [importResults, setImportResults] = useState<{
    successful: number;
    failed: number;
    errors: Array<{ contact: NewContactData; error: string; index: number }>;
  }>({ successful: 0, failed: 0, errors: [] });
  
  // Only CSV import method
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const handleCsvImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError("Please select a CSV file");
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        // Validate required headers (based on export format)
        const requiredHeaders = ['First Name', 'Last Name', 'Email', 'Phone', 'Campus', 'Major', 'Year', 'Gender', 'Interested', 'Follow-up Status Description'];
        const optionalHeaders = ['Notes'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          setError(`Missing headers: ${missingHeaders.join(', ')}`);
          return;
        }

        const contacts: NewContactData[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Handle CSV parsing with quoted values
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const contact: any = {};
          
          headers.forEach((header, index) => {
            contact[header] = values[index] || '';
          });

          // Map to follow-up status number from description (default to 1 if not found)
          const followUpStatusDesc = contact['Follow-up Status Description'] || '';
          const matchingStatus = followUpStatuses.find(s => 
            s.description.toLowerCase() === followUpStatusDesc.toLowerCase()
          );
          const followUpStatusNumber = matchingStatus ? matchingStatus.number : 1;

          // Convert and validate data
          contacts.push({
            firstName: contact['First Name'],
            lastName: contact['Last Name'],
            phoneNumber: contact['Phone'],
            email: contact['Email'] || '',
            campus: contact['Campus'],
            major: contact['Major'],
            year: contact['Year'] as any,
            isInterested: contact['Interested'] ? contact['Interested'].toLowerCase() === 'yes' : true,
            followUpStatusNumber: followUpStatusNumber,
            gender: contact['Gender'] as any,
            notes: contact['Notes'] || ''
          });
        }

        setPreviewData(contacts);
        setShowPreview(true);
        setError("");
      } catch (err) {
        setError("Error reading the CSV file");
      }
    };
    
    reader.readAsText(file);
  };

  const confirmImport = async () => {
    if (previewData.length === 0) return;

    try {
      setIsLoading(true);
      
      // Use the new bulk import API
      const results = await apiService.importContacts(previewData);
      
      setImportResults(results);
      setShowPreview(false);
      setShowResults(true);
      
      // Call the completion callback
      onImportComplete?.();
      
    } catch (err) {
      setError("Failed to import contacts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetDialog = () => {
    setShowPreview(false);
    setShowResults(false);
    setPreviewData([]);
    setImportResults({ successful: 0, failed: 0, errors: [] });
    setError("");
    setCsvFile(null);
  };

  const closeDialog = () => {
    if (isLoading) return; // Prevent closing during import
    setOpen(false);
    resetDialog();
  };

  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col" onPointerDownOutside={isLoading ? (e) => e.preventDefault() : undefined}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            {isLoading ? 'Importing Contacts...' : showResults ? 'Import Complete' : 'Import Contacts'}
          </DialogTitle>
          <DialogDescription>
            {isLoading 
              ? 'Please wait while we import your contacts...' 
              : showResults 
                ? 'Import process completed'
                : 'Import your contacts from a CSV file'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {isLoading ? (
            /* Loading State */
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="text-lg font-medium">Importing contacts...</p>
              <p className="text-sm text-gray-600">Processing {previewData.length} contacts</p>
            </div>
          ) : showResults ? (
            /* Results State */
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Import Summary</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{importResults.successful}</div>
                  <div className="text-sm text-green-700">Successful Imports</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{importResults.failed || "Unknown"}</div>
                  <div className="text-sm text-red-700">Failed Imports</div>
                </div>
              </div>

              {importResults.failed > 0 && (
                <div className="space-y-4 border-2 p-2 rounded-md">
                  <h4 className="text-md font-medium text-gray-900">Failed Imports:</h4>
                  <div className="max-h-60 overflow-y-scroll space-y-2">
                    {importResults.errors.map((failure, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-md p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-800">
                              Row {failure.index}: {failure.contact.firstName} {failure.contact.lastName}
                            </p>
                            <p className="text-xs text-red-600 mt-1">{failure.error}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : !showPreview ? (
          <div className="space-y-6">
            {/* Import CSV */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="csvFile">CSV File</Label>
                <Input
                  id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleCsvImport}
                    className="mt-1 hover:bg-gray-50 cursor-pointer"
                  />
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Required CSV format:</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    The first row must contain the column headers (export contacts first to see the exact format):
                  </p>
                  <code className="text-xs bg-white p-2 rounded border block break-all">
                    First Name,Last Name,Email,Phone,Campus,Major,Year,Gender,Interested,Follow-up Status Description,Notes
                  </code>
                  <p className="text-xs text-gray-600 mt-2">
                    The "Notes" column is optional. Other columns are required except as noted in export.
                  </p>
                </div>
              </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        ) : (
          /* Data preview */
          <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-medium">Preview ({previewData.length} contacts)</h3>
              <Button variant="outline" size="sm" onClick={resetDialog}>
                Back
              </Button>
            </div>
            
            <div className="flex-1 min-h-0 overflow-auto border rounded-md">
              <table className="w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 sticky top-0 roudned-t-md">
                  <tr className="rounded-t-md">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap rounded-tl-md">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Phone</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Campus</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Major</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Year</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Interested</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap rounded-tr-md">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((contact, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">
                        {contact.firstName} {contact.lastName}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{contact.phoneNumber}</td>
                      <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap" title={contact.campus}>
                        {contact.campus}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap" title={contact.major}>
                        {contact.major}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{contact.year}</td>
                      <td className="px-3 py-2 text-sm whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          contact.isInterested ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {contact.isInterested ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800" title={followUpStatuses.find(s => s.number === contact.followUpStatusNumber)?.description || `Status ${contact.followUpStatusNumber || 'Unknown'}`}>
                          {followUpStatuses.find(s => s.number === contact.followUpStatusNumber)?.description || `Status ${contact.followUpStatusNumber || 'Unknown'}`}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 max-w-xs">
                        <NotesDisplay 
                          notes={contact.notes} 
                          contactName={`${contact.firstName} ${contact.lastName}`}
                          maxPreviewLength={30}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>

        <DialogFooter className="flex-shrink-0">
          {isLoading ? (
            <Button disabled className="opacity-50 cursor-not-allowed">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Importing...
            </Button>
          ) : showResults ? (
            <Button onClick={closeDialog} className="bg-green-600 hover:bg-green-700">
              Done
            </Button>
          ) : showPreview ? (
            <>
              <Button variant="outline" onClick={resetDialog} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={confirmImport} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                Confirm import ({previewData.length} contacts)
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={closeDialog}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
