import type {
  DayItem,
  LayoutKey,
  OrnamentIconKey,
  OrnamentLayer,
  PlatformKey,
  Slot,
  SocialKey,
  TextureSettings,
  ThemeKey,
} from "@/components/ScheduleCanvas";
import { SOCIAL_KEYS } from "@/lib/palettes";
import {
  DEFAULT_SCRAP_DECO, DEFAULT_SCRAP_THEME, SCRAP_ANIMALS, SCRAP_COLOR_FIELDS,
  SCRAP_DECO_SETS, SCRAP_THEME_KEYS,
  type ScrapDecoConfig, type ScrapThemeColors, type ScrapThemeKey,
} from "@/template/scrapbook/types";

export const STORAGE_KEY = "vsm.state.v2";

export interface PersistedState {
  v: 1;
  savedAt: number;
  title: string;
  subtitle: string;
  dateRange: string;
  dateFrom: string | null; // ISO string
  dateTo: string | null; // ISO string
  artBy: string;
  youtubeHandle: string;   // legacy — mirror dari socials.youtube
  twitchHandle: string;    // legacy — mirror dari socials.twitch
  /** handle per platform ("" = tidak tampil) + saklar tampil per platform */
  socials: Record<SocialKey, string>;
  socialEnabled: Record<SocialKey, boolean>;
  days: DayItem[];
  characterUrl: string | null;
  charFit: "cover" | "contain";
  charScale: number;
  charOffsetX: number;
  charOffsetY: number;
  theme: ThemeKey;
  ornaments: OrnamentLayer[];
  layout: LayoutKey;
  ratio: "16:9"; // 4:3 dihapus — sekarang hanya 16:9
  texture: TextureSettings;
  /* scrapbook template (Layer C) */
  scrapTheme: ScrapThemeKey;
  scrapCustom: Partial<ScrapThemeColors>;
  scrapDeco: ScrapDecoConfig;
  scrapRibbonStart: string; // "" = otomatis dari rentang tanggal
  scrapRibbonEnd: string;
}

/**
 * "saved"    — state lengkap tersimpan.
 * "stripped" — localStorage penuh (biasanya gambar dataURL besar);
 *              pengaturan tersimpan TANPA gambar karakter/texture.
 * "error"    — penyimpanan gagal total.
 */
export type SaveResult = "saved" | "stripped" | "error";

const THEMES: readonly ThemeKey[] = [
  "cute", "aesthetic", "gothic", "sakura", "cyber", "mint", "royalred", "magic", "mono",
];
const LAYOUTS: readonly LayoutKey[] = ["grid", "bubbles", "royal", "celestial", "cat", "animal", "scrapbook"];
const RATIOS = ["16:9"] as const; // 4:3 dihapus
const FITS = ["cover", "contain"] as const;
const SCOPES = ["all", "background", "character"] as const;
const SLOT_TYPES: readonly Slot["type"][] = ["solo", "collab", "offline"];
const PLATFORMS: readonly PlatformKey[] = ["twitch", "youtube", "tiktok"];
const ORNAMENT_ICONS: readonly OrnamentIconKey[] = [
  "dot", "star", "sparkle", "heart", "sakura", "moon", "paw", "feather", "fish",
]; // slash (diagonal) & jelek (square/cross/circuit) dihapus, diganti feather/fish dari layout lain

/* ---------- tiny coercion helpers ---------- */
const asStr = (v: unknown, dflt = ""): string => (typeof v === "string" ? v : dflt);
const asNum = (v: unknown, dflt: number, min = -Infinity, max = Infinity): number =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : dflt;
const asBool = (v: unknown, dflt: boolean): boolean => (typeof v === "boolean" ? v : dflt);
const asPick = <T,>(v: unknown, allowed: readonly T[], dflt: T): T =>
  allowed.includes(v as T) ? (v as T) : dflt;
const asIso = (v: unknown): string | null => {
  if (typeof v !== "string" || !v) return null;
  return Number.isNaN(Date.parse(v)) ? null : v;
};
const asDataUrl = (v: unknown): string | null =>
  typeof v === "string" && v.startsWith("data:") ? v : null;

/* ---------- section sanitizers (defensive: jangan pernah lempar error) ---------- */
const sanitizeSlot = (raw: unknown): Slot => {
  const r = (raw ?? {}) as Record<string, unknown>;
  const platforms = Array.isArray(r.platforms)
    ? (r.platforms.filter((p): p is PlatformKey =>
        (PLATFORMS as readonly unknown[]).includes(p)))
    : [];
  return {
    time: asStr(r.time),
    title: asStr(r.title),
    note: asStr(r.note),
    type: asPick(r.type, SLOT_TYPES, "solo"),
    platforms,
  };
};

const sanitizeDays = (raw: unknown): DayItem[] => {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 14).map((d) => {
    const r = (d ?? {}) as Record<string, unknown>;
    return {
      day: asStr(r.day),
      slots:
        Array.isArray(r.slots) && r.slots.length > 0
          ? r.slots.slice(0, 4).map(sanitizeSlot)
          : [sanitizeSlot(null)],
    };
  });
};

const sanitizeOrnaments = (raw: unknown): OrnamentLayer[] => {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 3).map((l) => {
    const r = (l ?? {}) as Record<string, unknown>;
    return {
      icon: asPick(r.icon, ORNAMENT_ICONS, "star"),
      count: asNum(r.count, 40, 1, 200),
      size: asNum(r.size, 32, 8, 240),
      spacing: asNum(r.spacing, 160, 40, 500),
      offsetX: asNum(r.offsetX, 0, -400, 400),
      offsetY: asNum(r.offsetY, 0, -400, 400),
      rotation: asNum(r.rotation, 0, -180, 180),
      opacity: asNum(r.opacity, 0.35, 0, 1),
      color: asStr(r.color),
    };
  });
};

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const asHex = (v: unknown): string | null =>
  typeof v === "string" && HEX_RE.test(v.trim()) ? v.trim() : null;

const sanitizeScrapCustom = (raw: unknown): Partial<ScrapThemeColors> => {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;
  const out: Partial<ScrapThemeColors> = {};
  for (const { key } of SCRAP_COLOR_FIELDS) {
    const hex = asHex(r[key]);
    if (hex) out[key] = hex;
  }
  return out;
};

const sanitizeScrapDeco = (raw: unknown): ScrapDecoConfig => {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    animal: asPick(r.animal, SCRAP_ANIMALS, DEFAULT_SCRAP_DECO.animal),
    set: asPick(r.set, SCRAP_DECO_SETS, DEFAULT_SCRAP_DECO.set),
    showClouds: asBool(r.showClouds, true),
    showStickers: asBool(r.showStickers, true),
    showSidebar: asBool(r.showSidebar, true),
    showRibbon: asBool(r.showRibbon, true),
    decoColor: asHex(r.decoColor) ?? "",
  };
};

const sanitizeTexture = (raw: unknown): TextureSettings => {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    url: asDataUrl(r.url),
    blend: asStr(r.blend, "overlay"),
    opacity: asNum(r.opacity, 0.5, 0, 1),
    size: asNum(r.size, 100, 20, 400),
    repeat: asBool(r.repeat, true),
    scope: asPick(r.scope, SCOPES, "all"),
    offsetX: asNum(r.offsetX, 0, -100, 100),
    offsetY: asNum(r.offsetY, 0, -100, 100),
    rotation: asNum(r.rotation, 0, -180, 180),
  };
};

/**
 * Validasi + normalisasi data mentah dari localStorage.
 * Mengembalikan null bila data bukan state yang kita kenali
 * (salah bentuk / versi tidak cocok) — tidak pernah melempar error.
 */
export function sanitizeState(raw: unknown): PersistedState | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.v !== 1) return null;
  return {
    v: 1,
    savedAt: asNum(r.savedAt, 0),
    title: asStr(r.title),
    subtitle: asStr(r.subtitle),
    dateRange: asStr(r.dateRange),
    dateFrom: asIso(r.dateFrom),
    dateTo: asIso(r.dateTo),
    artBy: asStr(r.artBy),
    youtubeHandle: asStr(r.youtubeHandle),
    twitchHandle: asStr(r.twitchHandle),
    // Sosial media — handle legacy youtubeHandle/twitchHandle ikut dimigrasi
    socials: (() => {
      const raw = (r.socials ?? {}) as Record<string, unknown>;
      const pick = (k: SocialKey, legacy?: unknown): string => asStr(raw[k]) || asStr(legacy);
      return {
        youtube: pick("youtube", r.youtubeHandle),
        twitch: pick("twitch", r.twitchHandle),
        instagram: pick("instagram"),
        x: pick("x"),
        tiktok: pick("tiktok"),
      } as Record<SocialKey, string>;
    })(),
    socialEnabled: (() => {
      const raw = (r.socialEnabled ?? {}) as Record<string, unknown>;
      const dflt: Record<SocialKey, boolean> = {
        youtube: true, twitch: true, instagram: false, x: false, tiktok: false,
      };
      return Object.fromEntries(
        SOCIAL_KEYS.map((k) => [k, asBool(raw[k], dflt[k])])
      ) as Record<SocialKey, boolean>;
    })(),
    days: sanitizeDays(r.days),
    characterUrl: asDataUrl(r.characterUrl),
    charFit: asPick(r.charFit, FITS, "cover"),
    charScale: asNum(r.charScale, 1, 0.3, 3),
    charOffsetX: asNum(r.charOffsetX, 0, -100, 100),
    charOffsetY: asNum(r.charOffsetY, 0, -100, 100),
    theme: asPick(r.theme, THEMES, "cute"),
    ornaments: sanitizeOrnaments(r.ornaments),
    layout: (() => {
      const raw = asPick(r.layout, LAYOUTS, "bubbles");
      // migrasi: layout lama "animal" -> "cat" (Animal kini bernama Cat)
      return (raw === "animal" ? "cat" : raw) as LayoutKey;
    })(),
    ratio: asPick(r.ratio, RATIOS, "16:9"),
    texture: sanitizeTexture(r.texture),
    scrapTheme: asPick(r.scrapTheme, SCRAP_THEME_KEYS, DEFAULT_SCRAP_THEME),
    scrapCustom: sanitizeScrapCustom(r.scrapCustom),
    scrapDeco: sanitizeScrapDeco(r.scrapDeco),
    scrapRibbonStart: asStr(r.scrapRibbonStart),
    scrapRibbonEnd: asStr(r.scrapRibbonEnd),
  };
}

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitizeState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState): SaveResult {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return "saved";
  } catch {
    // Biasanya QuotaExceededError karena dataURL gambar besar → coba tanpa gambar.
    try {
      const slim: PersistedState = {
        ...state,
        characterUrl: null,
        texture: { ...state.texture, url: null },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
      return "stripped";
    } catch {
      return "error";
    }
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* abaikan */
  }
}
