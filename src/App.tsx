import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/dexie';
import type { Note, NoteCategory } from './types/db';
import { runAIPipeline } from './lib/ai';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Insights from './components/Insights';
import PdfSidebar from './components/PdfSidebar';
import PdfReader from './components/PdfReader';

type AppView = 'notes' | 'pdfs';

function App() {
  const [view, setView] = useState<AppView>('notes');

  // --- Notes state ---
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<NoteCategory | null>(null);

  // --- PDF state ---
  const [activePdfId, setActivePdfId] = useState<number | null>(null);

  const notes = useLiveQuery(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();

    return db.notes
      .filter((note) => {
        const inCategory = !filterCategory || note.category === filterCategory;
        if (!inCategory) return false;

        if (searchQuery.trim() === '') return true;

        const inTitle = note.title.toLowerCase().includes(lowerCaseQuery);
        const inText = note.rawText.toLowerCase().includes(lowerCaseQuery);
        const inTags = note.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery));

        return inTitle || inText || inTags;
      })
      .reverse()
      .sortBy('updatedAt');
  }, [searchQuery, filterCategory]);

  const allTags = useLiveQuery(() => db.notes.toArray(), [], [])
    ?.flatMap(note => note.tags)
    .filter((tag, index, self) => self.indexOf(tag) === index)
    .sort() || [];

  const pdfs = useLiveQuery(() => db.pdfs.orderBy('importedAt').reverse().toArray()) ?? [];

  const activeNote = notes?.find((note) => note.id === activeNoteId);
  const activePdf = pdfs.find((pdf) => pdf.id === activePdfId);

  const createNewNote = async () => {
    const newNote: Note = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: 'Untitled Note',
      rawText: '',
      normalizedText: '',
      category: 'pending',
      tags: [],
      summary: [],
      flashcards: [],
    };
    const id = await db.notes.add(newNote);
    setActiveNoteId(id);
  };

  const handleNoteUpdate = async (noteId: number, content: string) => {
    const noteToUpdate = await db.notes.get(noteId);
    if (!noteToUpdate) return;

    noteToUpdate.rawText = content;
    const title = content.split('\n')[0]?.replace(/^#\s*/, '') || 'Untitled Note';
    const aiResult = await runAIPipeline(noteToUpdate);

    await db.notes.update(noteId, {
      ...aiResult,
      rawText: content,
      title,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleGenerateFlashcards = async (noteId: number) => {
    const note = await db.notes.get(noteId);
    if (!note) return;

    const aiResult = await runAIPipeline(note, { generateFlashcards: true });
    await db.notes.update(noteId, {
      flashcards: aiResult.flashcards,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeletePdf = async (id: number) => {
    await db.pdfs.delete(id);
    if (activePdfId === id) setActivePdfId(null);
  };

  return (
    <div className="flex h-screen bg-white">
      {view === 'notes' ? (
        <>
          <Sidebar
            notes={notes || []}
            activeNoteId={activeNoteId}
            onSelectNote={setActiveNoteId}
            onCreateNewNote={createNewNote}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            allTags={allTags}
            selectedCategory={filterCategory}
            onSelectCategory={setFilterCategory}
            onSwitchView={() => setView('pdfs')}
          />
          <Editor
            note={activeNote}
            onUpdateNote={handleNoteUpdate}
          />
          <Insights
            note={activeNote}
            onGenerateFlashcards={handleGenerateFlashcards}
          />
        </>
      ) : (
        <>
          <PdfSidebar
            pdfs={pdfs}
            activePdfId={activePdfId}
            onSelectPdf={setActivePdfId}
            onDeletePdf={handleDeletePdf}
            onSwitchView={() => setView('notes')}
          />
          {activePdf ? (
            <PdfReader pdf={activePdf} />
          ) : (
            <main className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-1">Selecione um PDF ou importe um novo</p>
                <p className="text-sm text-gray-400">Use o painel lateral para gerenciar seus PDFs</p>
              </div>
            </main>
          )}
        </>
      )}
    </div>
  );
}

export default App;
