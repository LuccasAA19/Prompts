import React from 'react';
import { FileText, Trash2, BookOpen } from 'lucide-react';
import type { PdfDocument } from '../types/db';

interface PdfLibraryProps {
  pdfs: PdfDocument[];
  activePdfId: number | null;
  onSelectPdf: (id: number) => void;
  onDeletePdf: (id: number) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const PdfLibrary: React.FC<PdfLibraryProps> = ({ pdfs, activePdfId, onSelectPdf, onDeletePdf }) => {
  if (pdfs.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
        <p className="text-sm text-gray-500">Nenhum PDF importado ainda.</p>
        <p className="text-xs text-gray-400 mt-1">Use o botão acima para importar.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {pdfs.map((pdf) => (
        <li
          key={pdf.id}
          onClick={() => onSelectPdf(pdf.id!)}
          className={`flex items-center gap-3 p-2 rounded-md cursor-pointer group ${
            pdf.id === activePdfId ? 'bg-blue-100' : 'hover:bg-gray-200'
          }`}
        >
          <FileText size={20} className="text-red-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{pdf.fileName}</p>
            <p className="text-xs text-gray-500">
              {pdf.pageCount} pág. · {formatFileSize(pdf.fileSize)}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDeletePdf(pdf.id!); }}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
            title="Excluir PDF"
          >
            <Trash2 size={16} />
          </button>
        </li>
      ))}
    </ul>
  );
};

export default PdfLibrary;
