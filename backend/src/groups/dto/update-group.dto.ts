import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateGroupDto {
  @IsOptional()
  @IsString({ message: 'Judul harus berupa teks' })
  @MaxLength(255, { message: 'Judul maksimal 255 karakter' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Deskripsi harus berupa teks' })
  description?: string;
}
