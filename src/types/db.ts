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

// PDF Voice Reader types

export type PdfPage = {
  pageNumber: number;
  text: string;
};

export type PdfDocument = {
  id?: number;
  fileName: string;
  fileSize: number;
  pageCount: number;
  pages: PdfPage[];
  importedAt: string;
  lastReadPage: number;
  lastReadPosition: number;
};

export type TTSVoice = {
  id: string;
  name: string;
  language: string;
  gender: string;
};

export type TTSSettings = {
  voiceId: string;
  speed: number;
};