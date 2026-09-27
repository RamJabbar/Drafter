import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateNoteDto {
  @IsOptional()
  @IsString({ message: 'Judul harus berupa teks' })
  @MaxLength(255, { message: 'Judul maksimal 255 karakter' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Isi catatan harus berupa teks' })
  content?: string;
}
