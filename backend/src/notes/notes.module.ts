import { Module } from '@nestjs/common';
import { GroupNotesController, NotesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  controllers: [GroupNotesController, NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
