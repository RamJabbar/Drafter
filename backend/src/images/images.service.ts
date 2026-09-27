import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as fs from 'fs';
import * as path from 'path';

export interface ImageRecord {
  id: string;
  group_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(private readonly db: DatabaseService) {}

  async findByGroupId(groupId: string): Promise<ImageRecord[]> {
    const groupCheck = await this.db.query(
      'SELECT id FROM draft_groups WHERE id = $1',
      [groupId],
    );
    if (groupCheck.rows.length === 0) {
      throw new NotFoundException(`Draft group dengan ID "${groupId}" tidak ditemukan`);
    }

    const query = `
      SELECT id, group_id, image_url, caption, created_at
      FROM images
      WHERE group_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await this.db.query<ImageRecord>(query, [groupId]);
    return result.rows;
  }

  async findOne(id: string): Promise<ImageRecord> {
    const query = `
      SELECT id, group_id, image_url, caption, created_at
      FROM images
      WHERE id = $1;
    `;
    const result = await this.db.query<ImageRecord>(query, [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException(`Gambar dengan ID "${id}" tidak ditemukan`);
    }
    return result.rows[0];
  }

  async create(
    groupId: string,
    filename: string,
    caption?: string,
  ): Promise<ImageRecord> {
    const groupCheck = await this.db.query(
      'SELECT id FROM draft_groups WHERE id = $1',
      [groupId],
    );
    if (groupCheck.rows.length === 0) {
      throw new NotFoundException(`Draft group dengan ID "${groupId}" tidak ditemukan`);
    }

    const imageUrl = `/uploads/${filename}`;
    const query = `
      INSERT INTO images (group_id, image_url, caption)
      VALUES ($1, $2, $3)
      RETURNING id, group_id, image_url, caption, created_at;
    `;
    const result = await this.db.query<ImageRecord>(query, [
      groupId,
      imageUrl,
      caption ? caption.trim() : null,
    ]);
    return result.rows[0];
  }

  async remove(id: string): Promise<{ message: string; id: string }> {
    const image = await this.findOne(id);

    // Delete record from database
    const deleteQuery = `DELETE FROM images WHERE id = $1;`;
    await this.db.query(deleteQuery, [id]);

    // Attempt to delete physical file from disk
    try {
      const filename = path.basename(image.image_url);
      const filePath = path.join(process.cwd(), 'uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Deleted file from disk: ${filePath}`);
      }
    } catch (err) {
      this.logger.warn(`Could not delete physical file: ${err.message}`);
    }

    return { message: 'Gambar berhasil dihapus', id };
  }
}
