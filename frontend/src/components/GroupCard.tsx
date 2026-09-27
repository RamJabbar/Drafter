'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Image as ImageIcon, Calendar, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { DraftGroup } from '@/lib/types';
import { ConfirmDialog } from './ConfirmDialog';

interface GroupCardProps {
  group: DraftGroup;
  onEdit: (group: DraftGroup) => void;
  onDelete: (id: string) => Promise<void>;
}

export function GroupCard({ group, onEdit, onDelete }: GroupCardProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedDate = new Date(group.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(group.id);
      setIsConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="group relative flex flex-col justify-between rounded-xl border border-[#B6B09F] bg-[#1D1616] p-5 shadow-sm transition-all hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5">
        {/* Top Header */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/groups/${group.id}`}
              className="font-semibold text-white group-hover:text-amber-400 transition-colors text-base line-clamp-1"
            >
              {group.title}
            </Link>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onEdit(group);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                title="Edit nama pertandingan"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsConfirmOpen(true);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition-colors"
                title="Hapus pertandingan"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="mt-2 text-sm text-slate-400 line-clamp-2 min-h-[2.5rem]">
            {group.description || 'Tidak ada deskripsi tambahan.'}
          </p>
        </div>

        {/* Bottom Details & Link */}
        <div className="mt-5 border-t border-[#B6B09F] pt-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <FileText className="h-3.5 w-3.5 text-amber-400" />
                {group.notes_count || 0} Notes
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                {group.images_count || 0} Gambar
              </span>
            </div>

            <div className="flex items-center gap-1 text-slate-500">
              <Calendar className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <Link
            href={`/groups/${group.id}`}
            className="mt-3 flex items-center justify-center gap-1.5 w-full rounded-lg bg-slate-800/80 py-2 text-xs font-semibold text-slate-300 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all"
          >
            <span>Buka Detail Pertandingan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Hapus Pertandingan?"
        message={`Grup "${group.title}" beserta seluruh catatan dan gambarnya akan dihapus permanen.`}
        confirmText="Hapus Pertandingan"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
