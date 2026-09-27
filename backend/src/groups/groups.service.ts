import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

export interface DraftGroup {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  notes_count?: number;
  images_count?: number;
}

@Injectable()
export class GroupsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<DraftGroup[]> {
    const query = `
      SELECT 
        g.id,
        g.title,
        g.description,
        g.created_at,
        g.updated_at,
        COUNT(DISTINCT n.id)::int AS notes_count,
        COUNT(DISTINCT i.id)::int AS images_count
      FROM draft_groups g
      LEFT JOIN notes n ON n.group_id = g.id
      LEFT JOIN images i ON i.group_id = g.id
      GROUP BY g.id
      ORDER BY g.created_at DESC;
    `;
    const result = await this.db.query<DraftGroup>(query);
    return result.rows;
  }

  async findOne(id: string): Promise<DraftGroup> {
    const query = `
      SELECT 
        g.id,
        g.title,
        g.description,
        g.created_at,
        g.updated_at,
        COUNT(DISTINCT n.id)::int AS notes_count,
        COUNT(DISTINCT i.id)::int AS images_count
      FROM draft_groups g
      LEFT JOIN notes n ON n.group_id = g.id
      LEFT JOIN images i ON i.group_id = g.id
      WHERE g.id = $1
      GROUP BY g.id;
    `;
    const result = await this.db.query<DraftGroup>(query, [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException(`Draft group dengan ID "${id}" tidak ditemukan`);
    }
    return result.rows[0];
  }

  async create(createGroupDto: CreateGroupDto): Promise<DraftGroup> {
    const { title, description } = createGroupDto;
    const query = `
      INSERT INTO draft_groups (title, description)
      VALUES ($1, $2)
      RETURNING id, title, description, created_at, updated_at;
    `;
    const result = await this.db.query<DraftGroup>(query, [title.trim(), description?.trim() || null]);
    return result.rows[0];
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<DraftGroup> {
    // Check existence first
    await this.findOne(id);

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updateGroupDto.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(updateGroupDto.title.trim());
    }

    if (updateGroupDto.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(updateGroupDto.description ? updateGroupDto.description.trim() : null);
    }

    if (updates.length === 0) {
      return this.findOne(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE draft_groups
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, title, description, created_at, updated_at;
    `;

    const result = await this.db.query<DraftGroup>(query, values);
    return result.rows[0];
  }

  async remove(id: string): Promise<{ message: string; id: string }> {
    await this.findOne(id);
    const query = `DELETE FROM draft_groups WHERE id = $1;`;
    await this.db.query(query, [id]);
    return { message: 'Draft group berhasil dihapus', id };
  }
}
