# Changelog

Catatan rilis **VTuber Schedule Maker**. Entri di bawah ini adalah pekerjaan yang
belum ter-push dari sesi coding sebelumnya — siap dijadikan **PR #2 ke `main`**.

---

## [Unreleased] — kurasi ornamen layer (hapus slash & ikon jelek) — 2026-09-17 (lanjutan)

> Branch: `arena/01a0ab61-gepengschedule` — lanjutan fix paw & 4 isu.
> Status: **33/33 test** · `tsc --strict` · build produksi lolos.

### ✨ Ornamen layer: ornamen slash aneh hapus, ganti dengan ornamen dari layout lain
**Permintaan:** "ornamen slash aneh hapus saja" & "hapus beberapa ornamen yang menurutmu jelek … ambil ornamen layer ini dari ornamen layout lain".
**Masalah sebelumnya:** `OrnamentIconKey` berisi 11 ikon, termasuk yang tidak estetik / geometris kasar: `square` (◇), `diagonal` (╱ slash), `cross` (✚), `circuit` (⌁ — untuk cyber). Ikon-ikon ini tidak serasi dengan estetika cute/celestial/royal/cat dan `diagonal` terlihat seperti garis error. Default tema `gothic` pakai `cross`, `cyber` pakai `circuit` → hasil hiasan terlihat jelek.
**Fix (kurasi):**
- **Hapus 4 ikon jelek:** `square`, `diagonal` (slash), `cross`, `circuit` — tidak lagi muncul di `OrnamentIconKey`, `renderOrnamentIcon`, `ornamentIconOptions`, dan `persistence.OR ORNAMENT_ICONS`.
- **Pertahankan 7 ikon estetik:** `dot` ●, `star` ✦, `sparkle` ✧, `heart` ♥, `sakura` ❀, `moon` ☾, `paw` 🐾 — sudah selaras dengan palet vtuber.
- **Tambah 2 ikon baru diambil dari layout lain:** `feather` 🪶 (dari Celestial — `Feather` lucide, elegan untuk magic/aesthetic) dan `fish` 🐟 (dari Cat — `FishStamp` line-art kawaii) sehingga total **9 ikon**: `dot | star | sparkle | heart | sakura | moon | paw | feather | fish`.
- `ScheduleCanvas.renderOrnamentIcon`: `feather` dirender via `<Feather size color>` (lucide), `fish` via inline SVG line-art `ellipse + triangle + dot` yang scale dengan `size` (stroke menyesuaikan, `fill:none`).
- `ScheduleEditor`: `ornamentIconOptions` kini 9 entri (dot/star/sparkle/heart/sakura/moon/paw/feather/fish); `themes.defaultLayers` gothic `cross` → `moon` (elegan), cyber `circuit` → `star`.
- `persistence`: `ORNAMENT_ICONS` diperbarui ke 9 ikon; `sanitizeOrnaments` otomatis migrasi ikon legacy (`square`/`diagonal`/`cross`/`circuit`) ke fallback `"star"` via `asPick`, jadi state lama tidak pecah.
- Build 528.90 KB gz163.35 KB · `tsc` & `eslint` clean · 33/33 test pass.

**File berubah:** `src/components/ScheduleCanvas.tsx` (OrnamentIconKey + renderOrnamentIcon feather/fish), `src/components/ScheduleEditor.tsx` (ornamentIconOptions + themes defaultLayers), `src/lib/persistence.ts` (ORNAMENT_ICONS), `CHANGELOG.md`

---

## [Unreleased] — fix 4 isu (celestial, cat, ornaments, color/layout) — 2026-09-17

> Branch: `arena/01a0ab61-gepengschedule` — lanjutan fix paw.
> Status: **33/33 test** · `tsc --strict` · build produksi lolos.

### 1. 🪄 Celestial: tulisan SCHEDULE di bawah karakter ngebug saat ganti warna
**Masalah:** `SCHE`/`DULE` memakai `background: linear-gradient` + `backgroundClip: text` + `color: transparent`. Saat ganti tema (Color), gradient tidak selalu ke-repaint (safari/Firefox) & tanpa `WebkitTextFillColor` teks jadi transparan/hilang. Di tema terang (cute) kontras rendah → terlihat "nge-bug".
**Fix:** Ganti ke `backgroundImage: linear-gradient` + `WebkitBackgroundClip: text` + `backgroundClip: text` + `WebkitTextFillColor: transparent` + `color: transparent` + `WebkitTextStroke: 0.5px deep22` + `filter: drop-shadow`. Sekarang gradient selalu ter-render setelah ganti tema, di semua browser & saat export.

### 2. 🐱 Animal → Cat (rename tema/layout)
**Permintaan:** "Ubah nama tema animal menjadi cat".
**Fix:**
- `LayoutKey` kini `"cat"` ("animal" tetap didukung sebagai alias legacy agar state lama tidak pecah).
- `ANIMAL_V2_PALETTES` → `CAT_PALETTES` (alias `ANIMAL_V2_PALETTES = CAT_PALETTES` untuk backward compat, ekspor tetap ada).
- `ANIMAL_V2_DAYS` → `CAT_DAYS` (alias legacy).
- `AnimalLayout` → `CatLayout` (alias `AnimalLayout = CatLayout`).
- UI Layout: tombol `Cute Animal` → `Cat` (`key: "cat"`, desc "Pastel + paws").
- Persistence: `LAYOUTS` mencakup `cat` & `animal`; `sanitizeState` migrasi `animal` → `cat`.
- Test: `LAYOUTS` mencakup `cat`+`animal`, palet `CAT_PALETTES` & `ANIMAL_V2_PALETTES` di-test identik.

### 3. ✨ Ornament layer tidak bisa ditambah di beberapa layout (royal/celestial/cat)
**Masalah:** (a) `pickTheme` & `pickLayout("animal")` selalu **reset** `ornaments` ke default tema/layout → layer yang baru ditambah hilang saat ganti warna/layout, terasa "tidak bisa tambah". (b) `ScheduleCanvas` render ornaments **di belakang** layout opaque (cat/celestial/royal) yang background-nya menutupi seluruh canvas → ornaments global tidak terlihat.
**Fix:**
- `pickTheme(k)` sekarang **hanya** `setTheme(k)` — tidak lagi reset ornaments & tidak auto-ganti layout.
- `pickLayout(k)` sekarang **hanya** `setLayout(normalized)` — tidak lagi reset ornaments.
- `ScheduleCanvas`: ornaments global dirender hanya untuk `grid`/`bubbles` (layout transparan). Untuk `cat`/`celestial`/`royal`, ornaments diteruskan sebagai prop `ornaments,W,H` dan dirender **di dalam** layout masing-masing di layer `zIndex:1` (di atas background opaque, di bawah konten `zIndex:5+`), sehingga "Tambah Layer" selalu terlihat di semua layout.

### 4. 🎨 Ganti Color kadang ikut ganti Layout
**Masalah:** `pickTheme("magic")` otomatis `setLayout("celestial")` → user ganti warna (Color) tiba-tiba layout pindah ke Celestial.
**Fix:** Hapus branch `if (k === "magic") setLayout("celestial")`. Sekarang theme, layout, dan ornaments **independen** — hanya berubah saat user klik section-nya.

**File berubah:** `src/components/ScheduleCanvas.tsx` (Celestial fix, Cat rename, ornaments inside), `src/components/ScheduleEditor.tsx` (pickTheme/pickLayout, label Cat), `src/lib/palettes.ts` (CAT_PALETTES + alias), `src/lib/persistence.ts` (LAYOUTS + migrasi), `src/test/scheduleCanvas.test.tsx` (cat & alias), `CHANGELOG.md`

---

## [Unreleased] — fix paw Animal (2026-09-16)

> Branch: `arena/01a0ab61-gepengschedule` — patch lanjutan PR #2.
> Status: **32/32 test** · `tsc --strict` · build produksi lolos.

### 🐾 Fix: paw Animal tidak muncul dengan baik

**Masalah:** `PawStamp` sebelumnya dirender via CSS mask (`mask-image: url(src/assets/paw.svg)` + `background-color`). Di beberapa browser & saat export (`html2canvas`/`canvas`) mask tidak ter-capture → paw hilang/putus, terutama pada sudut frame, badge tanggal, dan hiasan samping. File `paw.svg` eksternal juga menambah 1 request dan rawan CORS/asset-hash mismatch saat build.

**Fix:**
- `PawStamp` kini **inline SVG** — `viewBox="0 0 512 512"` + `fill="currentColor"` dengan path yang sama persis dari Font Awesome Free 6.7.2 **CC BY 4.0** (lisensi tetap tercantum di `src/assets/paw.svg`). Warna mengikuti palet via `style={{ color }}` sehingga tetap dinamis per tema.
- Hapus import `pawSvgUrl` & semua `mask-*`; ganti `<div mask>` → `<svg><path>`.
- Badge tanggal (`ink` paw + angka `cream` JetBrains Mono) tetap kontras di 9 tema (termasuk gothic terbalik); posisi angka `top:68%` dipertahankan agar tepat di telapak.
- Frame corner paws (56px, rotasi mirror ±45°/±135°), paw judul, dan ornamen samping (26px) kini selalu ter-render — di preview, di export PNG, dan di semua browser (Chrome/Firefox/Safari).
- `src/assets/paw.svg` **tetap disimpan** sebagai sumber & atribusi lisensi (tidak dihapus).
- Verifikasi: `npm run build` OK, `vitest` 32/32 lulus, inspeksi innerHTML AnimalLayout mengandung `<svg>`+`PAW_PATH` bukan `mask-image`.

**File berubah:** `src/components/ScheduleCanvas.tsx` (PawStamp), `CHANGELOG.md`

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
  6.7.2 (**lisensi CC BY 4.0**, atribusi tercantum di dalam file). **Update 2026-09-16:** dirender sebagai **inline SVG** (`fill="currentColor"`) agar selalu muncul dengan baik di preview & export (menggantikan CSS mask yang hilang di `html2canvas`/beberapa browser). Warna tetap mengikuti palet tiap tema.
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
