export interface DraftGroup {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  notes_count?: number;
  images_count?: number;
}

export interface Note {
  id: string;
  group_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ImageRecord {
  id: string;
  group_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

export interface CreateGroupPayload {
  title: string;
  description?: string;
}

export interface UpdateGroupPayload {
  title?: string;
  description?: string;
}

export interface CreateNotePayload {
  title: string;
  content: string;
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
}
