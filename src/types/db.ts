export type Flashcard = {
  id: string;
  q: string; // Question
  a: string; // Answer
};

export type NoteCategory = 'clinico' | 'estudo' | 'startup' | 'pessoal' | 'outro';

export type Note = {
  id?: number; // Optional: auto-incremented by Dexie
  createdAt: string;
  updatedAt: string;
  title: string;
  rawText: string;
  normalizedText: string;
  category: NoteCategory | 'pending';
  tags: string[];
  summary: string[];
  flashcards: Flashcard[];
};