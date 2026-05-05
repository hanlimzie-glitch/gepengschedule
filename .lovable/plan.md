## Fixes for ornaments + custom credit text

### 1. Hearts & Sakura ornaments — switch to inline SVG shapes

The current implementation uses two layers:
- A CSS background pattern (`.ornament-hearts`, `.ornament-sakura` in `src/index.css`) made of overlapping radial-gradients. These don't actually look like hearts or flowers — just blobs.
- A scattered Unicode glyph layer in `ScheduleCanvas.tsx` using `♡ ♥` and `✿ ❀ ✽`. These render inconsistently across fonts (often falls back to plain circles or boxes when exported via html-to-image), which is why hearts don't show and sakura looks like noise.

Fix:
- In `src/index.css`, replace `.ornament-hearts` and `.ornament-sakura` background patterns with `data:image/svg+xml` URL backgrounds containing actual heart and 5-petal sakura SVG shapes, tinted via `currentColor` substitution (color baked from theme `--t-1`). Use `background-size` ~120px tiles for a clean repeating pattern.
- In `ScheduleCanvas.tsx`, for `hearts` and `sakura` ornament keys, skip the Unicode glyph scatter layer (it's the source of the messy look) and rely entirely on the new SVG-tile background. For other ornaments (stars, crosses, circuit, diagonal, dots, grid) keep the current glyph scatter since those look fine.

### 2. Replace "All times local" with customizable "Art by"

- Add a new `artBy` string state in `ScheduleEditor.tsx` (default e.g. `"Art by @yourname"`).
- Add an input field in the "Judul" section labeled "Art credit (di bawah karakter)".
- Pass `artBy` as a new prop in `ScheduleProps` (`ScheduleCanvas.tsx`).
- In the canvas footer, replace the right-side `<span>All times local</span>` with the `artBy` text. Keep it visually styled the same (uppercase, letter-spaced, muted color). If empty, hide it.

### Files touched
- `src/index.css` — rewrite `.ornament-hearts` and `.ornament-sakura` with SVG tiles.
- `src/components/ScheduleCanvas.tsx` — skip glyph layer for hearts/sakura; add `artBy` prop; render in footer.
- `src/components/ScheduleEditor.tsx` — add `artBy` state, input field, pass prop.
