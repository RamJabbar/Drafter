import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import * as fs from 'fs';
import { DatabaseModule } from './database/database.module';
import { GroupsModule } from './groups/groups.module';
import { NotesModule } from './notes/notes.module';
import { ImagesModule } from './images/images.module';

const uploadsDir = path.join(process.cwd(), 'uploads');
const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL_ENV;
const staticImports = (!isVercel && fs.existsSync(uploadsDir))
  ? [
      ServeStaticModule.forRoot({
        rootPath: uploadsDir,
        serveRoot: '/uploads',
      }),
    ]
  : [];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...staticImports,
    DatabaseModule,
    GroupsModule,
    NotesModule,
    ImagesModule,
  ],
})
export class AppModule {}
