## Perubahan UI Editor & Royal Layout

### 1. Reorder panel sidebar (`ScheduleEditor.tsx`)
- Pindahkan section **Layout** ke atas section **Tema**.
- Rename judul section `"Tema"` → `"Color"`.
- Hapus logika auto-switch yang mengunci Royal ke `royalred` saja:
  - `pickTheme`: hapus blok `if (layout === "royal" && k !== "royalred")`.
  - Tombol layout Royal: hapus `setTheme("royalred")` dan `setOrnament("none")` paksa.
  - Hapus state `locked` & `disabled` pada tombol tema saat layout Royal.

### 2. Royal layout multi-tema (`ScheduleCanvas.tsx` → `RoyalLayout`)
Saat ini `RoyalLayout` hardcoded warna `#6b1622` / `#e6c168` / `#f5e9c8` / `#1a1a1a` dst. Akan dibuat **dinamis** berdasarkan tema aktif dengan mengambil 2 warna paling kontras dari gradient tema.

**Pendekatan teori warna:**
Setiap tema sudah punya `--t-1` (warna utama / aksen) dan `--t-2` (warna sekunder) di `index.css`. Kedua nilai ini biasanya sudah merupakan dua titik gradient. Untuk Royal:
- **Warna A (dominan / panel kiri & ribbon gelap)** = warna paling gelap antara `--t-1`, `--t-2`, `--t-bg-from`, `--t-bg-to` (lightness terendah).
- **Warna B (aksen / panel kanan & gold tag)** = warna paling terang & paling beda hue dari A (delta hue terbesar dengan lightness tertinggi).
- **Warna C (text on A)** = otomatis `#fff` jika A gelap, `#111` jika terang.
- **Warna D (text on B)** = sebaliknya.

Implementasi: tambahkan helper kecil `pickRoyalPalette(theme)` yang me-return `{ dark, light, ribbon, tag, accent, textOnDark, textOnLight }` — dengan tabel preset per ThemeKey (lebih reliable daripada parsing CSS var saat render). Contoh:
- `royalred` → `{ dark:"#6b1622", light:"#e6c168", ribbon:"#1a1a1a", tag:"#f5e9c8", accent:"#c9a060" }` (existing)
- `cute` → dark `#c2185b` (pink deep), light `#ffd9b3` (peach soft) — dua titik gradient cute.
- `aesthetic` → `#5b21b6` ↔ `#7dd3fc`.
- `gothic` → `#0a0a0a` ↔ `#dc2626`.
- `sakura` → `#9d174d` ↔ `#fce7f3`.
- `cyber` → `#0891b2` ↔ `#ec4899`.
- `mint` → `#0f766e` ↔ `#a7f3d0`.

Lalu `RoyalLayout` menerima `theme` prop dan menggantikan semua nilai hex hardcoded:
- gradient background utama (`linear-gradient(90deg, dark 0% 46%, light 46% 100%)`)
- panel kiri border merah → `dark` shade lebih tua
- diamond badge `tag` background
- ribbon stream `ribbon` (versi sangat gelap dari `dark`)
- tag pill kiri `tag` background dengan teks `dark`
- aksen `✻` & border ribbon → `accent`
- judul "Schedule" warna teks → `dark`
- offline ribbon variant → gradient dari `dark`

### 3. Pass `theme` ke RoyalLayout
Di `ScheduleCanvas` line 186-190, tambahkan `theme={theme}` ke `<RoyalLayout />`.

---

### File yang diubah
- `src/components/ScheduleEditor.tsx` — reorder section, rename label, hapus penguncian tema↔layout.
- `src/components/ScheduleCanvas.tsx` — tambah `pickRoyalPalette`, refactor `RoyalLayout` agar menerima `theme` & pakai palette dinamis.

### Tidak diubah
- Struktur data, ornament, layout Bubbles & Grid, ekspor PNG.
