import React from 'react';
import { FileText, StickyNote } from 'lucide-react';
import type { PdfDocument } from '../types/db';
import PdfImport from './PdfImport';
import PdfLibrary from './PdfLibrary';

interface PdfSidebarProps {
  pdfs: PdfDocument[];
  activePdfId: number | null;
  onSelectPdf: (id: number) => void;
  onDeletePdf: (id: number) => void;
  onSwitchView: () => void;
}

const PdfSidebar: React.FC<PdfSidebarProps> = ({ pdfs, activePdfId, onSelectPdf, onDeletePdf, onSwitchView }) => {
  return (
    <aside className="w-80 p-4 border-r bg-gray-50 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <FileText size={22} className="text-red-500" />
          <h1 className="text-2xl font-bold">PDFs</h1>
        </div>
        <button
          onClick={onSwitchView}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-black px-2 py-1 rounded hover:bg-gray-200"
          title="Voltar para Notas"
        >
          <StickyNote size={16} />
          Notas
        </button>
      </div>

      <div className="mb-4">
        <PdfImport onImported={(id) => onSelectPdf(id)} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Biblioteca ({pdfs.length})</h2>
        <PdfLibrary
          pdfs={pdfs}
          activePdfId={activePdfId}
          onSelectPdf={onSelectPdf}
          onDeletePdf={onDeletePdf}
        />
      </div>
    </aside>
  );
};

export default PdfSidebar;
