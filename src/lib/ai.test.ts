import { describe, it, expect } from 'vitest';
import { runAIPipeline } from './ai';
import type { Note } from '../types/db';

describe('Simulated AI Pipeline', () => {

  it('should classify a clinical note correctly', async () => {
    const note: Partial<Note> = { rawText: 'The patient presents with a diagnosis of pneumonia.' };
    const result = await runAIPipeline(note as Note);
    expect(result.category).toBe('clinico');
  });

  it('should classify a study note correctly', async () => {
    const note: Partial<Note> = { rawText: 'This research paper discusses the results of our study.' };
    const result = await runAIPipeline(note as Note);
    expect(result.category).toBe('estudo');
  });

  it('should summarize text into bullets', async () => {
    const longText = 'This is the first sentence. This is the second sentence. This is a third one. And a fourth.';
    const note: Partial<Note> = { rawText: longText };
    const result = await runAIPipeline(note as Note);
    expect(result.summary?.length).toBeGreaterThan(0);
    expect(result.summary?.length).toBeLessThanOrEqual(3);
  });

  it('should extract relevant tags from text', async () => {
    const note: Partial<Note> = { rawText: 'I am learning React and TypeScript for my new project.' };
    const result = await runAIPipeline(note as Note);
    expect(result.tags).toEqual(expect.arrayContaining(['react', 'typescript']));
  });

  it('should not generate flashcards for personal notes', async () => {
      const note: Partial<Note> = { rawText: 'This is my personal diary entry.' };
      const result = await runAIPipeline(note as Note, { generateFlashcards: true });
      expect(result.flashcards).toBeDefined();
      expect(result.flashcards?.length).toBe(0);
  });

  it('should generate flashcards for study notes', async () => {
    const note: Note = {
        rawText: 'This study is about React, a library for UI.',
        category: 'estudo',
        // other fields are not needed for this test
        id: 1, createdAt: '', updatedAt: '', title: '', normalizedText: '', tags: [], summary: [], flashcards: []
    };
    const result = await runAIPipeline(note, { generateFlashcards: true });
    expect(result.flashcards).toBeDefined();
    expect(result.flashcards?.length).toBeGreaterThan(0);
    expect(result.flashcards?.[0].q).toBe('What is React?');
  });

});