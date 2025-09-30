import React from 'react';
import { Note } from '../types/db';
import { Sparkles, Download } from 'lucide-react';
import { exportNoteAsMarkdown, exportFlashcardsAsCsv } from '../lib/export';

interface InsightsProps {
  note: Note | undefined;
  onGenerateFlashcards: (noteId: number) => void;
}

const Insights: React.FC<InsightsProps> = ({ note, onGenerateFlashcards }) => {
  if (!note) {
    return (
      <aside className="w-96 p-4 border-l bg-gray-50 h-screen">
        <h2 className="text-lg font-semibold mb-4">Insights</h2>
        <p className="text-sm text-gray-500">No note selected.</p>
      </aside>
    );
  }

  const handleGenerateClick = () => {
    if (note?.id) {
      onGenerateFlashcards(note.id);
    }
  };

  return (
    <aside className="w-96 p-4 border-l bg-gray-50 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Insights</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportNoteAsMarkdown(note)}
            title="Export note as Markdown"
            className="p-2 text-gray-600 hover:text-black"
          >
            <Download size={18} />
          </button>
        </div>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto">
        <div>
          <h3 className="font-semibold text-md mb-2">Category</h3>
          <span className="inline-block bg-blue-200 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
            {note.category === 'pending' ? 'Processing...' : note.category}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-md mb-2">Summary</h3>
          {note.summary.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {note.summary.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          ) : <p className="text-sm text-gray-500">No summary yet.</p>}
        </div>
        <div>
          <h3 className="font-semibold text-md mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {note.tags.length > 0 ? (
              note.tags.map((tag) => (
                <span key={tag} className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-1 rounded">{tag}</span>
              ))
            ) : <p className="text-sm text-gray-500">No tags yet.</p>}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-md">Flashcards</h3>
            <div className="flex items-center gap-2">
               <button
                onClick={() => exportFlashcardsAsCsv(note)}
                title="Export flashcards as CSV"
                disabled={note.flashcards.length === 0}
                className="p-2 text-gray-600 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                <Download size={18} />
              </button>
              <button
                onClick={handleGenerateClick}
                className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-1"
              >
                <Sparkles size={16} />
                Generate
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {note.flashcards.length > 0 ? (
              note.flashcards.map((fc) => (
                <div key={fc.id} className="bg-white p-3 rounded-md border text-sm">
                  <p className="font-semibold">Q: {fc.q}</p>
                  <p>A: {fc.a}</p>
                </div>
              ))
            ) : <p className="text-sm text-gray-500">No flashcards generated. Click 'Generate' to create them.</p>}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Insights;