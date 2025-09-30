import React, { useState, useEffect } from 'react';
import { Note } from '../types/db';
import { useDebounce } from '../hooks/useDebounce';

interface EditorProps {
  note: Note | undefined;
  onUpdateNote: (noteId: number, content: string) => void;
}

const Editor: React.FC<EditorProps> = ({ note, onUpdateNote }) => {
  const [content, setContent] = useState('');
  const debouncedContent = useDebounce(content, 1000); // 1s delay

  // Update local state when the active note changes
  useEffect(() => {
    setContent(note?.rawText || '');
  }, [note]);

  // Autosave logic: when debouncedContent changes, update the database
  useEffect(() => {
    if (note && debouncedContent !== note.rawText) {
      onUpdateNote(note.id!, debouncedContent);
    }
  }, [debouncedContent, note, onUpdateNote]);

  if (!note) {
    return (
      <main className="flex-1 p-6 flex items-center justify-center text-gray-500">
        <div>Select a note or create a new one to get started.</div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 flex flex-col">
      <div className="flex-1 flex flex-col">
        <textarea
          key={note.id} // Re-mount textarea when note changes
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full flex-1 p-4 border rounded-md resize-none text-lg leading-7"
          placeholder="Start writing your note here..."
        />
        <div className="text-sm text-gray-400 mt-2">
          Last save: {new Date(note.updatedAt).toLocaleTimeString()}
        </div>
      </div>
    </main>
  );
};

export default Editor;