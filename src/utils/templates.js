/**
 * MagangHub AI Assistant - Preset Prompt Templates
 * Standard presets for various internship disciplines
 */

const PRESET_TEMPLATES = [
  {
    id: 'software-dev',
    category: 'Teknologi & IT',
    title: '💻 Software / Web Developer',
    bullets: `- Melakukan slicing UI dan integrasi API pada modul dashboard
- Mengikuti daily standup meeting bersama tim tech lead
- Melakukan debugging dan fixing issue error pada halaman laporan
- Mempelajari best practice refactoring clean code dan dokumentasi API`
  },
  {
    id: 'data-admin',
    category: 'Administrasi & Data',
    title: '📊 Data & Administrasi',
    bullets: `- Melakukan verifikasi dan rekonsiliasi data dokumen masuk hari ini
- Menginput dan merapikan data spreadsheet laporan operasional
- Berkoordinasi dengan staf divisi terkait kelengkapan berkas arsip
- Mempelajari formula lanjutan dan otomasi data entry di sistem kantor`
  },
  {
    id: 'uiux-design',
    category: 'Desain Kreatif',
    title: '🎨 UI/UX & Graphic Design',
    bullets: `- Membuat wireframe dan mockup high-fidelity di Figma untuk fitur baru
- Menyiapkan aset visual dan banner untuk kebutuhan konten publikasi
- Melakukan design review bersama mentor dan product manager
- Mempelajari design system, accessibility standard, dan typography guideline`
  },
  {
    id: 'digital-marketing',
    category: 'Marketing & Komunikasi',
    title: '📢 Digital Marketing & Content',
    bullets: `- Menyusun copywriting dan visual brief untuk materi media sosial
- Menganalisis performa engagement campaign mingguan
- Brainstorming ide konten interaktif bersama tim promosi
- Mempelajari teknik audience targeting dan riset kata kunci tren`
  },
  {
    id: 'general-meeting',
    category: 'Umum & Pelatihan',
    title: '🏢 Briefing / Pelatihan Internal',
    bullets: `- Mengikuti sesi pengenalan SOP dan alur kerja divisi dari mentor
- Mencatat notula rapat mingguan terkait progres project tim
- Mempelajari penggunaan internal tools dan platform manajemen tugas
- Mengerjakan tugas review modul pelatihan yang diberikan mentor`
  },
  {
    id: 'wfh-remote',
    category: 'Work From Home',
    title: '🏠 Work From Home (WFH)',
    bullets: `- Melakukan koordinasi tugas harian secara daring melalui chat dan virtual meeting
- Melanjutkan pengerjaan tugas mandiri sesuai target mingguan yang ditentukan
- Mengirimkan update berkala hasil progres pekerjaan kepada supervisor
- Mengelola time management dan dokumentasi aktivitas harian secara mandiri`
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PRESET_TEMPLATES };
}
