import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty({ message: 'Judul group pertandingan wajib diisi' })
  @IsString({ message: 'Judul harus berupa teks' })
  @MaxLength(255, { message: 'Judul maksimal 255 karakter' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Deskripsi harus berupa teks' })
  description?: string;
}
