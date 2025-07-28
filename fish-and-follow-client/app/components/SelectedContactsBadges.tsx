import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface SelectedContact {
  key: string;
  name: string;
}

interface SelectedContactsBadgesProps {
  selectedContacts: SelectedContact[];
  onRemoveContact: (key: string) => void;
  onClearAll?: () => void;
  showClearAll?: boolean;
  className?: string;
}

export function SelectedContactsBadges({
  selectedContacts,
  onRemoveContact,
  onClearAll,
  showClearAll = true,
  className = "",
}: SelectedContactsBadgesProps) {
  return (
    <div className="border rounded-md bg-white mb-4 relative">
      {/* Clear All button in top-right corner */}
      {showClearAll && selectedContacts.length > 1 && onClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="absolute top-4 right-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2"
        >
          Clear All
        </Button>
      )}
      
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <label className="text-sm font-medium text-gray-700 min-w-fit self-start mt-0.5">
          To:
        </label>
        <div className="flex-1 pr-16 sm:pr-20">
          {selectedContacts.length === 0 ? (
            <div className="text-sm text-gray-400 mt-0.5">
              Start typing to add contacts...
            </div>
          ) : (
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {selectedContacts.map((contact) => (
                <Badge
                  key={contact.key}
                  variant="secondary"
                  className={`text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer border border-blue-200 transition-colors ${className}`}
                  onClick={() => onRemoveContact(contact.key)}
                >
                  {contact.name}
                  <span className="ml-1.5 text-blue-600 hover:text-blue-800 font-medium">×</span>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SelectedContactsBadges;
