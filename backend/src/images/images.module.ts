import { Module } from '@nestjs/common';
import { GroupImagesController, ImagesController } from './images.controller';
import { ImagesService } from './images.service';

@Module({
  controllers: [GroupImagesController, ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
