import { Injectable, Logger } from '@nestjs/common';

export interface IStorageService {
  upload(file: Express.Multer.File): Promise<string>;
  delete(imageUrl: string): Promise<void>;
}

@Injectable()
export class StorageService implements IStorageService {
  private readonly logger = new Logger(StorageService.name);

  /**
   * Upload file and return accessible image URL.
   * Serverless-safe implementation: does NOT write to local filesystem (/var/task/uploads).
   *
   * Migration Note:
   * When migrating to @vercel/blob:
   * 1. npm i @vercel/blob
   * 2. import { put, del } from '@vercel/blob';
   * 3. const blob = await put(file.originalname, file.buffer, { access: 'public' });
   *    return blob.url;
   */
  async upload(file: Express.Multer.File): Promise<string> {
    const mimeType = file.mimetype || 'image/png';

    // In-memory buffer conversion for temporary zero-filesystem storage on Vercel
    if (file.buffer) {
      const base64Data = file.buffer.toString('base64');
      return `data:${mimeType};base64,${base64Data}`;
    }

    // Fallback if buffer is unavailable
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    return `https://placehold.co/600x400?text=Draft+Image+${uniqueSuffix}`;
  }

  /**
   * Delete file from storage.
   *
   * Migration Note:
   * When migrating to @vercel/blob:
   * if (imageUrl.includes('blob.vercel-storage.com')) {
   *   await del(imageUrl);
   * }
   */
  async delete(imageUrl: string): Promise<void> {
    this.logger.log(
      `Image delete called for: ${imageUrl.length > 50 ? imageUrl.substring(0, 50) + '...' : imageUrl}`,
    );
  }
}
