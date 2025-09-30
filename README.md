# NeuroNotes+ (MVP)

NeuroNotes+ is a simple, local-first, and privacy-focused intelligent notepad designed for a medical researcher. This MVP allows for creating notes, which are then automatically classified, summarized, and tagged. It supports on-demand flashcard generation and provides fast, local search capabilities.

Built with React, TypeScript, Vite, and Tailwind CSS. Data is persisted locally using IndexedDB via Dexie.

## Key Features (MVP)

*   **Markdown Editor**: Basic Markdown support for note-taking.
*   **Autosave**: Notes are saved automatically after 1 second of inactivity.
*   **AI-Powered Insights (Simulated)**:
    *   **Automatic Classification**: Notes are categorized as `clinico`, `estudo`, `startup`, `pessoal`, or `outro`.
    *   **Automatic Summarization**: Key ideas are extracted into bullet points.
    *   **Automatic Tagging**: Relevant tags are generated from the note's content.
*   **On-Demand Flashcards**: Users can generate Q&A flashcards from study or clinical notes.
*   **Local-First Storage**: All data is stored securely in your browser's IndexedDB. No data ever leaves your machine.
*   **Search & Filter**: Full-text search and filtering by category.
*   **Export**: Export notes to `.md` and flashcards to `.csv`.

## Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd neurontes-plus
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Available Scripts

*   **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server and open the application at `http://localhost:5173`.

*   **Build for production:**
    ```bash
    npm run build
    ```
    This command bundles the application into the `dist/` directory for deployment.

*   **Run unit tests:**
    ```bash
    npm run test
    ```
    This will execute the unit tests using `vitest`.

## MVP Limitations

*   **Simulated AI**: The AI pipeline (`Classify`, `Summarize`, `Tag`, `FlashcardMaker`) is simulated with local, deterministic functions in `src/lib/ai.ts`. This is to ensure the application is fully functional offline and to decouple UI development from real AI model integration.
*   **Simple Search**: The search functionality is a client-side substring match. It does not use advanced indexing or embeddings.
*   **No User Accounts**: The application is designed for a single user on a single browser. There is no concept of user authentication or cloud synchronization.
*   **Basic UI/UX**: The user interface is functional but minimal. It has not been extensively polished for all edge cases.
*   **Error Handling**: Error handling is present but basic. For example, if an "AI" process fails, the note is still saved, but a "pending" label might persist.