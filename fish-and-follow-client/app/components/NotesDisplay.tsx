import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface NotesDisplayProps {
  notes?: string;
  contactName: string;
  maxPreviewLength?: number;
}

export function NotesDisplay({ notes, contactName, maxPreviewLength = 50 }: NotesDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!notes || notes.trim() === "") {
    return (
      <span className="text-gray-400 italic text-sm">No notes</span>
    );
  }

  const shouldTruncate = notes.length > maxPreviewLength;
  const previewText = shouldTruncate 
    ? `${notes.substring(0, maxPreviewLength)}...` 
    : notes;

  if (!shouldTruncate) {
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
          <DialogTitle>Notes for {contactName}</DialogTitle>
          <DialogDescription>
            Full notes content
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {notes}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
