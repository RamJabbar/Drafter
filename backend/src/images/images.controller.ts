import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { ImagesService, ImageRecord } from './images.service';
import { UploadImageDto } from './dto/upload-image.dto';

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const multerStorage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `draft-${uniqueSuffix}${ext}`);
  },
});

export const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
    return cb(
      new BadRequestException(
        'Hanya format gambar yang diperbolehkan (jpg, jpeg, png, gif, webp)',
      ),
      false,
    );
  }
  cb(null, true);
};

@Controller('groups/:groupId/images')
export class GroupImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  async findByGroupId(
    @Param('groupId', ParseUUIDPipe) groupId: string,
  ): Promise<ImageRecord[]> {
    return this.imagesService.findByGroupId(groupId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multerStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
    }),
  )
  async upload(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadImageDto: UploadImageDto,
  ): Promise<ImageRecord> {
    if (!file) {
      throw new BadRequestException('File gambar wajib diunggah (field: file)');
    }
    return this.imagesService.create(groupId, file.filename, uploadImageDto.caption);
  }
}

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.imagesService.remove(id);
  }
}
