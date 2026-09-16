/* ============================================================
   SCRAPBOOK TEMPLATE — Layer B (data shape helpers) & Layer C (theme)
   ------------------------------------------------------------
   The visual composition (Layer A) lives in ScrapbookLayout.tsx
   with FIXED positions. Everything here is data/theme only and
   must never contain positioning information.
   ============================================================ */

export type ScrapThemeKey = "pink" | "blue" | "purple" | "green" | "custom";

export const SCRAP_THEME_KEYS: readonly ScrapThemeKey[] = ["pink", "blue", "purple", "green", "custom"];

/** Layer C — every color the scrapbook template exposes for customization. */
export type ScrapThemeColors = {
  /** poster background */
  bg: string;
  /** fluffy cloud color */
  cloud: string;
  /** schedule paper */
  paper: string;
  /** secondary paper / scrapbook layer behind the character frame */
  layer2: string;
  /** main text on paper */
  text: string;
  /** secondary text (notes, dashed leaders) */
  sub: string;
  /** accent: badges, times, day-off text, starburst outlines */
  accent: string;
  /** date ribbon banner */
  ribbon: string;
  /** decorative stickers (stars / hearts) */
  deco: string;
  /** character stamp frame */
  frame: string;
  /** left username strip */
  strip: string;
};

export const SCRAP_THEME_PRESETS: Record<Exclude<ScrapThemeKey, "custom">, ScrapThemeColors> = {
  /* Original reference-inspired pastel pink scrapbook — the DEFAULT */
  pink: {
    bg: "#f6d3e3",
    cloud: "#fbe4ee",
    paper: "#fffdf8",
    layer2: "#ffffff",
    text: "#6d4a44",
    sub: "#ef9dbd",
    accent: "#ee6fa4",
    ribbon: "#f27ba8",
    deco: "#f2a0c0",
    frame: "#ffffff",
    strip: "#a2607a",
  },
  blue: {
    bg: "#cfe4f7",
    cloud: "#e2f0fb",
    paper: "#fbfdff",
    layer2: "#ffffff",
    text: "#3d5468",
    sub: "#7fb2d9",
    accent: "#4d94d6",
    ribbon: "#5b9edd",
    deco: "#9cc6ea",
    frame: "#ffffff",
    strip: "#54749a",
  },
  purple: {
    bg: "#e4daf6",
    cloud: "#f0e9fb",
    paper: "#fefcff",
    layer2: "#ffffff",
    text: "#54406b",
    sub: "#b394d6",
    accent: "#9a6fd0",
    ribbon: "#a678db",
    deco: "#c8aee8",
    frame: "#ffffff",
    strip: "#6f5694",
  },
  green: {
    bg: "#d7eedd",
    cloud: "#e7f6ea",
    paper: "#fcfffb",
    layer2: "#ffffff",
    text: "#3f5c48",
    sub: "#84bd97",
    accent: "#4da870",
    ribbon: "#5cb37e",
    deco: "#a2d4b3",
    frame: "#ffffff",
    strip: "#4f7a60",
  },
};

export const SCRAP_THEME_LABELS: Record<ScrapThemeKey, string> = {
  pink: "Pastel Pink",
  blue: "Pastel Blue",
  purple: "Pastel Purple",
  green: "Pastel Green",
  custom: "Custom",
};

export const DEFAULT_SCRAP_THEME: ScrapThemeKey = "pink";

/** Resolve the effective palette: preset, or custom overrides on top of pink. */
export const resolveScrapTheme = (
  key: ScrapThemeKey,
  custom: Partial<ScrapThemeColors>
): ScrapThemeColors =>
  key === "custom" ? { ...SCRAP_THEME_PRESETS.pink, ...custom } : SCRAP_THEME_PRESETS[key];

export const SCRAP_COLOR_FIELDS: { key: keyof ScrapThemeColors; label: string }[] = [
  { key: "bg", label: "Background" },
  { key: "cloud", label: "Clouds" },
  { key: "paper", label: "Schedule paper" },
  { key: "layer2", label: "Secondary paper" },
  { key: "text", label: "Main text" },
  { key: "sub", label: "Secondary text" },
  { key: "accent", label: "Accent" },
  { key: "ribbon", label: "Date ribbon" },
  { key: "deco", label: "Decorations" },
  { key: "frame", label: "Character frame" },
  { key: "strip", label: "Side strip" },
];

/* ------------------------------------------------------------
   Decoration config (controlled decoration system)
   ------------------------------------------------------------ */

export type ScrapAnimal = "cat" | "bunny" | "fox" | "bear";
export const SCRAP_ANIMALS: readonly ScrapAnimal[] = ["cat", "bunny", "fox", "bear"];
export const SCRAP_ANIMAL_LABELS: Record<ScrapAnimal, string> = {
  cat: "Cat", bunny: "Bunny", fox: "Fox", bear: "Bear",
};

export type ScrapDecoSet = "stars" | "hearts" | "mixed" | "minimal";
export const SCRAP_DECO_SETS: readonly ScrapDecoSet[] = ["stars", "hearts", "mixed", "minimal"];
export const SCRAP_DECO_SET_LABELS: Record<ScrapDecoSet, string> = {
  stars: "Stars", hearts: "Hearts", mixed: "Mixed", minimal: "Minimal",
};

export type ScrapDecoConfig = {
  animal: ScrapAnimal;
  set: ScrapDecoSet;
  showClouds: boolean;
  showStickers: boolean;   // scattered star/heart stickers
  showSidebar: boolean;    // left username strip
  showRibbon: boolean;     // date ribbon on the paper
  decoColor: string;       // "" = follow theme.deco
};

export const DEFAULT_SCRAP_DECO: ScrapDecoConfig = {
  animal: "cat",
  set: "stars",
  showClouds: true,
  showStickers: true,
  showSidebar: true,
  showRibbon: true,
  decoColor: "",
};
