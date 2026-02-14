import * as pdfjsLib from 'pdfjs-dist';
import type { PdfPage } from '../types/db';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export async function extractTextFromPdf(
  file: File,
  onProgress?: (page: number, total: number) => void
): Promise<{ pages: PdfPage[]; pageCount: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageCount = pdf.numPages;
  const pages: PdfPage[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .filter((item) => 'str' in item)
      .map((item) => (item as { str: string }).str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    pages.push({ pageNumber: i, text });
    onProgress?.(i, pageCount);
  }

  return { pages, pageCount };
}

export function getAllText(pages: PdfPage[]): string {
  return pages.map((p) => p.text).join('\n\n');
}

export function getTextUpToPosition(pages: PdfPage[], charPosition: number): { pageNumber: number; localPosition: number } {
  let accumulated = 0;
  for (const page of pages) {
    const pageLen = page.text.length + 2; // +2 for \n\n separator
    if (accumulated + pageLen > charPosition) {
      return { pageNumber: page.pageNumber, localPosition: charPosition - accumulated };
    }
    accumulated += pageLen;
  }
  const last = pages[pages.length - 1];
  return { pageNumber: last?.pageNumber ?? 1, localPosition: 0 };
}
