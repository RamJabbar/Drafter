'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DraftGroup } from '@/lib/types';

interface GroupModalProps {
  isOpen: boolean;
  group?: DraftGroup | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string }) => Promise<void>;
}

export function GroupModal({
  isOpen,
  group,
  isLoading = false,
  onClose,
  onSubmit,
}: GroupModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (group) {
      setTitle(group.title);
      setDescription(group.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
    setError(null);
  }, [group, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul group pertandingan wajib diisi');
      return;
    }
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() ? description.trim() : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan draft group');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-xl bg-[#1D1616] p-6 shadow-2xl border border-slate-800 transition-all">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-lg font-semibold text-white">
            {group ? 'Edit Pertandingan / Scrim' : 'Buat Pertandingan / Scrim Baru'}
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-950/40 p-3 text-sm text-red-300 border border-red-900/50">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Judul Pertandingan <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Scrim vs Ayam (bo101)"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Deskripsi / Catatan Tambahan
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Serah mau ngetik apa"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all resize-none"
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
              {isLoading ? 'Menyimpan...' : group ? 'Simpan Perubahan' : 'Buat Pertandingan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
