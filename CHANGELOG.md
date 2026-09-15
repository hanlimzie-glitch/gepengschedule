# Changelog

Catatan rilis **VTuber Schedule Maker**. Entri di bawah ini adalah pekerjaan yang
belum ter-push dari sesi coding sebelumnya — siap dijadikan **PR #2 ke `main`**.

---

## [Unreleased] — PR #2 (menunggu push dari sesi baru)

> Branch sumber: `arena/01a0a0e6-gepengschedule` (6 commit di atas `a9fc411`).
> Semua verifikasi lulus: **32/32 test** · `tsc --strict` · ESLint bersih · build produksi.
> Cara push: buka sesi coding baru → commit bila masih uncommitted → push branch → buat PR.

### 🐾 Layout Animal — iterasi besar

- **Judul satu baris melebar ke samping** (tidak lagi menumpuk 2 baris); ukuran font
  dihitung dari panjang judul penuh; area judul menyusut sehingga jadwal dapat ruang
  lebih (baris hari 120 → 126px, zona jadwal 882px).
- **Paw menjadi file SVG resmi** `src/assets/paw.svg` — ikon "paw" Font Awesome Free
  6.7.2 (**lisensi CC BY 4.0**, atribusi tercantum di dalam file). Dirender via CSS mask
  (`mask-image` + `background-color`) sehingga warna selalu mengikuti palet tiap tema.
  _(Menggantikan SVG gambaran tangan & PNG hasil generate yang transparansinya rusak.)_
- **Badge tanggal hari**: paw warna `ink` solid (gelap); angka tanggal memakai
  **JetBrains Mono** warna `cream` — selalu kontras di 9 tema (termasuk gothic terbalik).
- **Baris tanggal (dateRange) pindah ke atas judul** menggantikan eyebrow
  "Vol. 01 — Weekly Broadcast" (dihapus); ikon akhir baris: love (HeartStamp).
- **Footer ditukar**: sosial media kini di **kiri**, "Illust —" di **kanan**.
- **"Jadwal kedua" kini tampil**: slot ke-2 dirender sebagai baris judul kedua
  (lebih kecil, warna `sub`) + pill jam/platform ke-2. _Sebelumnya bug: AnimalLayout
  hanya membaca slot pertama sehingga tombol "+ Jadwal kedua" terlihat tidak aktif._
- Pill jam slot ke-2 menyamakan warna dengan pill utama (`accent`).
- Paw sudut frame disimetriskan (ukuran seragam 56, warna aksen, rotasi mirror
  ±45°/±135°); frame dashed tunggal; placeholder karakter tanpa border dashed;
  ornamen margin kanan dirapikan.

### 🌐 Sosial media global (semua layout)

- Input baru: **Instagram, X (Twitter), TikTok** (melengkapi YouTube & Twitch) di
  section "Media sosial" editor.
- **Checkbox per platform** — centang = tampil di poster, uncek = disembunyikan
  (input ikut nonaktif). Default: YouTube & Twitch aktif, sisanya nonaktif.
- Layout **Royal, Celestial, dan Animal** merender semua platform yang aktif dengan
  ikon brand berwarna.
- Auto-save menyimpan `socials` + `socialEnabled`; **state lama dimigrasi otomatis**
  (handle YouTube/Twitch lama dipindah ke struktur baru).
- `SocialKey`/`SOCIAL_KEYS` dipusatkan di `src/lib/palettes.ts`.

### 🧭 Navigasi & layout halaman (UI global)

- **Toolbar sticky** di bawah header: chip Judul / Layout / Color / Ornament /
  Karakter / Jadwal / Texture / Export — klik = smooth-scroll ke section
  (tiap section punya anchor + scroll-margin), plus tombol **Export** cepat.
- **Perilaku responsif preview**:
  - **HP (<768px)**: preview di atas form, **sticky mengikuti scroll**.
  - **Tablet (768–1023px)**: preview di atas, tidak sticky (tidak menutupi layar).
  - **Desktop (≥1024px)**: dua kolom form-kiri/preview-kanan, preview sticky di kolomnya.

### 🐛 Perbaikan bug

- Animal layout mengabaikan "Jadwal kedua" (lihat di atas).
- Sticky preview mobile tidak bekerja (elemen sticky di dalam container pendek) —
  dipindah ke `<main>`.
- Grid dua kolom baru aktif mulai `lg` (sebelumnya `xl` — tablet & desktop
  setengah-layar tertutupi preview raksasa).

### ✅ Kualitas

- Test **30 → 32**: regresi "jadwal kedua" ter-render; handle IG/X/TikTok tampil;
  migrasi persistence sosial media; eyebrow lama hilang & dateRange tampil.
- ESLint bersih (tanpa warning react-refresh); `tsc --strict` lolos; build produksi OK.

### 📁 File utama yang berubah

- `src/components/ScheduleCanvas.tsx` — layout Animal, registry sosial media.
- `src/components/ScheduleEditor.tsx` — input sosial, toolbar nav, breakpoint layout.
- `src/lib/palettes.ts` — `SOCIAL_KEYS`/`SocialKey`.
- `src/lib/persistence.ts` — `socials` + `socialEnabled` + migrasi.
- `src/assets/paw.svg` — asset paw resmi (baru).
- `src/test/scheduleCanvas.test.tsx`, `src/test/persistence.test.ts` — test baru.

### ℹ️ Catatan merge

Branch ini juga berisi ulang konten PR #1 (auto-save, toolchain, palet, strict TS)
dalam satu commit squash — saat PR dibuka ke `main`, diff efektif yang muncul hanyalah
perubahan di atas karena PR #1 sudah ter-merge (`7d5fd1b`).
