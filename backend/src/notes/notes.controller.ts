import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotesService, Note } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Controller('groups/:groupId/notes')
export class GroupNotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async findByGroupId(
    @Param('groupId', ParseUUIDPipe) groupId: string,
  ): Promise<Note[]> {
    return this.notesService.findByGroupId(groupId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() createNoteDto: CreateNoteDto,
  ): Promise<Note> {
    return this.notesService.create(groupId, createNoteDto);
  }
}

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Note> {
    return this.notesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ): Promise<Note> {
    return this.notesService.update(id, updateNoteDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.notesService.remove(id);
  }
}
