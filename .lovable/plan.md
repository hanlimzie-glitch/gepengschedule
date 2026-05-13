## Perubahan

### 1. Input tanggal → kalender (date range picker)
File: `src/components/ScheduleEditor.tsx`
- Ganti `Field "Tanggal / Periode"` Input teks menjadi `Popover + Calendar` (shadcn) mode `range`.
- State internal `dateFrom`, `dateTo` (Date). Saat berubah, format ke string `"5 - 11 Mei 2026"` (lokal `id`) lalu set ke `dateRange` (string tetap dipertahankan supaya `RoyalLayout.parseRange` & canvas tidak berubah).
- Pakai `format` dari `date-fns` + locale `id`. Default = minggu berjalan (Senin–Minggu).
- Tampilkan trigger Button dengan ikon CalendarIcon dan teks tanggal terformat.

### 2. Subtitle default → "powered by Huan"
File: `src/components/ScheduleEditor.tsx`
- `useState("Powered by Lovable ♡")` → `useState("powered by Huan")`.

### 3. Royal layout dikunci ke tema Royal Red
- `pickTheme(k)`: kalau `layout === "royal"` dan user mencoba pilih tema lain → tetap paksa `theme = "royalred"` (atau auto-switch layout ke `bubbles`). Pilihan: **paksa tetap royalred + tampilkan toast info** "Layout Royal hanya mendukung tema Royal Red".
- Di tombol theme picker: bila `layout === "royal"`, beri state `disabled` & opacity rendah untuk tema selain `royalred`.

### 4. Platform → checkbox multi-pilih
File: `src/components/ScheduleCanvas.tsx` & `ScheduleEditor.tsx`
- Ubah type `Slot.platform` dari `PlatformKey` (single string) → `platforms: PlatformKey[]` (array, tanpa "none"; array kosong = tidak ada).
- `PlatformKey` = `"twitch" | "youtube" | "tiktok"` (hapus `"none"`).
- `normalize()` di canvas: handle data lama (`platform: "none" | string`) → konversi ke `platforms: []` atau `[platform]`.
- Editor: ganti Select platform dengan 3 `Checkbox` (shadcn) horizontal: Twitch / YouTube / TikTok. Toggle tambah/hapus dari array.
- Render: di Royal/Bubbles/Grid, ganti `<PlatformBadge p={s.platform}/>` jadi loop `s.platforms.map(p => <PlatformBadge p={p}/>)` di dalam wrapper flex gap kecil.

### 5. Fix ornamen glitch & tabrakan warna

**a. Ornament `diagonal` glitch**
File: `src/index.css`
- `.ornament-diagonal` saat ini pakai `repeating-linear-gradient` 4px solid → terlihat patah/moiré di canvas 1920px. Perbaiki jadi garis lebih halus & spacing konsisten:
  ```css
  .ornament-diagonal {
    background-image: repeating-linear-gradient(
      45deg,
      hsl(var(--t-1) / 0.22) 0 2px,
      transparent 2px 24px
    );
  }
  ```

**b. Ornament `crosses` warna tabrakan**
- Saat ini garis vertikal & horizontal pakai warna sama (`--t-1` keduanya hampir sama opacity) sehingga tabrakan dengan `--t-card` di tema terang. Perbaiki:
  ```css
  .ornament-crosses {
    background-image:
      linear-gradient(hsl(var(--t-text) / 0.18) 0 100%, transparent 0),
      linear-gradient(90deg, hsl(var(--t-text) / 0.18) 0 100%, transparent 0);
    background-size: 4px 40px, 40px 4px;
    background-position: center;
  }
  ```
  Gunakan `--t-text` (selalu kontras dengan background tema) bukan `--t-1`.

### 6. Fix warna judul tabrakan dengan background

**a. Bubbles + tema Sakura**: judul putih di atas background pink terang sulit dibaca.
File: `src/components/ScheduleCanvas.tsx` (BubbleLayout)
- Heading di dalam panel karakter (`fontSize: 64`) saat ini `color: "white"` dengan textShadow gelap. Karakter image biasanya menutupi area tapi kalau kosong / transparan, judul ilang. Tambahkan overlay gradient gelap di belakang teks judul:
  ```jsx
  <div style={{
    position: "absolute", top: 0, left: 0, right: 0, height: 220,
    background: "linear-gradient(180deg, rgba(0,0,0,0.45), transparent)",
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  }} />
  ```
  Letakkan sebelum teks judul agar selalu kontras.

**b. Grid + tema Royal Red**: header `<h1>` pakai `color: hsl(var(--t-text))` = burgundy gelap di atas gradient burgundy → tabrakan.
- Ganti warna heading di GridLayout jadi adaptif: gunakan `color: "hsl(var(--t-card))"` (cream/light) untuk tema dengan background gelap. Atau lebih sederhana: tambahkan `text-shadow` putih + box bg semi pada wrapper header bila theme = `royalred`/`gothic`/`aesthetic`/`cyber`.
- Solusi konkret: bungkus title block dengan padding & semi-translucent backdrop:
  ```jsx
  <div style={{
    background: "hsl(var(--t-card) / 0.55)",
    padding: "12px 24px", borderRadius: 16, display: "inline-block",
    backdropFilter: "blur(4px)",
  }}>
    {/* heading */}
  </div>
  ```
  Berlaku untuk semua tema → konsisten & menjamin kontras.

## File yang diubah

- `src/components/ScheduleEditor.tsx` — date range picker, subtitle default, royal lock, platform checkbox.
- `src/components/ScheduleCanvas.tsx` — `Slot.platforms[]`, normalize data lama, render multi-badge, fix kontras judul Bubbles+Grid.
- `src/index.css` — perbaiki `.ornament-diagonal` & `.ornament-crosses`.

## Di luar scope
- Tidak menambah platform baru.
- Tidak mengubah struktur export PNG.
- Tidak mengubah layout Royal secara visual (hanya badge platform jadi multi).
