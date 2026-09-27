import {
  DraftGroup,
  Note,
  ImageRecord,
  CreateGroupPayload,
  UpdateGroupPayload,
  CreateNotePayload,
  UpdateNotePayload,
} from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Request gagal (${res.status} ${res.statusText})`;
    try {
      const data = await res.json();
      if (data.message) {
        errorMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      }
    } catch {
      // fallback to default text
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Helper to format full image URL
  getImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  },

  // Groups
  async getGroups(): Promise<DraftGroup[]> {
    const res = await fetch(`${BASE_URL}/groups`, { cache: 'no-store' });
    return handleResponse<DraftGroup[]>(res);
  },

  async getGroup(id: string): Promise<DraftGroup> {
    const res = await fetch(`${BASE_URL}/groups/${id}`, { cache: 'no-store' });
    return handleResponse<DraftGroup>(res);
  },

  async createGroup(payload: CreateGroupPayload): Promise<DraftGroup> {
    const res = await fetch(`${BASE_URL}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<DraftGroup>(res);
  },

  async updateGroup(id: string, payload: UpdateGroupPayload): Promise<DraftGroup> {
    const res = await fetch(`${BASE_URL}/groups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<DraftGroup>(res);
  },

  async deleteGroup(id: string): Promise<{ message: string; id: string }> {
    const res = await fetch(`${BASE_URL}/groups/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string; id: string }>(res);
  },

  // Notes
  async getNotes(groupId: string): Promise<Note[]> {
    const res = await fetch(`${BASE_URL}/groups/${groupId}/notes`, {
      cache: 'no-store',
    });
    return handleResponse<Note[]>(res);
  },

  async createNote(groupId: string, payload: CreateNotePayload): Promise<Note> {
    const res = await fetch(`${BASE_URL}/groups/${groupId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Note>(res);
  },

  async updateNote(id: string, payload: UpdateNotePayload): Promise<Note> {
    const res = await fetch(`${BASE_URL}/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Note>(res);
  },

  async deleteNote(id: string): Promise<{ message: string; id: string }> {
    const res = await fetch(`${BASE_URL}/notes/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string; id: string }>(res);
  },

  // Images
  async getImages(groupId: string): Promise<ImageRecord[]> {
    const res = await fetch(`${BASE_URL}/groups/${groupId}/images`, {
      cache: 'no-store',
    });
    return handleResponse<ImageRecord[]>(res);
  },

  async uploadImage(
    groupId: string,
    file: File,
    caption?: string,
  ): Promise<ImageRecord> {
    const formData = new FormData();
    formData.append('file', file);
    if (caption && caption.trim()) {
      formData.append('caption', caption.trim());
    }

    const res = await fetch(`${BASE_URL}/groups/${groupId}/images`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<ImageRecord>(res);
  },

  async deleteImage(id: string): Promise<{ message: string; id: string }> {
    const res = await fetch(`${BASE_URL}/images/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string; id: string }>(res);
  },
};
