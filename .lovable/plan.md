## Goal
1. Add a new "Cute Pink" layout that matches the reference image (phone-like character frame on left, chat-bubble schedule rows on right).
2. Fix the Hearts ornament so it renders actual heart shapes.
3. Improve Sakura ornament shape consistency at the same time.

## 1. New "Cute Pink" Layout (chat bubble style)

The current layout is a uniform 2-column grid. The reference uses a distinct vertical stacked "chat bubble" style with day badges on the left of each row. Rather than rewriting the existing layout (which other themes still need), introduce a **layout variant** selectable by the user.

### Changes
- Add a new prop `layout: "grid" | "bubbles"` to `ScheduleCanvas`.
- Add a layout selector in `ScheduleEditor` ("Grid Modern" vs "Cute Bubbles"). Auto-default to `bubbles` when the `cute` or `sakura` theme is picked.
- Implement `bubbles` layout in `ScheduleCanvas.tsx`:
  - Left column (~720px wide): polaroid-style framed character card with a rotated tape sticker, soft pink border, "Schedule / date / Art by" caption strip at bottom — mimicking the phone-frame look from the reference.
  - Right column: 7 stacked rows. Each row is a rounded pill (chat bubble) with:
    - Square day badge on the left ("MON 15" two-line format) — derive 2-letter weekday + day-of-month from existing `day` string when possible, else fallback to original day text.
    - Title + note text in the middle.
    - Right side: time pill OR "OFFLINE" tag + small moon/cloud icon.
    - Tiny "x x x" decorative marks at bubble edges (typographic, in muted color).
  - Use existing theme tokens so any theme works; with the `cute` theme it will look like the reference.
- Keep the existing grid layout intact for non-bubble selection.

## 2. Hearts Ornament Fix

The current SVG mask path is malformed (incomplete heart curves) which is why nothing heart-shaped appears.

### Changes in `src/index.css`
- Replace `.ornament-hearts` mask with a clean, valid heart path:
  ```
  M50 88 C18 66 8 44 22 28 C32 16 46 18 50 32 C54 18 68 16 78 28 C92 44 82 66 50 88 Z
  ```
- Use a 100×100 tile with two hearts (one large, one small offset) for natural scatter.
- Use `background-color` directly under the mask so the heart fills with `hsl(var(--t-1))` solidly.
- Remove the glyph-overlay fallback for hearts in `ScheduleCanvas.tsx` (already excluded — keep that).

## 3. Sakura Ornament Polish
- Tighten the SVG path so each blossom uses 5 evenly rotated petals with a small center circle, removing the stray oval that currently looks off.
- Keep mask-based rendering; no glyph scatter overlay (already excluded).

## Files to edit
- `src/components/ScheduleCanvas.tsx` — add `layout` prop, implement bubble layout, helper to parse weekday/date.
- `src/components/ScheduleEditor.tsx` — add layout selector, auto-pick bubbles for cute/sakura, pass `layout` prop. Update default day strings to include date for nicer badges (e.g. "Senin 5").
- `src/index.css` — fix `.ornament-hearts` SVG mask, refine `.ornament-sakura` SVG mask.

## Out of scope
- No new dependencies.
- No changes to export/download pipeline (already renders the canvas verbatim).
