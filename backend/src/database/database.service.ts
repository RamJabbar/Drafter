import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DatabaseService
  implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL belum diset. Pastikan environment variable DATABASE_URL tersedia.',
      );
    }

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async onModuleInit() {
    try {
      await this.pool.query('SELECT 1');
      this.logger.log(
        'Successfully connected to PostgreSQL database',
      );
      await this.initSchema();
    } catch (error) {
      this.logger.error(
        `Failed to connect to PostgreSQL database: ${error.message}`,
      );
      throw error;
    }
  }

  private async initSchema() {
    try {
      const candidatePaths = [
        path.join(__dirname, 'schema.sql'),
        path.join(process.cwd(), 'src', 'database', 'schema.sql'),
        path.join(process.cwd(), 'dist', 'database', 'schema.sql'),
      ];

      const schemaPath = candidatePaths.find((p) => fs.existsSync(p));
      let sql = '';

      if (schemaPath) {
        sql = fs.readFileSync(schemaPath, 'utf8');
      } else {
        // Fallback schema definition for serverless bundle
        sql = `
          CREATE EXTENSION IF NOT EXISTS "pgcrypto";

          CREATE TABLE IF NOT EXISTS draft_groups (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              title VARCHAR(255) NOT NULL,
              description TEXT,
              created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS notes (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              group_id UUID NOT NULL REFERENCES draft_groups(id) ON DELETE CASCADE,
              title VARCHAR(255) NOT NULL,
              content TEXT NOT NULL,
              created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS images (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              group_id UUID NOT NULL REFERENCES draft_groups(id) ON DELETE CASCADE,
              image_url TEXT NOT NULL,
              caption VARCHAR(255),
              created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_notes_group_id ON notes(group_id);
          CREATE INDEX IF NOT EXISTS idx_images_group_id ON images(group_id);
        `;
      }

      await this.pool.query(sql);
      this.logger.log('Database schema verified / initialized');
    } catch (error) {
      this.logger.error('Error executing schema.sql:', error.message);
    }
  }

  async query<T = any>(
    text: string,
    params?: any[],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('PostgreSQL connection pool closed');
  }
}