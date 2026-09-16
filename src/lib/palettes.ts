import type { ThemeKey } from "@/components/ScheduleCanvas";

/* Palet untuk layout poster. Diketik Record<ThemeKey, ...> sehingga TS
 * mewajibkan SETIAP tema punya entry — mencegah fallback diam-diam
 * seperti bug mono→magic di layout celestial sebelumnya. */

export type CelestialPalette = {
  from: string; to: string; bubble: string; bubbleBorder: string;
  gold: string; goldSoft: string; deep: string; text: string;
};

export const CELESTIAL_PALETTES: Record<ThemeKey, CelestialPalette> = {
  magic:     { from: "#7a4ad9", to: "#f3c97a", bubble: "#1a0f3a", bubbleBorder: "#c9a4ff", gold: "#f5d97a", goldSoft: "#fef3c7", deep: "#2a1158", text: "#2a1158" },
  cute:      { from: "#ffb3d1", to: "#ffd9b3", bubble: "#3a0a1f", bubbleBorder: "#ff8fb1", gold: "#ff8fb1", goldSoft: "#fff0f5", deep: "#7a1e3f", text: "#5a0e2e" },
  aesthetic: { from: "#7c3aed", to: "#7dd3fc", bubble: "#1a0a2e", bubbleBorder: "#a78bfa", gold: "#a78bfa", goldSoft: "#ede9fe", deep: "#2e1065", text: "#2e1065" },
  gothic:    { from: "#1a0000", to: "#dc2626", bubble: "#0a0a0a", bubbleBorder: "#dc2626", gold: "#dc2626", goldSoft: "#fee2e2", deep: "#7f1d1d", text: "#fff" },
  sakura:    { from: "#f9a8d4", to: "#fce7f3", bubble: "#3a0a1f", bubbleBorder: "#f472b6", gold: "#f472b6", goldSoft: "#fff0f5", deep: "#831843", text: "#831843" },
  cyber:     { from: "#0891b2", to: "#ec4899", bubble: "#0a1a2e", bubbleBorder: "#22d3ee", gold: "#22d3ee", goldSoft: "#cffafe", deep: "#0e7490", text: "#0a1a2e" },
  mint:      { from: "#34d399", to: "#a7f3d0", bubble: "#0a1f1a", bubbleBorder: "#34d399", gold: "#fbbf24", goldSoft: "#fef3c7", deep: "#064e3b", text: "#064e3b" },
  royalred:  { from: "#7a1e2c", to: "#e6c168", bubble: "#1a0a14", bubbleBorder: "#e6c168", gold: "#e6c168", goldSoft: "#f5e9c8", deep: "#3a0a14", text: "#3a0a14" },
  mono:      { from: "#2e2e2e", to: "#bdbdbd", bubble: "#101010", bubbleBorder: "#b5b5b5", gold: "#f5f5f5", goldSoft: "#ffffff", deep: "#141414", text: "#f5f5f5" },
};

export type AnimalPalette = {
  bg1: string; bg2: string; bg3: string; dot: string; ink: string;
  sub: string; accent: string; accent2: string; cream: string; chipInk: string;
};

// Alias: Cat = Animal (tema "Animal" kini bernama "Cat", palet sama)
export type CatPalette = AnimalPalette;

export const CAT_PALETTES: Record<ThemeKey, CatPalette> = {
  cute:      { bg1: "#ffe8f1", bg2: "#fff3e0", bg3: "#ffd9e8", dot: "#ffb4cf", ink: "#5b2a3e", sub: "#b07289", accent: "#ff6fa3", accent2: "#ffb84d", cream: "#fff8ef", chipInk: "#ffffff" },
  sakura:    { bg1: "#ffe4ee", bg2: "#ffeef4", bg3: "#ffd0e0", dot: "#f7a5c0", ink: "#6e2340", sub: "#b56d8a", accent: "#ff5c94", accent2: "#ffc0d4", cream: "#fff5f8", chipInk: "#ffffff" },
  mint:      { bg1: "#dff5e5", bg2: "#eefbe6", bg3: "#c9ecd3", dot: "#8fd3a5", ink: "#1f4a34", sub: "#5c8874", accent: "#57c48a", accent2: "#ffd66b", cream: "#f4fff2", chipInk: "#ffffff" },
  aesthetic: { bg1: "#ece1ff", bg2: "#dbe6ff", bg3: "#d6c8ff", dot: "#b6a3ec", ink: "#2f1f66", sub: "#7566a0", accent: "#8f6cf0", accent2: "#f5c76e", cream: "#f6f0ff", chipInk: "#ffffff" },
  cyber:     { bg1: "#d6f4ff", bg2: "#ffdaee", bg3: "#c7e8ff", dot: "#8fd0e2", ink: "#0f3a4a", sub: "#557080", accent: "#33a8c6", accent2: "#ff77b8", cream: "#eefaff", chipInk: "#ffffff" },
  gothic:    { bg1: "#2a1e26", bg2: "#180f17", bg3: "#38222f", dot: "#7a5a70", ink: "#f6e6ec", sub: "#b898a8", accent: "#e05c7c", accent2: "#f0b8c8", cream: "#241820", chipInk: "#ffffff" },
  royalred:  { bg1: "#fff0dc", bg2: "#ffddc4", bg3: "#ffe6cc", dot: "#e6b25c", ink: "#5c0f1a", sub: "#946060", accent: "#c2632e", accent2: "#e6b96a", cream: "#fff7ea", chipInk: "#ffffff" },
  magic:     { bg1: "#eadfff", bg2: "#fff0d8", bg3: "#e0d0ff", dot: "#c1a3ff", ink: "#2b1656", sub: "#7566a0", accent: "#9a76ff", accent2: "#ffd580", cream: "#f6f0ff", chipInk: "#ffffff" },
  mono:      { bg1: "#fafafa", bg2: "#efefef", bg3: "#f4f4f4", dot: "#cccccc", ink: "#0a0a0a", sub: "#5f5f5f", accent: "#1f1f1f", accent2: "#8a8a8a", cream: "#ffffff", chipInk: "#ffffff" },
};

// Backward compat: nama lama "ANIMAL" tetap diekspor agar state lama & import lama tidak pecah
export const ANIMAL_V2_PALETTES = CAT_PALETTES;

export type AnimalPalettesAlias = typeof CAT_PALETTES;

/* ---------- media sosial di footer poster ---------- */
export type SocialKey = "youtube" | "twitch" | "instagram" | "x" | "tiktok";

export const SOCIAL_KEYS: readonly SocialKey[] = ["youtube", "twitch", "instagram", "x", "tiktok"];
