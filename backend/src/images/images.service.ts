import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { StorageService } from './storage.service';

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

  constructor(
    private readonly db: DatabaseService,
    private readonly storageService: StorageService,
  ) {}

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
    file: Express.Multer.File,
    caption?: string,
  ): Promise<ImageRecord> {
    const groupCheck = await this.db.query(
      'SELECT id FROM draft_groups WHERE id = $1',
      [groupId],
    );
    if (groupCheck.rows.length === 0) {
      throw new NotFoundException(`Draft group dengan ID "${groupId}" tidak ditemukan`);
    }

    // Delegate upload to StorageService (safe for Vercel, ready for Vercel Blob)
    const imageUrl = await this.storageService.upload(file);

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

    // Delete from storage service
    try {
      await this.storageService.delete(image.image_url);
    } catch (err) {
      this.logger.warn(`Could not delete file from storage: ${err.message}`);
    }

    return { message: 'Gambar berhasil dihapus', id };
  }
}
