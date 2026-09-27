'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Swords, FileText, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { DraftGroup } from '@/lib/types';
import { api } from '@/lib/api';
import { GroupCard } from '@/components/GroupCard';
import { GroupModal } from '@/components/GroupModal';

export default function HomePage() {
  const [groups, setGroups] = useState<DraftGroup[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<DraftGroup | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getGroups();
      setGroups(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat daftar pertandingan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateOrUpdate = async (data: { title: string; description?: string }) => {
    try {
      setIsSubmitting(true);
      if (editingGroup) {
        await api.updateGroup(editingGroup.id, data);
      } else {
        await api.createGroup(data);
      }
      await fetchGroups();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await api.deleteGroup(id);
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const openCreateModal = () => {
    setEditingGroup(null);
    setIsModalOpen(true);
  };

  const openEditModal = (group: DraftGroup) => {
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  // Filtered groups based on search input
  const filteredGroups = groups.filter((g) => {
    const q = search.toLowerCase();
    return (
      g.title.toLowerCase().includes(q) ||
      (g.description && g.description.toLowerCase().includes(q))
    );
  });

  const totalNotes = groups.reduce((acc, g) => acc + (g.notes_count || 0), 0);
  const totalImages = groups.reduce((acc, g) => acc + (g.images_count || 0), 0);

  return (
    <div className="space-y-8">
      {/* Hero / Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#B6B09F] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Rekap Draft
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Nyimpen Draft
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm shadow-amber-500/20 hover:bg-amber-300 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Pertandingan</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#B6B09F] bg-[#1D1616] p-4 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Swords className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Total Scrim/Match</span>
            <p className="text-xl font-bold text-white">{groups.length}</p>
          </div>
        </div>

        <div className="rounded-xl border border-[#B6B09F] bg-[#1D1616] p-4 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Catatan Strategi</span>
            <p className="text-xl font-bold text-white">{totalNotes}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-center gap-3 max-w-xl mx-auto w-full">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Match mana yang mau dicari"
            className="w-full rounded-lg border border-[#B6B09F] bg-[#1D1616] py-2 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
          />
        </div>

        <button
          onClick={fetchGroups}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-lg border border-[#B6B09F] bg-[#1D1616] px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
          title="Muat ulang data"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Segarkan</span>
        </button>
      </div>

      {/* Content Area */}
      {isLoading && groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <RefreshCw className="h-8 w-8 text-amber-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-400">Memuat data pertandingan...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-6 text-center">
          <p className="text-sm font-semibold text-red-300">Gagal terhubung ke database atau backend</p>
          <p className="text-xs text-red-400 mt-1">{error}</p>
          <button
            onClick={fetchGroups}
            className="mt-4 rounded-lg bg-red-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#B6B09F] bg-[#1D1616]/40 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
            <Swords className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white">
            {search ? 'Tidak ada pertandingan yang cocok' : 'Belum ada data pertandingan'}
          </h3>
          <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto">
            {search
              ? `Tidak ditemukan hasil dengan kata kunci "${search}". Coba kata kunci lain.`
              : 'Buat catatan pertandingan scrim pertamamu untuk mulai menyusun strategi draft hero MLBB.'}
          </p>
          {!search && (
            <button
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition-colors shadow-sm shadow-amber-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Buat Pertandingan Sekarang</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal Tambah / Edit Group */}
      <GroupModal
        isOpen={isModalOpen}
        group={editingGroup}
        isLoading={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
      />
    </div>
  );
}
