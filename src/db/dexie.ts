import Dexie, { type Table } from 'dexie';
import type { Note, PdfDocument } from '../types/db';

export class NeuroNotesDB extends Dexie {
  notes!: Table<Note>;
  pdfs!: Table<PdfDocument>;

  constructor() {
    super('NeuroNotesDB');
    this.version(1).stores({
      // Primary key `id` is auto-incrementing.
      // Indexing fields for efficient querying.
      notes: '++id, createdAt, updatedAt, category, tags',
    });
    this.version(2).stores({
      notes: '++id, createdAt, updatedAt, category, tags',
      pdfs: '++id, fileName, importedAt',
    });
  }
}

export const db = new NeuroNotesDB();
