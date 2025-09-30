import Dexie, { Table } from 'dexie';
import { Note } from '../types/db';

export class NeuroNotesDB extends Dexie {
  notes!: Table<Note>;

  constructor() {
    super('NeuroNotesDB');
    this.version(1).stores({
      // Primary key `id` is auto-incrementing.
      // Indexing fields for efficient querying.
      notes: '++id, createdAt, updatedAt, category, tags',
    });
  }
}

export const db = new NeuroNotesDB();