'use client';

import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploadModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onUpload: (file: File, caption?: string) => Promise<void>;
}

export function ImageUploadModal({
  isOpen,
  isLoading = false,
  onClose,
  onUpload,
}: ImageUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      setError('File yang dipilih harus berupa gambar (JPG, PNG, WEBP)');
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 10MB');
      return;
    }

    setError(null);
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
  };

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setCaption('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Silakan pilih file gambar tangkapan layar terlebih dahulu');
      return;
    }

    setError(null);
    try {
      await onUpload(file, caption.trim() ? caption.trim() : undefined);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Gagal mengunggah gambar');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-xl bg-[#1D1616] p-6 shadow-2xl border border-slate-800 transition-all max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Upload className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Upload Screenshot Pertandingan
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex-1 flex flex-col space-y-4 overflow-y-auto pr-1">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-950/40 p-3 text-sm text-red-300 border border-red-900/50">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Pilih Gambar <span className="text-amber-400">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl p-8 hover:border-amber-400/60 hover:bg-amber-500/5 cursor-pointer transition-all text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400 mb-3">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-slate-200">
                  Klik untuk memilih file tangkapan layar
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Format: JPG, PNG, WEBP (Maks 10MB)
                </p>
              </div>
            ) : (
              <div className="relative rounded-xl border border-slate-800 overflow-hidden group bg-slate-950 flex items-center justify-center max-h-64">
                <img
                  src={previewUrl}
                  alt="Preview upload"
                  className="max-h-64 w-auto object-contain"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 right-3 rounded-lg bg-[#1D1616]/90 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 shadow backdrop-blur hover:bg-slate-800 transition-all"
                >
                  Ganti Foto
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Caption / Keterangan (Opsional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Contoh: Hasil Draft Akhir Game 1, Gold Lead 5k, atau Damage Graph"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-lg border border-slate-800 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || !file}
              className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition-colors disabled:opacity-50 shadow-sm shadow-amber-500/20"
            >
              {isLoading ? 'Mengunggah...' : 'Upload Gambar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
