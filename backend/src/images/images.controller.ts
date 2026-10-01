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
import { memoryStorage } from 'multer';
import { ImagesService, ImageRecord } from './images.service';
import { UploadImageDto } from './dto/upload-image.dto';

export const multerStorage = memoryStorage();

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
  constructor(private readonly imagesService: ImagesService) { }

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
    return this.imagesService.create(groupId, file, uploadImageDto.caption);
  }
}

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) { }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.imagesService.remove(id);
  }
}
