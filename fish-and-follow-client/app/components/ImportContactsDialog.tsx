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
import type { Contact, NewContactData } from "../lib/contactStore";

interface ImportContactsDialogProps {
  onImportContacts: (contacts: NewContactData[]) => void;
  trigger: React.ReactNode;
}

export function ImportContactsDialog({ onImportContacts, trigger }: ImportContactsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewData, setPreviewData] = useState<NewContactData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  // États pour les différentes méthodes d'import
  const [importMethod, setImportMethod] = useState<'url' | 'csv' | 'manual'>('url');
  const [googleSheetUrl, setGoogleSheetUrl] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const handleGoogleSheetImport = async () => {
    if (!googleSheetUrl.trim()) {
      setError("Veuillez saisir l'URL de votre Google Sheet");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulation de l'import depuis Google Sheets
      // En réalité, il faudrait utiliser l'API Google Sheets
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Example data simulating a successful import
      const mockImportedData: NewContactData[] = [
        {
          firstName: "Alice",
          lastName: "Martin",
          phoneNumber: "+33 6 12 34 56 78",
          email: "alice.martin@example.com",
          campus: "Paris",
          major: "Informatique",
          year: "3",
          isInterested: true,
          gender: "female"
        },
        {
          firstName: "Bob",
          lastName: "Dupont",
          phoneNumber: "+33 6 98 76 54 32",
          email: "bob.dupont@example.com",
          campus: "Lyon",
          major: "Commerce",
          year: "Master",
          isInterested: false,
          gender: "male"
        },
        {
          firstName: "Claire",
          lastName: "Rousseau",
          phoneNumber: "+33 6 11 22 33 44",
          email: "claire.rousseau@example.com",
          campus: "Marseille",
          major: "Design",
          year: "2",
          isInterested: true,
          gender: "female"
        }
      ];

      setPreviewData(mockImportedData);
      setShowPreview(true);
    } catch (err) {
      setError("Erreur lors de l'import depuis Google Sheets. Vérifiez l'URL et les permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCsvImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError("Veuillez sélectionner un fichier CSV");
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Validation des en-têtes requis
        const requiredHeaders = ['firstName', 'lastName', 'phoneNumber', 'campus', 'major', 'year', 'gender'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          setError(`En-têtes manquants: ${missingHeaders.join(', ')}`);
          return;
        }

        const contacts: NewContactData[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = line.split(',').map(v => v.trim());
          const contact: any = {};
          
          headers.forEach((header, index) => {
            contact[header] = values[index] || '';
          });

          // Validation et conversion des types
          contacts.push({
            firstName: contact.firstName,
            lastName: contact.lastName,
            phoneNumber: contact.phoneNumber,
            email: contact.email || '',
            campus: contact.campus,
            major: contact.major,
            year: contact.year as any,
            isInterested: contact.isInterested === 'true' || contact.isInterested === '1',
            gender: contact.gender as any
          });
        }

        setPreviewData(contacts);
        setShowPreview(true);
        setError("");
      } catch (err) {
        setError("Erreur lors de la lecture du fichier CSV");
      }
    };
    
    reader.readAsText(file);
  };

  const confirmImport = () => {
    onImportContacts(previewData);
    setOpen(false);
    setShowPreview(false);
    setPreviewData([]);
    setGoogleSheetUrl("");
    setCsvFile(null);
    setError("");
  };

  const resetDialog = () => {
    setShowPreview(false);
    setPreviewData([]);
    setError("");
    setGoogleSheetUrl("");
    setCsvFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            Importer des Contacts
          </DialogTitle>
          <DialogDescription>
            Importez vos contacts depuis Google Sheets ou un fichier CSV
          </DialogDescription>
        </DialogHeader>

        {!showPreview ? (
          <div className="space-y-6">
            {/* Sélection de la méthode d'import */}
            <div>
              <Label className="text-base font-medium">Méthode d'import</Label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="url"
                    checked={importMethod === 'url'}
                    onChange={(e) => setImportMethod(e.target.value as 'url')}
                    className="mr-2"
                  />
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  Google Sheets (URL)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="csv"
                    checked={importMethod === 'csv'}
                    onChange={(e) => setImportMethod(e.target.value as 'csv')}
                    className="mr-2"
                  />
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zM3 7a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1V7zM3 12a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1z" clipRule="evenodd" />
                  </svg>
                  Fichier CSV
                </label>
              </div>
            </div>

            {/* Import Google Sheets */}
            {importMethod === 'url' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="googleSheetUrl">URL du Google Sheet</Label>
                  <Input
                    id="googleSheetUrl"
                    value={googleSheetUrl}
                    onChange={(e) => setGoogleSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Assurez-vous que le Google Sheet est public ou partagé avec les permissions de lecture
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium text-blue-900 mb-2">Format requis:</h4>
                  <p className="text-sm text-blue-800">
                    Votre Google Sheet doit contenir les colonnes suivantes:
                  </p>
                  <div className="text-xs text-blue-700 mt-2 grid grid-cols-2 gap-1">
                    <span>• firstName</span>
                    <span>• lastName</span>
                    <span>• phoneNumber</span>
                    <span>• email (optionnel)</span>
                    <span>• campus</span>
                    <span>• major</span>
                    <span>• year (1,2,3,4,5,Master,PhD)</span>
                    <span>• gender (male,female,other,prefer_not_to_say)</span>
                    <span>• isInterested (true/false)</span>
                  </div>
                </div>

                <Button
                  onClick={handleGoogleSheetImport}
                  disabled={isLoading || !googleSheetUrl.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Import en cours...
                    </>
                  ) : (
                    "Importer depuis Google Sheets"
                  )}
                </Button>
              </div>
            )}

            {/* Import CSV */}
            {importMethod === 'csv' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="csvFile">Fichier CSV</Label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleCsvImport}
                    className="mt-1"
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Format CSV requis:</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    La première ligne doit contenir les en-têtes de colonnes:
                  </p>
                  <code className="text-xs bg-white p-2 rounded border block">
                    firstName,lastName,phoneNumber,email,campus,major,year,gender,isInterested
                  </code>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        ) : (
          /* Prévisualisation des données */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Prévisualisation ({previewData.length} contacts)</h3>
              <Button variant="outline" size="sm" onClick={resetDialog}>
                Retour
              </Button>
            </div>
            
            <div className="max-h-96 overflow-y-auto border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Campus</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Filière</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Année</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Intéressé</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((contact, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {contact.firstName} {contact.lastName}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">{contact.phoneNumber}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{contact.campus}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{contact.major}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{contact.year}</td>
                      <td className="px-3 py-2 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          contact.isInterested 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {contact.isInterested ? 'Oui' : 'Non'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter>
          {showPreview ? (
            <>
              <Button variant="outline" onClick={resetDialog}>
                Annuler
              </Button>
              <Button onClick={confirmImport} className="bg-green-600 hover:bg-green-700">
                Confirmer l'import ({previewData.length} contacts)
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Fermer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
