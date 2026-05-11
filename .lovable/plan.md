## Tujuan

1. **Platform terlihat jelas di layout jadwal** (Royal, Bubbles, Grid) — bukan cuma sebagai badge mungil di pinggir, tapi sebagai elemen visual yang menyatu dengan baris jadwal sehingga viewer langsung tahu stream itu di Twitch / YouTube / TikTok. Untuk svg tiktok jika tidak ketemu sama sekali gunakan icon yang mirip seperti icon music
2. **Slot kedua menyatu dengan hari yang sama** — tidak dirender sebagai baris/hari terpisah. Hari ditampilkan sekali, lalu dua jadwal dikelompokkan di bawah/di samping label hari yang sama.

---

## 1. Royal layout (`ScheduleCanvas.tsx` → `RoyalLayout`)

Saat ini setiap slot jadi 1 baris arrow ribbon dan slot kedua diberi tag `+2nd` — terkesan terpisah dari hari aslinya.

Perubahan:

- Iterasi per **hari** (bukan flatten semua slot).
- Untuk hari dengan 1 slot → 1 baris arrow ribbon seperti sekarang.
- Untuk hari dengan 2 slot → render **1 baris hari** dengan tag kiri `MON | (2 streams)`, lalu di dalam ribbon-nya tampilkan dua mini-row yang dipisahkan garis emas tipis. Contoh:
  ```text
  [ MON | 2 STREAMS ]►  ✻  04:00 PM · Just Chatting     [YT]   ✻
                        ─────────────────────────────────────────
                           09:00 PM · Valorant w/ Friends [TW]
  ```
- Tinggi ribbon otomatis 2x bila ada 2 slot.
- **Platform di Royal**: pindahkan `PlatformBadge` ke **dalam ribbon hitam**, di samping judul stream (kanan, sebelum `✻`), bukan di tag pill kiri. Ukuran lebih besar (compact=false) supaya jelas terlihat. Tag pill kiri jadi lebih ringkas: hanya `DAY | TIME`.

## 2. Bubbles layout (`BubbleLayout`)

Ubah supaya satu hari = satu polaroid badge tanggal + container bubble berisi 1 atau 2 sub-bubble:

- Badge hari/tanggal tetap satu di kiri.
- Bila 2 slot: render dua bubble bertumpuk vertikal dengan jarak ~12px, dihubungkan oleh garis tipis kiri (atau separator "•").
- Slot kedua **tidak** punya badge hari sendiri.
- **Platform di Bubbles**: badge platform full (`compact=false`) di header bubble, di samping pill jam — sehingga terbaca jelas (warna ungu Twitch / merah YouTube / hitam TikTok).

## 3. Grid layout (`GridLayout`)

- Satu kartu = satu hari.
- Bila 2 slot: di dalam kartu tampilkan label hari sekali di atas, lalu dua sub-block (jam + judul + platform badge) dipisahkan separator horizontal tipis.
- **Platform di Grid**: badge platform di pojok kanan tiap sub-block, sejajar jam.

## 4. Editor (`ScheduleEditor.tsx`)

Tidak perlu perubahan struktural — Editor sudah mengizinkan menambah slot kedua per hari. Cukup pastikan default platform tetap `none` agar badge tidak muncul kalau user belum pilih.

---

## File yang diubah

- `src/components/ScheduleCanvas.tsx`
  - `RoyalLayout`: iterasi per hari, ribbon multi-slot, pindah `PlatformBadge` ke dalam ribbon.
  - `BubbleLayout`: grouping per hari, sub-bubble untuk slot kedua, platform badge full di header bubble.
  - `GridLayout`: grouping per hari dengan separator antar slot, platform badge per slot.
- Tidak perlu ubah `ScheduleEditor.tsx`, `index.css`, atau dependency baru.

## Di luar scope

- Tidak menambah platform baru selain Twitch/YouTube/TikTok.
- Tidak mengubah pipeline export PNG.
- Tidak mengubah tema/ornament.  
  
  
TAMBAHAN:  
  
untuk layout royal tidak bisa menggunakan tema warna lain dan untuk tema royal buat gradasi di layout yang lain