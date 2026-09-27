import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty({ message: 'Judul catatan wajib diisi' })
  @IsString({ message: 'Judul harus berupa teks' })
  @MaxLength(255, { message: 'Judul maksimal 255 karakter' })
  title: string;

  @IsNotEmpty({ message: 'Isi catatan tidak boleh kosong' })
  @IsString({ message: 'Isi catatan harus berupa teks' })
  content: string;
}
