'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Edit2,
  Trash2,
  Plus,
  FileText,
  Image as ImageIcon,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { DraftGroup, Note, ImageRecord } from '@/lib/types';
import { api } from '@/lib/api';
import { NoteCard } from '@/components/NoteCard';
import { NoteModal } from '@/components/NoteModal';
import { ImageCard } from '@/components/ImageCard';
import { ImageUploadModal } from '@/components/ImageUploadModal';
import { GroupModal } from '@/components/GroupModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GroupDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const groupId = resolvedParams.id;

  const [group, setGroup] = useState<DraftGroup | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active section tab
  const [activeTab, setActiveTab] = useState<'notes' | 'images'>('notes');

  // Group Edit & Delete Modals
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isDeleteGroupOpen, setIsDeleteGroupOpen] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

  // Note Modal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Image Upload Modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [groupData, notesData, imagesData] = await Promise.all([
        api.getGroup(groupId),
        api.getNotes(groupId),
        api.getImages(groupId),
      ]);
      setGroup(groupData);
      setNotes(notesData);
      setImages(imagesData);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat detail pertandingan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [groupId]);

  // Group Handlers
  const handleUpdateGroup = async (data: { title: string; description?: string }) => {
    const updated = await api.updateGroup(groupId, data);
    setGroup(updated);
  };

  const handleDeleteGroup = async () => {
    try {
      setIsDeletingGroup(true);
      await api.deleteGroup(groupId);
      router.push('/');
    } finally {
      setIsDeletingGroup(false);
    }
  };

  // Note Handlers
  const handleCreateOrUpdateNote = async (data: { title: string; content: string }) => {
    try {
      setIsSubmittingNote(true);
      if (editingNote) {
        const updated = await api.updateNote(editingNote.id, data);
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      } else {
        const created = await api.createNote(groupId, data);
        setNotes((prev) => [created, ...prev]);
      }
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    await api.deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const openCreateNote = () => {
    setEditingNote(null);
    setIsNoteModalOpen(true);
  };

  const openEditNote = (note: Note) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  // Image Handlers
  const handleUploadImage = async (file: File, caption?: string) => {
    try {
      setIsUploadingImage(true);
      const uploaded = await api.uploadImage(groupId, file, caption);
      setImages((prev) => [uploaded, ...prev]);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    await api.deleteImage(id);
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <RefreshCw className="h-8 w-8 text-amber-400 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-400">Memuat detail pertandingan...</p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-8 text-center max-w-lg mx-auto mt-10">
        <h3 className="text-base font-semibold text-red-300">Pertandingan Tidak Ditemukan</h3>
        <p className="text-sm text-red-400 mt-2">{error || 'Data pertandingan tidak tersedia atau sudah dihapus.'}</p>
        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(group.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      {/* Back link & Top bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Daftar Pertandingan</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditGroupOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#B6B09F] bg-[#1D1616] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Nama/Deskripsi</span>
          </button>
          <button
            onClick={() => setIsDeleteGroupOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-900/50 bg-red-950/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/30 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Hapus</span>
          </button>
        </div>
      </div>

      {/* Group Header Card */}
      <div className="rounded-2xl border border-[#B6B09F] bg-[#1D1616] p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {group.title}
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
            {group.description || 'Tidak ada deskripsi atau catatan pengantar untuk pertandingan ini.'}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-4 border-t border-[#B6B09F]">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span>Dibuat pada {formattedDate}</span>
            </span>
            <span className="text-slate-700">&bull;</span>
            <span className="flex items-center gap-1 font-medium text-amber-400">
              <FileText className="h-3.5 w-3.5" />
              <span>{notes.length} Catatan</span>
            </span>
            <span className="text-slate-700">&bull;</span>
            <span className="flex items-center gap-1 font-medium text-emerald-400">
              <ImageIcon className="h-3.5 w-3.5" />
              <span>{images.length} Screenshot</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-[#B6B09F]">
        <div className="flex gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 border-b-2 py-3 px-2 text-sm font-semibold transition-all ${
              activeTab === 'notes'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Catatan Strategi & Draft ({notes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('images')}
            className={`flex items-center gap-2 border-b-2 py-3 px-2 text-sm font-semibold transition-all ${
              activeTab === 'images'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Screenshot Pertandingan ({images.length})</span>
          </button>
        </div>

        {/* Action Button for Active Tab */}
        <div>
          {activeTab === 'notes' ? (
            <button
              onClick={openCreateNote}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow-sm shadow-amber-500/20 hover:bg-amber-300 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Catatan</span>
            </button>
          ) : (
            <button
              onClick={() => setIsImageModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow-sm shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Gambar</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Notes Section */}
      {activeTab === 'notes' && (
        <div>
          {notes.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-[#B6B09F] bg-[#1D1616]/60 p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="text-base font-semibold text-white">Belum ada catatan strategi</h4>
              <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto">
                Tuliskan analisis hero priority ban/pick, counter hero musuh, atau catatan evaluasi blunder match ini.
              </p>
              <button
                onClick={openCreateNote}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-300 transition-colors shadow-sm shadow-amber-500/20"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Catatan Pertama</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={openEditNote}
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Images Section */}
      {activeTab === 'images' && (
        <div>
          {images.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-[#B6B09F] bg-[#1D1616]/60 p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                <ImageIcon className="h-6 w-6" />
              </div>
              <h4 className="text-base font-semibold text-white">Belum ada screenshot yang diunggah</h4>
              <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto">
                Simpan screenshot layar draft pick & ban atau hasil akhir scoreboard pertandingan ini untuk arsip tim.
              </p>
              <button
                onClick={() => setIsImageModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm shadow-emerald-500/20"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Screenshot Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {images.map((image) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  onDelete={handleDeleteImage}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <GroupModal
        isOpen={isEditGroupOpen}
        group={group}
        isLoading={false}
        onClose={() => setIsEditGroupOpen(false)}
        onSubmit={handleUpdateGroup}
      />

      <ConfirmDialog
        isOpen={isDeleteGroupOpen}
        title="Hapus Pertandingan Ini?"
        message={`Pertandingan "${group.title}" beserta seluruh catatan dan screenshot di dalamnya akan dihapus secara permanen.`}
        confirmText="Hapus Seluruhnya"
        isLoading={isDeletingGroup}
        onConfirm={handleDeleteGroup}
        onClose={() => setIsDeleteGroupOpen(false)}
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        note={editingNote}
        isLoading={isSubmittingNote}
        onClose={() => setIsNoteModalOpen(false)}
        onSubmit={handleCreateOrUpdateNote}
      />

      <ImageUploadModal
        isOpen={isImageModalOpen}
        isLoading={isUploadingImage}
        onClose={() => setIsImageModalOpen(false)}
        onUpload={handleUploadImage}
      />
    </div>
  );
}
