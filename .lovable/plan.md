## Goal

1. Add a new layout that matches the uploaded reference (red/gold ornate "Weekly Stream Schedule" with arrow-shaped chat rows, polaroid character on the left, and a vertical "WEEK OF / 01–07" date marker between).
2. Allow up to **2 schedule slots per day** (a primary slot + an optional second slot).
3. Add **platform** field per slot (Twitch, YouTube, TikTok, none) shown as a badge with the platform's icon/color.

---

## 1. New layout: `royal`

Add `"royal"` to `LayoutKey` in `ScheduleCanvas.tsx`. Auto-pick `royal` when the user selects a new **"Royal Red"** theme (added below). Keep `bubbles` and `grid` intact.

### Visual structure (left → right)
- **Left panel (~46% width)**: red/burgundy background with subtle ornament. Character image fills the panel; small "— YOUR NAME" text at the top right of the panel; tiny polaroid stickers in the corners (decorative, no upload needed — just CSS placeholder shapes).
- **Center divider strip (~80px)**: dark column with two diamond date badges stacked vertically — top reads `WEEK OF / 01 / JANUARY`, bottom `TO / 07 / JANUARY`. Values derived by parsing `dateRange` (e.g. "5 - 11 Mei 2026" → 05/MEI and 11/MEI). Fallback to whole `dateRange` text if parse fails.
- **Right panel (gold gradient)**: 
  - Top: stylized title block "Weekly **Stream** Schedule" with a script-style middle word, plus 2 small social handle pills (YouTube + Twitch) showing the user's handles (new optional inputs `youtubeHandle`, `twitchHandle` — if empty, hide the row).
  - Body: 7 **arrow-shaped rows** (CSS clip-path hexagonal/arrow ribbon). Each row has:
    - Small left tag pill: `MON | 04:00 P.M – 5:00 P.M` (day abbrev + time, or `NO STREAM TODAY` when offline).
    - Center dark ribbon: title in caps + subtitle below, decorative `✻` glyphs left/right.
    - When `type === "offline"`: ribbon shows `— OFFLINE —` / `NO SCHEDULE TODAY`.
  - Rows separated by thin gold connector marks (`X` glyphs on the chevron tips).

### Color tokens
Add a new theme `royalred` with tokens:
- bg: deep burgundy → gold gradient split
- accent: gold `hsl(40 70% 55%)`
- ribbon dark: `hsl(0 0% 12%)`
- pill cream: `hsl(40 60% 92%)`

Selecting `royalred` auto-sets layout to `royal` (mirrors how `cute`/`sakura` auto-set `bubbles`).

---

## 2. Two slots per day

Change `DayItem` to:
```ts
type Slot = {
  time: string;
  title: string;
  note: string;
  type: "solo" | "collab" | "offline";
  platform: "none" | "twitch" | "youtube" | "tiktok";
};
type DayItem = { day: string; slots: Slot[] }; // length 1 or 2
```

### Editor (`ScheduleEditor.tsx`)
- Per-day card: render each slot as a sub-block with its existing fields plus a Platform `Select`.
- Below slot 1, show a small **"+ Tambah jadwal kedua"** button. When slot 2 exists, show a **"− Hapus jadwal kedua"** button.
- Migrate `initialDays` to new shape (each day starts with one slot).

### Canvas rendering
- **Grid layout**: render each slot as its own card; if a day has 2 slots, stack two compact cards inside the day's column with a small gap and the day label only on the first.
- **Bubbles layout**: render two stacked bubbles for that day; second bubble has no day badge (or a thin "and" connector).
- **Royal layout**: same — two arrow rows for that day; second row uses a thinner `+ 2nd stream` left tag instead of the day name.

---

## 3. Platform tags

Add `platform` to each slot. Render as a small rounded badge near the time:
- `twitch` → purple `#9146FF` + Twitch glyph (use `lucide-react` `Twitch` icon).
- `youtube` → red `#FF0033` + `Youtube` icon.
- `tiktok` → black/white + custom inline SVG (lucide doesn't ship TikTok; embed a minimal path).
- `none` → don't render a badge.

In the royal layout the platform badge sits inside the small left tag pill before the time. In bubbles/grid it sits next to the time pill.

---

## Files to edit

- `src/components/ScheduleCanvas.tsx` — extend types (`Slot`, new `DayItem`, `LayoutKey += "royal"`, `ThemeKey += "royalred"`), implement `royal` layout block, add platform badge helper, update bubble + grid renderers to iterate `slots`, add `youtubeHandle`/`twitchHandle` props.
- `src/components/ScheduleEditor.tsx` — new `royalred` theme entry, new `royal` layout option, per-day slot UI with add/remove second slot, platform select, two new inputs for YouTube/Twitch handles, migrate `initialDays`, default `dateRange` parse helper.
- `src/index.css` — add `.theme-royalred` token block (burgundy/gold), small utility classes for the arrow ribbon clip-path and diamond badge.

## Out of scope
- No changes to export pipeline.
- No new dependencies (TikTok icon inline SVG).
- Reference image is not embedded — we recreate the look with CSS only.
