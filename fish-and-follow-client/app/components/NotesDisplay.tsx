import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface NotesDisplayProps {
  notes?: string;
  contactName: string;
  maxPreviewLength?: number;
  onNotesUpdate?: (newNotes: string) => void;
  editable?: boolean;
}

export function NotesDisplay({ 
  notes, 
  contactName, 
  maxPreviewLength = 50, 
  onNotesUpdate,
  editable = false 
}: NotesDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(notes || "");

  const handleSave = () => {
    if (onNotesUpdate) {
      onNotesUpdate(editValue);
    }
    setIsEditing(false);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setEditValue(notes || "");
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditValue(notes || "");
  };

  if (!notes || notes.trim() === "") {
    if (editable) {
      return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="text-gray-400 italic text-sm hover:text-blue-600 cursor-pointer">
              Click to add notes
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Notes for {contactName}</DialogTitle>
              <DialogDescription>
                Add notes about this contact
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Add notes about this contact..."
                className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] resize-vertical"
                rows={6}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)]"
              >
                Save Notes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }
    return (
      <span className="text-gray-400 italic text-sm">No notes</span>
    );
  }

  const shouldTruncate = notes.length > maxPreviewLength;
  const previewText = shouldTruncate 
    ? `${notes.substring(0, maxPreviewLength)}...` 
    : notes;

  if (!shouldTruncate && !editable) {
    return (
      <span className="text-sm text-gray-700">{notes}</span>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button 
          className="text-left text-sm text-gray-700 hover:text-blue-600 cursor-pointer underline decoration-dotted"
          title="Click to view full notes"
        >
          {previewText}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit Notes for ${contactName}` : `Notes for ${contactName}`}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Edit the notes content" : "Full notes content"}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {isEditing ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] resize-vertical"
              rows={6}
            />
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {notes}
              </p>
            </div>
          )}
        </div>
        {editable && (
          <DialogFooter>
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  className="bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)]"
                >
                  Save Notes
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleEditClick}
                className="bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)]"
              >
                Edit Notes
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
