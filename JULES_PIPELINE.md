# NeuroNotes+ Processing Pipeline

This document outlines the architecture and data flow of the NeuroNotes+ intelligent processing pipeline. In the MVP, this pipeline is **simulated locally** using deterministic functions found in `src/lib/ai.ts` to ensure privacy, speed, and offline functionality.

## Pipeline Overview

The pipeline is designed to enrich raw user notes with structured, useful metadata. It is triggered automatically on `autosave` (when the user is idle) and can also be invoked on-demand for specific tasks like flashcard generation.

**Orchestration Flow:**

1.  **Idle Event (`onIdle`)**: User stops typing for 1 second.
    *   Triggers the main processing sequence: `InputCapture` → `NormalizeText` → `ClassifyNote` → `Tagger` → `SummarizeBullets` → `PersistLocal`.
2.  **Command Event (`onCommand`)**: User clicks "Generate Flashcards".
    *   Triggers the flashcard sequence: `FlashcardMaker` → `PersistLocal`.

---

## Pipeline Nodes

### 1. `InputCapture`

*   **Trigger**: `onChange` event in the editor.
*   **Action**: Buffers the user's `rawText` input. When the user is idle for 1000ms, it triggers the `Autosave` process, which initiates the main pipeline flow.
*   **Output**: `rawText` to the `NormalizeText` node.

### 2. `NormalizeText`

*   **Trigger**: Called by the `Autosave` orchestrator.
*   **Action**: Performs light cleanup on the `rawText`. In the current simulation, this involves trimming whitespace and removing duplicate spaces. It is designed to correct obvious errors without altering the user's writing style.
*   **Output**: `normalizedText` to the `ClassifyNote`, `Tagger`, and `SummarizeBullets` nodes.

### 3. `ClassifyNote`

*   **Trigger**: Called by the `Autosave` orchestrator.
*   **Action**: Analyzes the `normalizedText` to assign a single category: `clinico`, `estudo`, `startup`, `pessoal`, or `outro`. The local simulation uses keyword matching.
*   **Output**: A `category` string.

### 4. `Tagger`

*   **Trigger**: Called by the `Autosave` orchestrator.
*   **Action**: Extracts 3-7 relevant keywords from the `normalizedText` to serve as search tags. The local simulation matches a predefined list of technical terms.
*   **Output**: An array of `tags`.

### 5. `SummarizeBullets`

*   **Trigger**: Called by the `Autosave` orchestrator.
*   **Action**: Generates 3-5 concise bullet points from the `normalizedText` that capture the main ideas. The local simulation extracts the first few sentences.
*   **Output**: An array of `summary` strings.

### 6. `FlashcardMaker`

*   **Trigger**: On-demand via a user command (e.g., clicking the "Generate Flashcards" button).
*   **Action**: Analyzes the `normalizedText` and `category`. If the category is `clinico` or `estudo`, it attempts to generate 3-10 factual Question/Answer pairs. If the note content is unsuitable, it returns an empty array.
*   **Output**: An array of `flashcards` objects (`{ id, q, a }`).

### 7. `PersistLocal`

*   **Trigger**: Called at the end of the `Autosave` or `FlashcardMaker` flows.
*   **Action**: Performs an `upsert` operation on the `notes` collection in IndexedDB. It saves all the generated metadata (`category`, `tags`, `summary`, `flashcards`) along with the user's `rawText` and updates the `updatedAt` timestamp.
*   **Output**: None. The operation updates the local database.

### 8. `Search`

*   **Trigger**: `onChange` event in the sidebar's search input or when a category filter is applied.
*   **Action**: Implemented as a client-side filter using Dexie's live queries. It performs a case-insensitive substring match against the `title`, `rawText`, and `tags` fields of each note. It also filters by the selected `category`.
*   **Output**: A filtered list of `Note` objects displayed in the UI.