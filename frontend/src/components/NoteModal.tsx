'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Note } from '@/lib/types';

interface NoteModalProps {
  isOpen: boolean;
  note?: Note | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string }) => Promise<void>;
}

export function NoteModal({
  isOpen,
  note,
  isLoading = false,
  onClose,
  onSubmit,
}: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle('');
      setContent('');
    }
    setError(null);
  }, [note, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul catatan wajib diisi');
      return;
    }
    if (!content.trim()) {
      setError('Isi catatan wajib diisi');
      return;
    }
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan catatan');
    }
  };

  const insertTemplate = (text: string) => {
    setContent((prev) => (prev ? `${prev}\n\n${text}` : text));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-xl bg-[#1D1616] p-6 shadow-2xl border border-slate-800 transition-all max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-lg font-semibold text-white">
            {note ? 'Edit Catatan Draft' : 'Buat Catatan Draft & Evaluasi Baru'}
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex-1 flex flex-col space-y-4 overflow-y-auto pr-1">
          {error && (
            <div className="rounded-lg bg-red-950/40 p-3 text-sm text-red-300 border border-red-900/50">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Judul Catatan <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Priority Ban & Counter Pick Claude"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-300">
                Isi Catatan & Analisis <span className="text-amber-400">*</span>
              </label>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Template cepat:</span>
                <button
                  type="button"
                  onClick={() => insertTemplate('DRAFT\n• Respect Ban:\n• Respect Pick:\n• Counter Play:')}
                  className="text-amber-400 hover:underline hover:text-amber-300 font-medium"
                >
                  Draft
                </button>
                <span>|</span>
                <button
                  type="button"
                  onClick={() => insertTemplate('REVIEW\n• Early Game:\n• Mid Game:\n• Late Game:\n• Blunder(gameplay nyabu):\n• Solusi:\n• Strat:')}
                  className="text-amber-400 hover:underline hover:text-amber-300 font-medium"
                >
                  Review
                </button>
              </div>
            </div>
            <textarea
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis catatan drafting, strategi lane, counter hero, positioning, atau evaluasi kesalahan match..."
              className="w-full flex-1 min-h-[160px] rounded-lg border border-slate-800 bg-slate-950 p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all font-mono leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-slate-800 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition-colors disabled:opacity-50 shadow-sm shadow-amber-500/20"
            >
              {isLoading ? 'Menyimpan...' : note ? 'Simpan Perubahan' : 'Simpan Catatan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
