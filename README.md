# Drafter - Mobile Legends Draft & Scrim Notes

Drafter adalah aplikasi web catatan dan review pertandingan/scrim Mobile Legends dengan antarmuka yang bersih, modern, dan responsif. Dirancang khusus untuk membantu tim esports, kapten tim, dan analis mencatat strategi drafting (hero priority pick/ban), evaluasi match, dan mengarsipkan tangkapan layar (screenshot) pertandingan.

---

## 🛠️ Tech Stack

- **Frontend**:
  - Next.js (App Router)
  - TypeScript
  - Tailwind CSS
  - Lucide Icons
- **Backend**:
  - NestJS
  - TypeScript
  - PostgreSQL dengan driver native `pg` (Connection Pooling & Parameterized SQL Queries)
  - Multer (Local Image Storage & Static Serving)
  - Class Validator & Class Transformer
- **Database**:
  - PostgreSQL (`draft_groups`, `notes`, `images` dengan UUID & `ON DELETE CASCADE`)

---

## 📁 Struktur Proyek

```text
Drafter/
├── backend/                  # NestJS REST API
│   ├── src/
│   │   ├── database/         # PostgreSQL pg Pool provider & auto schema initializer
│   │   │   ├── database.module.ts
│   │   │   ├── database.service.ts
│   │   │   └── schema.sql
│   │   ├── groups/           # Groups CRUD (Pertandingan / Scrim)
│   │   ├── notes/            # Notes CRUD (Catatan strategi & evaluasi draft)
│   │   ├── images/           # Images upload & delete (Screenshots pertandingan)
│   │   ├── uploads/          # Folder file upload lokal
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # Next.js App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx      # Dashboard daftar pertandingan
│   │   │   └── groups/[id]/  # Detail pertandingan (Catatan & Screenshot)
│   │   ├── components/       # Komponen UI (Navbar, Card, Modal, Dialog)
│   │   ├── lib/              # API Client & TypeScript types
│   ├── .env.local
│   ├── package.json
│   └── tailwind.config.ts
└── README.md
```

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Prasyarat
- **Node.js**: v18+ (disarankan v20 atau v24)
- **PostgreSQL**: Pastikan service PostgreSQL sudah berjalan di komputer Anda.

### 2. Konfigurasi Database PostgreSQL
Pastikan database `drafter_db` sudah dibuat di PostgreSQL Anda.
Anda dapat membuatnya melalui SQL shell / pgAdmin:
```sql
CREATE DATABASE drafter_db;
```

Buka file `backend/.env` dan sesuaikan koneksi PostgreSQL (`DATABASE_URL`) Anda:
```env
PORT=4000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/drafter_db
# Atau untuk Neon PostgreSQL di production:
# DATABASE_URL=postgresql://neondb_owner:password@ep-xyz.us-east-2.aws.neon.tech/drafter?sslmode=require
FRONTEND_URL=http://localhost:3000
```

> **Catatan**: Tabel `draft_groups`, `notes`, dan `images` beserta indeksnya akan **otomatis dibuat** oleh backend saat pertama kali dijalankan menggunakan `schema.sql`.

---

### 3. Menjalankan Backend (NestJS)

Buka terminal di folder `backend`:
```bash
cd backend
npm run start:dev
```
Backend akan berjalan di: `http://localhost:4000`

---

### 4. Menjalankan Frontend (Next.js)

Buka terminal baru di folder `frontend`:
```bash
cd frontend
npm run dev
```
Frontend akan berjalan di: `http://localhost:3000`

Buka browser Anda dan kunjungi: **`http://localhost:3000`**

---

## 🧪 Menguji Fitur Aplikasi (Manual Walkthrough)

1. **Membuat Pertandingan / Scrim Baru**:
   - Di dashboard, klik tombol **"Tambah Pertandingan"**.
   - Isi judul (misal: *"Scrim vs SMA 54 (Game 1)"*) dan deskripsi strategi.
   - Klik **"Buat Pertandingan"**. Card pertandingan akan langsung muncul di halaman utama.

2. **Melihat Detail & Mengelola Catatan (Notes)**:
   - Klik **"Buka Detail Pertandingan"** pada card yang baru dibuat.
   - Pada tab **"Catatan Strategi & Draft"**, klik **"Tambah Catatan"**.
   - Masukkan judul catatan (misal: *"Priority Pick Valentina & Counter Claude"*).
   - Anda juga dapat menggunakan tombol **"Template cepat"** (Draft / Review) untuk format instan.
   - Klik **"Simpan Catatan"**. Catatan dapat diedit, disalin ke clipboard dengan 1-klik, atau dihapus.

3. **Mengunggah Screenshot Pertandingan (Images)**:
   - Pindah ke tab **"Screenshot Pertandingan"**.
   - Klik **"Upload Gambar"**.
   - Pilih gambar tangkapan layar draft hero atau scoreboard post-game match.
   - Isi caption opsional (misal: *"Draft Akhir Game 1"*).
   - Klik **"Upload Gambar"**.
   - Klik pada card gambar untuk membuka mode **Lightbox / Zoom preview**.
   - Klik icon tempat sampah pada gambar jika ingin menghapus foto tersebut.

4. **Pencarian Cepat**:
   - Kembali ke halaman utama (`/`), gunakan kolom pencarian untuk menyaring pertandingan berdasarkan lawan atau catatan deskripsi.

---

## 📡 Daftar Endpoint API (REST)

### Groups
- `GET /groups`: Mengambil seluruh daftar pertandingan beserta jumlah notes dan gambar.
- `GET /groups/:id`: Mengambil detail spesifik satu pertandingan.
- `POST /groups`: Membuat pertandingan baru (`{ title, description }`).
- `PATCH /groups/:id`: Mengubah judul atau deskripsi pertandingan.
- `DELETE /groups/:id`: Menghapus pertandingan beserta semua catatan dan gambar di dalamnya (`CASCADE`).

### Notes
- `GET /groups/:groupId/notes`: Mengambil seluruh catatan dalam satu pertandingan.
- `POST /groups/:groupId/notes`: Membuat catatan baru (`{ title, content }`).
- `PATCH /notes/:id`: Mengubah judul atau isi catatan.
- `DELETE /notes/:id`: Menghapus catatan.

### Images
- `GET /groups/:groupId/images`: Mengambil daftar screenshot dalam pertandingan.
- `POST /groups/:groupId/images`: Mengunggah gambar screenshot (multipart `file` + `caption`).
- `DELETE /images/:id`: Menghapus gambar dari database dan menghapus file fisiknya dari penyimpanan lokal.
