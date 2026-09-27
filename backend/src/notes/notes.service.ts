import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

export interface Note {
  id: string;
  group_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class NotesService {
  constructor(private readonly db: DatabaseService) {}

  async findByGroupId(groupId: string): Promise<Note[]> {
    // Verify group exists
    const groupCheck = await this.db.query(
      'SELECT id FROM draft_groups WHERE id = $1',
      [groupId],
    );
    if (groupCheck.rows.length === 0) {
      throw new NotFoundException(`Draft group dengan ID "${groupId}" tidak ditemukan`);
    }

    const query = `
      SELECT id, group_id, title, content, created_at, updated_at
      FROM notes
      WHERE group_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await this.db.query<Note>(query, [groupId]);
    return result.rows;
  }

  async findOne(id: string): Promise<Note> {
    const query = `
      SELECT id, group_id, title, content, created_at, updated_at
      FROM notes
      WHERE id = $1;
    `;
    const result = await this.db.query<Note>(query, [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException(`Catatan dengan ID "${id}" tidak ditemukan`);
    }
    return result.rows[0];
  }

  async create(groupId: string, createNoteDto: CreateNoteDto): Promise<Note> {
    // Verify group exists
    const groupCheck = await this.db.query(
      'SELECT id FROM draft_groups WHERE id = $1',
      [groupId],
    );
    if (groupCheck.rows.length === 0) {
      throw new NotFoundException(`Draft group dengan ID "${groupId}" tidak ditemukan`);
    }

    const { title, content } = createNoteDto;
    const query = `
      INSERT INTO notes (group_id, title, content)
      VALUES ($1, $2, $3)
      RETURNING id, group_id, title, content, created_at, updated_at;
    `;
    const result = await this.db.query<Note>(query, [
      groupId,
      title.trim(),
      content.trim(),
    ]);
    return result.rows[0];
  }

  async update(id: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    await this.findOne(id);

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updateNoteDto.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(updateNoteDto.title.trim());
    }

    if (updateNoteDto.content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(updateNoteDto.content.trim());
    }

    if (updates.length === 0) {
      return this.findOne(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE notes
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, group_id, title, content, created_at, updated_at;
    `;

    const result = await this.db.query<Note>(query, values);
    return result.rows[0];
  }

  async remove(id: string): Promise<{ message: string; id: string }> {
    await this.findOne(id);
    const query = `DELETE FROM notes WHERE id = $1;`;
    await this.db.query(query, [id]);
    return { message: 'Catatan berhasil dihapus', id };
  }
}
