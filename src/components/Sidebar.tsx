import React from 'react';
import type { Note, NoteCategory } from '../types/db';
import { PlusCircle, Search, FileText } from 'lucide-react';

const CATEGORIES: NoteCategory[] = ['clinico', 'estudo', 'startup', 'pessoal', 'outro'];

interface SidebarProps {
  notes: Note[];
  activeNoteId: number | null;
  onSelectNote: (id: number) => void;
  onCreateNewNote: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  allTags: string[];
  selectedCategory: NoteCategory | null;
  onSelectCategory: (category: NoteCategory | null) => void;
  onSwitchView: () => void;
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  const {
    notes,
    activeNoteId,
    onSelectNote,
    onCreateNewNote,
    searchQuery,
    onSearchChange,
    selectedCategory,
    onSelectCategory,
    onSwitchView,
  } = props;

  return (
    <aside className="w-80 p-4 border-r bg-gray-50 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">NeuroNotes+</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchView}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-black px-2 py-1 rounded hover:bg-gray-200"
            title="Leitor de PDFs"
          >
            <FileText size={16} />
            PDFs
          </button>
          <button onClick={onCreateNewNote} className="text-gray-600 hover:text-black">
            <PlusCircle size={24} />
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md"
        />
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Categories</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSelectCategory(null)}
            className={`px-3 py-1 text-sm rounded-full ${
              !selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1 text-sm rounded-full capitalize ${
                selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Notes ({notes.length})</h2>
        <ul>
          {notes.map((note) => (
            <li
              key={note.id}
              onClick={() => onSelectNote(note.id!)}
              className={`p-2 rounded-md cursor-pointer mb-1 ${
                note.id === activeNoteId ? 'bg-blue-100' : 'hover:bg-gray-200'
              }`}
            >
              <h3 className="font-semibold truncate">{note.title}</h3>
              <p className="text-sm text-gray-500 truncate">{note.rawText || 'No content'}</p>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;