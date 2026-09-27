'use client';

import { useState } from 'react';
import { Trash2, ZoomIn, X, Calendar } from 'lucide-react';
import { ImageRecord } from '@/lib/types';
import { api } from '@/lib/api';
import { ConfirmDialog } from './ConfirmDialog';

interface ImageCardProps {
  image: ImageRecord;
  onDelete: (id: string) => Promise<void>;
}

export function ImageCard({ image, onDelete }: ImageCardProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fullUrl = api.getImageUrl(image.image_url);
  const formattedDate = new Date(image.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(image.id);
      setIsConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-xl border border-[#B6B09F] bg-[#1D1616] transition-all hover:border-slate-700 hover:shadow-lg">
        {/* Image Display */}
        <div
          onClick={() => setIsZoomed(true)}
          className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer flex items-center justify-center"
        >
          <img
            src={fullUrl}
            alt={image.caption || 'Screenshot draft match'}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              <ZoomIn className="h-3.5 w-3.5" />
              Lihat Detail
            </span>
          </div>
        </div>

        {/* Info & Footer */}
        <div className="flex flex-1 flex-col justify-between p-3">
          <div>
            <p className="text-sm font-medium text-slate-200 line-clamp-2">
              {image.caption || 'Tanpa keterangan'}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#B6B09F]">
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Calendar className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>

            <button
              onClick={() => setIsConfirmOpen(true)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition-colors"
              title="Hapus gambar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox / Fullscreen Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute -top-10 right-0 rounded-full bg-white/20 p-1.5 text-white hover:bg-white/40 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={fullUrl}
              alt={image.caption || 'Screenshot detail'}
              className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            {image.caption && (
              <div
                className="mt-3 rounded-lg bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur max-w-xl text-center"
                onClick={(e) => e.stopPropagation()}
              >
                {image.caption}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Hapus Gambar?"
        message="Gambar screenshot ini akan dihapus secara permanen dari server dan catatan pertandingan."
        confirmText="Hapus Gambar"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
