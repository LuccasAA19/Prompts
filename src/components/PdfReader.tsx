import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PdfDocument } from '../types/db';
import { db } from '../db/dexie';
import VoicePlayer from './VoicePlayer';

interface PdfReaderProps {
  pdf: PdfDocument;
}

const PdfReader: React.FC<PdfReaderProps> = ({ pdf }) => {
  const [currentPage, setCurrentPage] = useState(pdf.lastReadPage);

  const page = useMemo(() => {
    return pdf.pages.find((p) => p.pageNumber === currentPage);
  }, [pdf.pages, currentPage]);

  const fullText = useMemo(() => {
    return pdf.pages.map((p) => p.text).join('\n\n');
  }, [pdf.pages]);

  const goToPage = async (pageNum: number) => {
    if (pageNum < 1 || pageNum > pdf.pageCount) return;
    setCurrentPage(pageNum);
    await db.pdfs.update(pdf.id!, { lastReadPage: pageNum });
  };

  return (
    <main className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="px-6 py-3 border-b bg-white flex items-center justify-between shrink-0">
        <h2 className="font-semibold text-lg truncate flex-1 mr-4">{pdf.fileName}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-600 min-w-[80px] text-center">
            Pág. {currentPage} / {pdf.pageCount}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= pdf.pageCount}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Page text content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {page?.text ? (
            <p className="text-base leading-8 text-gray-800 whitespace-pre-wrap">
              {page.text}
            </p>
          ) : (
            <p className="text-gray-400 italic text-center mt-12">
              Esta página não contém texto extraível.
            </p>
          )}
        </div>
      </div>

      {/* Voice Player */}
      <VoicePlayer text={fullText} />
    </main>
  );
};

export default PdfReader;
