import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadImageDto {
  @IsOptional()
  @IsString({ message: 'Caption harus berupa teks' })
  @MaxLength(255, { message: 'Caption maksimal 255 karakter' })
  caption?: string;
}
