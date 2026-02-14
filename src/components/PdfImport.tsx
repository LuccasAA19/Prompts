import React, { useState, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';
import { extractTextFromPdf } from '../lib/pdf';
import { db } from '../db/dexie';
import type { PdfDocument } from '../types/db';

interface PdfImportProps {
  onImported: (id: number) => void;
}

const PdfImport: React.FC<PdfImportProps> = ({ onImported }) => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Selecione um arquivo PDF.');
      return;
    }

    setImporting(true);
    try {
      const { pages, pageCount } = await extractTextFromPdf(file, (current, total) => {
        setProgress({ current, total });
      });

      const doc: PdfDocument = {
        fileName: file.name,
        fileSize: file.size,
        pageCount,
        pages,
        importedAt: new Date().toISOString(),
        lastReadPage: 1,
        lastReadPosition: 0,
      };

      const id = await db.pdfs.add(doc);
      onImported(id as number);
    } catch (err) {
      console.error('Erro ao importar PDF:', err);
      alert('Erro ao importar o PDF. Verifique se o arquivo é válido.');
    } finally {
      setImporting(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (importing) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <FileText size={48} className="text-blue-500 animate-pulse" />
        <p className="text-sm text-gray-600">
          Extraindo texto... Página {progress.current} de {progress.total}
        </p>
        <div className="w-64 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <Upload size={40} className="mx-auto mb-3 text-gray-400" />
      <p className="text-sm text-gray-600 mb-1">
        Arraste um PDF aqui ou clique para selecionar
      </p>
      <p className="text-xs text-gray-400">Apenas arquivos .pdf</p>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={onFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default PdfImport;
