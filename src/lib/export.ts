import { Note } from '../types/db';
import Papa from 'papaparse';

/**
 * Triggers a browser download for a given text content.
 * @param filename - The desired name of the file.
 * @param content - The text content to be downloaded.
 * @param mimeType - The MIME type of the file.
 */
function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports a note's raw text as a Markdown file.
 * @param note - The note to export.
 */
export function exportNoteAsMarkdown(note: Note) {
  if (!note) return;
  const filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
  downloadFile(filename, note.rawText, 'text/markdown;charset=utf-8;');
}

/**
 * Exports a note's flashcards as a CSV file.
 * @param note - The note whose flashcards to export.
 */
export function exportFlashcardsAsCsv(note: Note) {
  if (!note || note.flashcards.length === 0) return;

  const csvData = Papa.unparse(
    note.flashcards.map(fc => ({ question: fc.q, answer: fc.a })),
    { header: true }
  );

  const filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_flashcards.csv`;
  downloadFile(filename, csvData, 'text/csv;charset=utf-8;');
}