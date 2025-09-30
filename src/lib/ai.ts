import { Note, NoteCategory, Flashcard } from '../types/db';

// --- Simulated AI Nodes ---

// 1. NormalizeText
async function normalizeText(rawText: string): Promise<string> {
  // Simulate minor cleaning: trim whitespace and remove extra spaces
  return rawText.trim().replace(/\s+/g, ' ');
}

// 2. ClassifyNote
async function classifyNote(text: string): Promise<NoteCategory> {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('patient') || lowerText.includes('diagnosis') || lowerText.includes('treatment')) {
    return 'clinico';
  }
  if (lowerText.includes('study') || lowerText.includes('research') || lowerText.includes('paper')) {
    return 'estudo';
  }
  if (lowerText.includes('business') || lowerText.includes('product') || lowerText.includes('metrics')) {
    return 'startup';
  }
  if (lowerText.includes('today i felt') || lowerText.includes('diary')) {
    return 'pessoal';
  }
  return 'outro';
}

// 3. Tagger
async function tagger(text: string): Promise<string[]> {
  const tags = new Set<string>();
  const lowerText = text.toLowerCase();

  if (lowerText.includes('react')) tags.add('react');
  if (lowerText.includes('typescript')) tags.add('typescript');
  if (lowerText.includes('llm')) tags.add('llm');
  if (lowerText.includes('mitochondria')) tags.add('cellular biology');
  if (lowerText.includes('investment')) tags.add('finance');

  // Add a generic tag if no specific ones are found
  if (tags.size === 0 && text.length > 10) tags.add('general');

  return Array.from(tags).slice(0, 7); // Max 7 tags
}

// 4. SummarizeBullets
async function summarizeBullets(text: string): Promise<string[]> {
  if (text.length < 50) return [];
  const sentences = text.split('.').filter(s => s.trim().length > 10);
  return sentences.slice(0, 3).map(s => s.trim()); // Return first 3 sentences as summary
}

// 5. FlashcardMaker
export async function flashcardMaker(text: string, category: NoteCategory): Promise<Flashcard[]> {
  if (category !== 'clinico' && category !== 'estudo') {
    return []; // Return empty if not a relevant category
  }

  const flashcards: Flashcard[] = [];
  const lowerText = text.toLowerCase();

  if (lowerText.includes('react')) {
    flashcards.push({ id: '1', q: 'What is React?', a: 'A JavaScript library for building user interfaces.' });
  }
  if (lowerText.includes('mitochondria')) {
    flashcards.push({ id: '2', q: 'What is the powerhouse of the cell?', a: 'Mitochondria' });
  }

  if (flashcards.length === 0 && text.length > 100) {
     flashcards.push({ id: '3', q: 'What is the main topic?', a: text.split('\n')[0] });
  }

  return flashcards;
}


// --- Pipeline Orchestrator ---

interface AIOptions {
  generateFlashcards?: boolean;
}

export async function runAIPipeline(
  note: Note,
  options: AIOptions = {}
): Promise<Partial<Note>> {
  const normalizedText = await normalizeText(note.rawText);

  const [category, tags, summary] = await Promise.all([
    classifyNote(normalizedText),
    tagger(normalizedText),
    summarizeBullets(normalizedText),
  ]);

  const updatedFields: Partial<Note> = {
    normalizedText,
    category,
    tags,
    summary,
  };

  if (options.generateFlashcards) {
    updatedFields.flashcards = await flashcardMaker(normalizedText, category);
  }

  return updatedFields;
}