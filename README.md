# 🎓 MagangHub AI Report Assistant (Chrome Extension V2.0 Pro)

> Ekstensi Chrome modern & profesional berbasis AI Gemini untuk membantu peserta MagangHub Kemnaker menyusun laporan harian (Aktivitas, Pembelajaran, Kendala) secara otomatis, rapi, dan memenuhi syarat minimal 100 karakter.

![Chrome Extension MV3](https://img.shields.io/badge/Manifest-V3-blue.svg)
![AI Powered](https://img.shields.io/badge/AI-Google%20Gemini%203.1-orange.svg)
![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-green.svg)

---

## 🌟 Fitur Utama

- ⚡ **AI Generator Multi-Model & Custom Endpoint**: Mendukung Google Gemini 3.1 Flash-Lite, Gemini 2.5 Flash, Gemini 2.5 Pro, Gemini 2.0 Flash, Gemini 1.5 Flash, Custom Model, serta kustomisasi API Base URL (proxy / custom endpoint).
- 🧠 **AI Contextual Memory**: AI secara cerdas mengingat 1–5 laporan hari-hari sebelumnya sehingga narasi tugas terasa berkesinambungan dan memahami referensi seperti *"melanjutkan task kemarin"*.
- 🎨 **Gaya Bahasa Fleksibel**: Pilihan tone formal akademik, sangat terperinci, ringkas padat, atau santun luwes.
- 📝 **Draggable Floating Action Button (FAB)**: Tombol asisten di portal Monev MagangHub yang bisa digeser (drag & drop) ke posisi mana saja di layar dan mengingat posisinya.
- 👁️ **Live Preview & Live Character Counter**: Tinjau hasil AI sebelum disuntikkan ke form, lengkap dengan badge validasi panjang karakter (min. 100 karakter).
- 📋 **Salin Satuan & Otomasi Form**: Mengisi otomatis 3 textarea (Aktivitas, Pembelajaran, Kendala) dengan visual highlight ripple, atau salin satuan per bagian.
- 📑 **Pustaka Template & Preset Kustom**: Preset siap pakai untuk berbagai divisi (Software Engineering, UI/UX, Data/Admin, Marketing, Briefing, WFH) dan pembuatan template kustom.
- ⏰ **Alarm & Notifikasi Pengingat**: Pengingat harian otomatis pada jam pulang (misal 17:00) dengan opsi otomatis melewati akhir pekan (Sabtu/Minggu).
- 📜 **Riwayat Logbook & Fitur Ekspor**: Menyimpan arsip lokal seluruh laporan yang pernah dibuat dan dapat diekspor ke format **Markdown (.md)**, **JSON**, atau **CSV** untuk bahan laporan akhir magang / portofolio.
- 🔒 **100% Aman & Privat**: Seluruh data dan API Key disimpan di `chrome.storage.local` milik browser kamu.

---

## 📁 Struktur Direktori Project

```
monev-maganghub/
├── manifest.json                     # Konfigurasi Manifest V3 Chrome Extension
├── CHROMEWEBSTORE.md                 # Dokumentasi listing publikasi & justifikasi izin CWS
├── README.md                         # Dokumentasi panduan penggunaan
├── icons/                            # Aset icon multi-resolusi
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
└── src/
    ├── background/
    │   └── background.js             # Service Worker: Alarm pengingat, notifikasi OS, event listener
    ├── content/
    │   ├── content.js                # Content script: Shadow DOM widget, draggable FAB, preview modal, auto-fill
    │   └── content.css               # Styling terisolasi untuk widget in-page
    ├── popup/
    │   ├── popup.html                # UI toolbar popup action
    │   ├── popup.css                 # Styling toolbar popup
    │   └── popup.js                  # Logika toolbar popup & quick generator
    ├── options/
    │   ├── options.html              # UI halaman pengaturan lengkap & riwayat
    │   ├── options.css               # Styling halaman pengaturan
    │   └── options.js                # Logika settings, template manager & ekspor logbook
    └── utils/
        ├── gemini.js                 # Client API Google Gemini (retry backoff, JSON parsing, prompt builder)
        ├── storage.js                # Helper manajemen chrome.storage.local
        └── templates.js              # Data preset template bawaan
```

---

## 🚀 Panduan Instalasi (Developer Mode)

1. **Clone atau Unduh** repository ini ke komputer kamu.
2. Buka browser **Google Chrome** (atau Microsoft Edge / Brave / Chromium).
3. Masuk ke halaman pengelolaan ekstensi: `chrome://extensions`.
4. Aktifkan toggle **Developer mode** di pojok kanan atas.
5. Klik tombol **Load unpacked** (Muat yang belum dibongkar).
6. Pilih folder project `monev-maganghub`.
7. Ekstensi **MagangHub AI Report Assistant** siap digunakan! 🎉

---

## 🔑 Cara Mendapatkan Google Gemini API Key Gratis

1. Kunjungi [Google AI Studio (aistudio.google.com/apikey)](https://aistudio.google.com/apikey).
2. Login dengan akun Google kamu.
3. Klik tombol **"Create API key"**.
4. Salin string API key yang muncul.
5. Buka ekstensi MagangHub AI di browser kamu -> Masuk ke **Pengaturan (Options)** -> Tempelkan API Key -> Klik **Test Koneksi** -> **Simpan**.

---

## 📖 Cara Menggunakan

1. Buka portal [Monev MagangHub Kemnaker](https://monev.maganghub.kemnaker.go.id).
2. Masuk ke halaman **Riwayat Laporan** dan pilih tanggal hari ini.
3. Klik tombol melayang **📝 MagangHub AI** di pojok kanan bawah.
4. Pilih template cepat atau ketik catatan ringkas kegiatanmu.
5. Klik **"Generate Laporan AI"**.
6. Periksa pratinjau teks dan jumlah karakter.
7. Klik **"Isi ke Form Laporan Sekarang"** untuk mengisi kolom formulir secara otomatis!

---

## 🛡️ Keamanan & Privasi

Ekstensi ini dibuat tanpa analitik pelacak, tanpa server pihak ketiga, dan tidak menyimpan data pengguna di luar browser lokal perangkat Anda.
