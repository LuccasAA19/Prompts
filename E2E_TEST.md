# NeuroNotes+ End-to-End Test: Happy Path

This document describes the manual steps to perform an end-to-end test of the NeuroNotes+ application's core "happy path" workflow.

**Objective:** To verify that a user can create a note, see it autosave and process, generate flashcards, and use the search and export functionalities.

---

### **Test Steps**

1.  **Start the Application**
    *   **Action:** Run `npm run dev` in your terminal.
    *   **Expected Result:** The application opens in your browser, displaying the 3-column layout. The "Notes" list is initially empty. The editor shows a placeholder message.

2.  **Create a New Note**
    *   **Action:** Click the "Plus" icon in the sidebar.
    *   **Expected Result:**
        *   A new note titled "Untitled Note" appears in the sidebar and is highlighted as the active note.
        *   The editor becomes active, ready for input.
        *   The "Insights" panel shows the category as "Processing...".

3.  **Write a Clinical Note**
    *   **Action:** In the editor's textarea, type the following text: `# Clinical Case: Pneumonia\n\nThe patient is a 65-year-old male presenting with fever and cough. Diagnosis is community-acquired pneumonia. Treatment will be initiated with antibiotics.`
    *   **Expected Result:**
        *   The text appears in the editor.
        *   The note's title in the sidebar updates to "Clinical Case: Pneumonia".

4.  **Verify Autosave and AI Pipeline**
    *   **Action:** Stop typing for 2-3 seconds.
    *   **Expected Result:**
        *   The "Last save" timestamp in the editor updates.
        *   In the "Insights" panel:
            *   **Category:** Updates to `clinico`.
            *   **Summary:** Shows a few bullet points based on the text.
            *   **Tags:** Shows relevant tags like `pneumonia` or `clinical`. (Note: Simulated tags may be generic).

5.  **Generate Flashcards**
    *   **Action:** In the "Insights" panel, click the "Generate" button in the "Flashcards" section.
    *   **Expected Result:**
        *   A few Q&A flashcards appear in the "Flashcards" section. For example:
            *   Q: What is the diagnosis?
            *   A: Community-acquired pneumonia.

6.  **Search for the Note**
    *   **Action:** In the sidebar's search bar, type `pneumonia`.
    *   **Expected Result:** The note "Clinical Case: Pneumonia" remains visible in the notes list.
    *   **Action:** Clear the search bar. Type `startup`.
    *   **Expected Result:** The notes list becomes empty, as no note matches the query.
    *   **Action:** Clear the search bar again.

7.  **Filter by Category**
    *   **Action:** In the sidebar's "Categories" section, click the `clinico` button.
    *   **Expected Result:** The note "Clinical Case: Pneumonia" remains visible.
    *   **Action:** Click the `startup` button.
    *   **Expected Result:** The notes list becomes empty.
    *   **Action:** Click the `All` button to clear the filter.

8.  **Export Note and Flashcards**
    *   **Action (Export Note):** In the "Insights" panel header, click the "Download" icon.
    *   **Expected Result:** A file named `clinical_case_pneumonia.md` is downloaded by the browser. Its content matches the text entered in step 3.
    *   **Action (Export Flashcards):** In the "Flashcards" section header, click the "Download" icon.
    *   **Expected Result:** A file named `clinical_case_pneumonia_flashcards.csv` is downloaded. It contains the generated questions and answers.

---

This completes the E2E test.