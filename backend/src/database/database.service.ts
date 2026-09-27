import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'drafter_db',
    });
  }

  async onModuleInit() {
    try {
      // Test connection
      const client = await this.pool.connect();
      this.logger.log('Successfully connected to PostgreSQL database');
      client.release();

      // Initialize schema
      await this.initSchema();
    } catch (error) {
      this.logger.error('Failed to connect to PostgreSQL database:', error.message);
      this.logger.warn(
        'Make sure PostgreSQL is running and the database specified in .env exists. ' +
        'You can create it with: CREATE DATABASE drafter_db;',
      );
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

      if (schemaPath) {
        const sql = fs.readFileSync(schemaPath, 'utf8');
        await this.pool.query(sql);
        this.logger.log(`Database schema verified / initialized from ${schemaPath}`);
      } else {
        this.logger.warn('Could not locate schema.sql file');
      }
    } catch (error) {
      this.logger.error('Error executing schema.sql:', error.message);
    }
  }

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('PostgreSQL connection pool closed');
  }
}
