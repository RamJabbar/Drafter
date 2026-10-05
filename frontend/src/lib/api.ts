import {
  DraftGroup,
  Note,
  ImageRecord,
  CreateGroupPayload,
  UpdateGroupPayload,
  CreateNotePayload,
  UpdateNotePayload,
} from './types';

export function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (envUrl && envUrl.trim() !== '') {
    let cleanUrl = envUrl.trim().replace(/\/+$/, '');

    // Sanitasi jika environment variable tanpa sengaja menyertakan suffix /api atau /groups
    if (cleanUrl.endsWith('/api')) {
      cleanUrl = cleanUrl.slice(0, -4).replace(/\/+$/, '');
    } else if (cleanUrl.endsWith('/groups')) {
      cleanUrl = cleanUrl.slice(0, -7).replace(/\/+$/, '');
    }

    return cleanUrl;
  }

  // Fallback hanya diperbolehkan untuk local development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001';
  }

  // Di production, jangan membuat workaround yang diam-diam kembali ke localhost.
  throw new Error(
    'NEXT_PUBLIC_API_URL belum dikonfigurasi. Harap tentukan environment variable NEXT_PUBLIC_API_URL pada dashboard Vercel dengan URL backend Anda (contoh: https://drafter-backend.vercel.app).'
  );
}

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
  getBaseUrl(): string {
    return getBaseUrl();
  },

  getImageUrl(url: string): string {
    if (!url) return '';
    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('data:')
    ) {
      return url;
    }
    try {
      const baseUrl = getBaseUrl();
      return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    } catch {
      return url;
    }
  },

  // Groups
  async getGroups(): Promise<DraftGroup[]> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/groups`, { cache: 'no-store' });
    return handleResponse<DraftGroup[]>(res);
  },

  async getGroup(id: string): Promise<DraftGroup> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/groups/${id}`, { cache: 'no-store' });
    return handleResponse<DraftGroup>(res);
  },

  async createGroup(payload: CreateGroupPayload): Promise<DraftGroup> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<DraftGroup>(res);
  },

  async updateGroup(id: string, payload: UpdateGroupPayload): Promise<DraftGroup> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/groups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<DraftGroup>(res);
  },

  async deleteGroup(id: string): Promise<{ message: string; id: string }> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/groups/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string; id: string }>(res);
  },

  // Notes
  async getNotes(groupId: string): Promise<Note[]> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/groups/${groupId}/notes`, {
      cache: 'no-store',
    });
    return handleResponse<Note[]>(res);
  },

  async createNote(groupId: string, payload: CreateNotePayload): Promise<Note> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/groups/${groupId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Note>(res);
  },

  async updateNote(id: string, payload: UpdateNotePayload): Promise<Note> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Note>(res);
  },

  async deleteNote(id: string): Promise<{ message: string; id: string }> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/notes/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string; id: string }>(res);
  },

  // Images
  async getImages(groupId: string): Promise<ImageRecord[]> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/groups/${groupId}/images`, {
      cache: 'no-store',
    });
    return handleResponse<ImageRecord[]>(res);
  },

  async uploadImage(
    groupId: string,
    file: File,
    caption?: string,
  ): Promise<ImageRecord> {
    const baseUrl = getBaseUrl();
    const formData = new FormData();
    formData.append('file', file);
    if (caption && caption.trim()) {
      formData.append('caption', caption.trim());
    }

    const res = await fetch(`${baseUrl}/groups/${groupId}/images`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<ImageRecord>(res);
  },

  async deleteImage(id: string): Promise<{ message: string; id: string }> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/images/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string; id: string }>(res);
  },
};
