'use client';

import { useState } from 'react';
import { Edit2, Trash2, Copy, Check, Calendar } from 'lucide-react';
import { Note } from '@/lib/types';
import { ConfirmDialog } from './ConfirmDialog';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => Promise<void>;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [copied, setCopied] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedDate = new Date(note.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(note.id);
      setIsConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="group flex flex-col rounded-xl border border-[#B6B09F] bg-[#1D1616] p-5 shadow-sm transition-all hover:border-slate-700 hover:shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#B6B09F] pb-3">
          <h4 className="text-base font-semibold text-white leading-snug">
            {note.title}
          </h4>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleCopy}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              title="Salin catatan"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => onEdit(note)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              title="Edit catatan"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition-colors"
              title="Hapus catatan"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-3 flex-1">
          <p className="whitespace-pre-wrap font-sans text-sm text-slate-300 leading-relaxed">
            {note.content}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#B6B09F] text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
          {note.updated_at !== note.created_at && (
            <span className="text-[11px] text-slate-500 italic">Diedit</span>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Hapus Catatan?"
        message={`Catatan "${note.title}" akan dihapus secara permanen.`}
        confirmText="Hapus Catatan"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
