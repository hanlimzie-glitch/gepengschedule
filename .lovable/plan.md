## 1. Tambah Tema Warna "Magic" (Celestial Purple)

**File:** `src/index.css`
Tambah class `.theme-magic` dengan palette ungu-emas celestial:

- `--t-1: 270 70% 65%` (lavender purple), `--t-2: 45 85% 70%` (warm gold)
- `--t-bg-from: 270 55% 55%` → `--t-bg-to: 35 70% 70%` (gradient ungu → emas hangat seperti referensi)
- `--t-card: 260 50% 12%` (dark navy bubble), `--t-text: 270 30% 96%`, `--t-border: 270 60% 75%`
- `--t-font: 'Cormorant Garamond', 'Playfair Display', serif`
- `--gradient-theme` & `--gradient-accent` mengikuti ungu→emas.

**File:** `src/components/ScheduleCanvas.tsx`

- Tambah `"magic"` ke type `ThemeKey`.
- Tambah `themeIcon.magic` (✦ / `Moon`), `themeFont.magic`, dan entry `ROYAL_PALETTES.magic` (`dark:"#3a1d6e"`, `light:"#f3d27a"`, `ribbon:"#1a0f3a"`, `tag:"#fef3c7"`, `accent:"#c9a4ff"`).

**File:** `src/components/ScheduleEditor.tsx`

- Tambah entry `{ key:"magic", label:"Magic", swatch:"linear-gradient(135deg,hsl(270 60% 55%),hsl(35 80% 70%))", defaultOrnament:"stars" }` ke `themes`.

## 2. Tambah Layout "Celestial" (mirip referensi)

**File baru/section:** `src/components/ScheduleCanvas.tsx` — komponen `CelestialLayout`.

Layout sesuai gambar referensi:

```
┌────────────────────────────────────────────────┐
│  Celestial Stream Schedule          (judul atas, center)
│  ┌──────────────────────┐  ┌─────────────────┐
│  │ mon ╮ ▰▰▰ bubble ▰▰▰ │  │                 │
│  │ 12 │  Stream Offline │  │                 │
│  │    ╯  - subtitle     │  │   CHARACTER     │
│  │                       │  │   (oval frame,  │
│  │ tue ╮ ▰▰▰ bubble ▰▰▰ │  │   soft glow)    │
│  │ 13 │  Stream content │  │                 │
│  │      CET 12PM  ...   │  │                 │
│  │  ... 5 baris hari    │  │  SCHEDULE       │
│  │                       │  │  week of 12-18  │
│  └──────────────────────┘  └─────────────────┘
└────────────────────────────────────────────────┘
```

Detail visual yang disamakan:

- **Bubble jadwal:** kapsul gelap (`--t-card` navy), border tipis emas, rounded-full, dengan ornament titik+garis halus di kiri/kanan bubble (sparkle constellation).
- **Badge hari (kiri bubble):** lingkaran outline tipis berisi `mon` (kecil, italic, di atas) + nomor tanggal besar (mis. `12.`) — diambil dari `parseDay()`.
- **Isi bubble:** judul (gold serif) + subtitle abu kecil; bila slot punya `time`, render 1-3 pill kecil "CET 12:30PM" (salah satunya highlighted gold).
- **Bubble offline:** judul "Stream Offline", subtitle, dan `zZzz...` di kanan.
- **Ikon dekoratif:** mini-glyph (kupu-kupu/feather/tarot — pakai lucide `Feather`, `Sparkles`, `Moon`, `Star`) muncul di kiri/kanan bubble berdasarkan index hari (pseudo-acak deterministik).
- **Panel kanan:** karakter dalam frame oval/lengkung (mask `border-radius: 50% / 40%`), glow lembut. Di bawah karakter teks besar "SCHE / DULE" dua baris dengan style gradient ungu→emas + `week of {dateRange}` italic kecil, `art by @{artBy}`, dan handle `@twitch / @youtube`.
- **Background:** gradient ungu→emas (pakai `--gradient-theme`), dengan overlay SVG constellation tipis (titik + garis penghubung) di sudut atas-kanan dan bawah-kiri.
- **Judul header:** "{title}" 2 baris serif besar warna `--t-text` deep purple di atas canvas.

**Registrasi layout:**

- Tambah `"celestial"` ke `LayoutKey`.
- Di switch `ScheduleCanvas`: `layout === "celestial" ? <CelestialLayout ... />`.

**File:** `src/components/ScheduleEditor.tsx`

- Tambah `{ key:"celestial", label:"Celestial", desc:"Magic bubble + oval" }` ke array layout buttons.

## 3. Pasangan Default Magic + Celestial

Di `pickTheme`, bila user memilih theme `magic`, otomatis switch layout ke `celestial` dan ornament ke `stars` (saran terbaik, tetap bisa diubah manual). Sebaliknya tidak dipaksa.

## 4. Perbaiki Preview Desktop (lebih besar / fit)

**File:** `src/components/ScheduleEditor.tsx`

Saat ini scale dihitung dari lebar wrap (max 1 = 1920px). Pada viewport 929px, scale jadi sangat kecil (0.32) karena sidebar 420px memakan ruang.

Perubahan:

- Ganti grid jadi responsif: `grid-cols-1 xl:grid-cols-[380px_1fr]` (sidebar lebih ramping).
- `previewWrapRef` dihitung berdasarkan **min(width-fit, height-fit)** agar canvas mengikuti tinggi viewport juga:
  ```ts
  const sx = wrap.clientWidth / 1920;
  const sy = (window.innerHeight - 160) / canvasH;
  setScale(Math.min(1, sx, sy));
  ```
- Tambah dependency `[ratio]` ke `useEffect` & re-run pada `window.resize`.
- Bungkus preview dengan `sticky top-4` agar selalu tampil penuh saat scroll sidebar.

## File yang diubah

- `src/index.css` — class `.theme-magic`.
- `src/components/ScheduleCanvas.tsx` — `ThemeKey` + `LayoutKey` + `CelestialLayout` + palette magic.
- `src/components/ScheduleEditor.tsx` — entry theme/layout, auto-pair magic↔celestial, preview scale & sticky.

## Tidak diubah

- Struktur data Slot/DayItem, ekspor PNG, layout Grid/Bubbles/Royal lama.

## Tambahan

- pada tampilan dekstop 16:9 preview terlalu besar, aku ingin perbaiki ukurannya sehingga tidak usah menggeser kanan kiri untuk melihat preview secara keseluruhan