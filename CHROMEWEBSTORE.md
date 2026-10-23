# Chrome Web Store Listing & Documentation: MagangHub AI Assistant

Dokumen ini berisi seluruh metadata, justifikasi izin (permissions justification), kebijakan privasi (privacy policy), dan panduan publikasi untuk ekstensi **MagangHub AI Report Assistant** di Chrome Web Store.

---

## 1. Store Listing Information

### Nama Ekstensi
- **Indonesian**: `MagangHub AI Report Assistant - Pengisi Laporan Otomatis`
- **English**: `MagangHub AI Report Assistant - Daily Log Filler`

### Ringkasan Singkat (Short Description - Maks. 132 Karakter)
- **ID**: `Asisten AI pintar untuk mengisi 3 kolom laporan harian MagangHub Kemnaker secara otomatis, cepat, dan memenuhi syarat min 100 karakter.`
- **EN**: `Smart AI assistant to automatically generate and fill daily internship reports on MagangHub Kemnaker with min 100 char compliance.`

### Kategori & Bahasa
- **Kategori**: `Productivity` (Produktivitas)
- **Bahasa Utama**: `Indonesian` (Bahasa Indonesia)

---

## 2. Deskripsi Lengkap (Detailed Store Description)

### Versi Bahasa Indonesia
```markdown
🚀 MagangHub AI Report Assistant — Solusi cerdas & cepat mengisi laporan harian MagangHub Kemnaker!

Apakah kamu sering bingung menyusun kata-kata formal atau sering terburu-buru mengisi laporan harian magang sebelum pulang kerja? MagangHub AI Assistant hadir untuk membantu kamu menyusun 3 bagian laporan magang (Aktivitas, Pembelajaran, dan Kendala) secara otomatis dan rapi hanya dari beberapa poin singkat.

✨ FITUR UNGGULAN:
1. ⚡ Generator Laporan Cerdas Berbasis Google Gemini:
   - Mengubah catatan mentah/poin kegiatan menjadi paragraf Bahasa Indonesia formal akademik yang terstruktur.
   - Menjamin panjang teks memenuhi standar minimal 100 karakter untuk masing-masing bagian.
2. 📝 Floating Action Button (FAB) yang Fleksibel:
   - Tombol asisten melayang langsung di portal Monev MagangHub.
   - Posisi tombol dapat di-drag & drop ke mana saja di layar dan otomatis mengingat posisinya.
3. 🧠 AI Contextual Memory (Memori Konteks Laporan):
   - AI secara cerdas membaca 1–5 laporan hari-hari sebelumnya sehingga memahami konteks tugas lanjutan (misal: "lanjutkan task kemarin") dan alur perkembangan pekerjaan terasa progresif tanpa repetisi kata.
4. 👁️ Live Preview & Live Character Counter:
   - Periksa dan sesuaikan kalimat sebelum disuntikkan ke form.
   - Indikator badge karakter live (Hijau jika >= 100 karakter, Merah jika kurang).
5. 📑 Pustaka Template Kustom:
   - Tersedia preset cepat untuk peran: Software Engineer, UI/UX Designer, Data & Admin, Digital Marketing, Training, dan WFH.
   - Kamu juga dapat membuat dan menyimpan template rutin kamu sendiri!
6. ⏰ Pengingat Absen & Notifikasi Desktop:
   - Alarm otomatis yang mengingatkan kamu saat jam pulang (default 17:00).
   - Opsi lewati akhir pekan (Sabtu & Minggu) dan langsung membuka halaman laporan hari ini.
7. 📜 Riwayat Laporan & Ekspor Logbook:
   - Seluruh laporan yang pernah dibuat tersimpan aman di browser kamu.
   - Ekspor seluruh riwayat ke format Markdown (.md), JSON, atau CSV untuk kebutuhan laporan akhir kampus/portofolio magang!
8. 🔒 Privasi Terjamin 100%:
   - API Key dan riwayat laporan tersimpan LOKAL di browser kamu. Tidak ada data yang dikirim ke server pihak ketiga manapun selain langsung ke endpoint resmi Google Generative AI.

CARA PENGGUNAAN:
1. Pasang ekstensi dan buka menu Pengaturan (Options) untuk memasukkan Google Gemini API Key gratis kamu dari aistudio.google.com/apikey.
2. Buka portal https://monev.maganghub.kemnaker.go.id pada menu Riwayat Laporan.
3. Klik tombol melayang AI di pojok kanan bawah, tulis poin kegiatan harianmu (atau pilih template), lalu klik "Generate".
4. Klik "Isi ke Form Laporan Sekarang" dan form kamu akan terisi otomatis!
```

---

## 3. Justifikasi Izin (Permissions Justification for CWS Review)

Semua izin yang digunakan dalam `manifest.json` memiliki alasan fungsional yang spesifik:

| Permission | Justification |
|---|---|
| `storage` | Digunakan untuk menyimpan preferensi pengguna (Gemini API Key, pilihan model AI, gaya bahasa, template kustom, koordinat posisi tombol FAB, dan arsip riwayat laporan lokal). |
| `alarms` | Digunakan untuk menjadwalkan alarm pengingat harian pada jam pulang kerja (misal pukul 17:00) agar pengguna tidak terlambat mengisi laporan. |
| `notifications` | Digunakan untuk menampilkan notifikasi desktop Chrome saat alarm pengingat berbunyi dengan tombol aksi langsung ke halaman Monev. |
| `scripting` | Digunakan untuk menyuntikkan interaksi asisten dan notifikasi in-page secara aman. |
| `activeTab` & `tabs` | Digunakan untuk mendeteksi status tab dan membuka/fokus ke halaman `https://monev.maganghub.kemnaker.go.id` saat pengguna mengklik pengingat atau tombol navigasi popup. |
| `host_permissions: https://monev.maganghub.kemnaker.go.id/*` | Diperlukan agar ekstensi dapat menyuntikkan tombol melayang asisten dan mengisi kolom formulir laporan pada domain portal resmi MagangHub. |
| `host_permissions: https://generativelanguage.googleapis.com/*` | Diperlukan untuk melakukan request API langsung ke endpoint Google Gemini guna memproses generasi teks laporan harian. |

---

## 4. Kebijakan Privasi (Privacy Policy Declaration)

- **Single Purpose**: Ekstensi ini dibuat khusus untuk membantu mahasiswa/peserta magang menyusun teks laporan harian pada portal MagangHub Kemnaker.
- **Data Collection & Handling**: Ekstensi **TIDAK MENGUMPULKAN, MENYIMPAN, ATAU MEMBAGIKAN** data pribadi pengguna ke server eksternal milik pengembang.
- **Local Storage**: Semua data seperti API Key, template kustom, dan riwayat laporan disimpan secara eksklusif di dalam `chrome.storage.local` pada perangkat pengguna.
- **Third-Party Services**: Komunikasi jaringan hanya dilakukan secara langsung ke endpoint resmi Google Generative AI (`generativelanguage.googleapis.com`) menggunakan API Key milik pengguna sendiri.

---

## 5. Version History & Changelog

### Version 2.0.0 (Current Release)
- **Arsitektur Modular**: Restrukturisasi penuh ke Manifest V3 modular (`src/background`, `src/content`, `src/popup`, `src/options`, `src/utils`).
- **Toolbar Action Popup**: Dashboard popup lengkap dengan status API key, generator cepat, dan link hari ini.
- **Dedicated Options Page**: Dashboard pengaturan tabbed (Konfigurasi AI, Alarm Notifikasi, Template Manager, Riwayat Logbook, Ekspor Markdown/JSON/CSV).
- **Interactive In-Page Widget**: Shadow DOM encapsulated dengan tombol melayang draggable yang mengingat posisi, live character counter (min. 100 karakter), dan preview modal sebelum input ke form.
- **Dukungan Multi-Model & Custom Endpoint**: Gemini 3.1 Flash-Lite, Gemini 2.5 Flash, Gemini 2.5 Pro, Gemini 2.0 Flash, Gemini 1.5 Flash, Custom Model, dan API Base URL kustom.
- **Alarm & Desktop Notification**: Pengingat jam pulang kerja dengan skip weekend otomatis.

### Version 1.0.0 (Legacy Initial Prototype)
- Script dasar pengisi otomatis 3 textarea dengan hardcoded endpoint.
