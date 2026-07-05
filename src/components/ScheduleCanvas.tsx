import { forwardRef } from "react";
import { Sparkles, Heart, Moon, Flower2, Skull, Cpu, Leaf, UserRound, UsersRound, CloudOff, Cloud, Twitch, Youtube, Crown, Wand2, Feather, Star, PawPrint, Circle } from "lucide-react";
import animalPawAsset from "@/assets/animal/paw-pink.png.asset.json";

export type PlatformKey = "twitch" | "youtube" | "tiktok";

export type Slot = {
  time: string;
  title: string;
  note: string;
  type: "solo" | "collab" | "offline";
  platforms: PlatformKey[];
};

export type DayItem = {
  day: string;
  slots: Slot[];
};

export type ThemeKey = "cute" | "aesthetic" | "gothic" | "sakura" | "cyber" | "mint" | "royalred" | "magic" | "mono";
export type LayoutKey = "grid" | "bubbles" | "royal" | "celestial" | "animal";
export type OrnamentIconKey =
  | "dot" | "square" | "diagonal" | "star" | "sparkle" | "heart" | "sakura" | "cross" | "circuit" | "moon" | "paw";

export type OrnamentLayer = {
  icon: OrnamentIconKey;
  count: number;    // 1-200
  size: number;     // px 8-240
  spacing: number;  // grid cell size in px 40-500
  offsetX: number;  // px shift -400..400
  offsetY: number;  // px shift -400..400
  rotation: number; // deg -180..180
  opacity: number;  // 0..1
  color: string;    // "" = auto (theme color)
};

// legacy alias so old imports don't break
export type OrnamentKey = OrnamentIconKey;

export type TextureSettings = {
  url: string | null;
  blend: string; // CSS mix-blend-mode
  opacity: number; // 0-1
  size: number; // 50-400 (%)
  repeat: boolean;
  scope: "all" | "background" | "character";
  offsetX: number; // -100..100 (%)
  offsetY: number; // -100..100 (%)
  rotation: number; // -180..180 deg
};

export type ScheduleProps = {
  title: string;
  subtitle: string;
  dateRange: string;
  days: DayItem[];
  characterUrl: string | null;
  charFit: "cover" | "contain";
  theme: ThemeKey;
  ratio: "16:9" | "4:3";
  ornaments: OrnamentLayer[];
  artBy?: string;
  layout?: LayoutKey;
  youtubeHandle?: string;
  twitchHandle?: string;
  charScale?: number;
  charOffsetX?: number;
  charOffsetY?: number;
  texture?: TextureSettings;
};

export const CharImage = ({
  url, fit, scale = 1, ox = 0, oy = 0, pos = "center",
}: { url: string; fit: "cover" | "contain"; scale?: number; ox?: number; oy?: number; pos?: string }) => (
  <div style={{ width: "100%", height: "100%", overflow: "hidden", display: "block" }}>
    <img src={url} alt="character" crossOrigin="anonymous"
      style={{
        width: "100%", height: "100%",
        objectFit: fit, objectPosition: pos,
        transform: `translate(${ox}%, ${oy}%) scale(${scale})`,
        transformOrigin: "center center",
        display: "block",
      }} />
  </div>
);

const themeIcon: Record<ThemeKey, JSX.Element> = {
  cute: <Heart className="w-6 h-6" fill="currentColor" />,
  aesthetic: <Sparkles className="w-6 h-6" />,
  gothic: <Skull className="w-6 h-6" />,
  sakura: <Flower2 className="w-6 h-6" fill="currentColor" />,
  cyber: <Cpu className="w-6 h-6" />,
  mint: <Leaf className="w-6 h-6" fill="currentColor" />,
  royalred: <Crown className="w-6 h-6" fill="currentColor" />,
  magic: <Wand2 className="w-6 h-6" />,
  mono: <Circle className="w-6 h-6" fill="currentColor" />,
};

const themeFont: Record<ThemeKey, string> = {
  cute: "'Quicksand', 'Poppins', sans-serif",
  aesthetic: "'Playfair Display', 'Poppins', serif",
  gothic: "'Cormorant Garamond', 'Playfair Display', serif",
  sakura: "'Sawarabi Mincho', 'Playfair Display', serif",
  cyber: "'Orbitron', 'Poppins', sans-serif",
  mint: "'Quicksand', 'Poppins', sans-serif",
  royalred: "'Cormorant Garamond', 'Playfair Display', serif",
  magic: "'Cormorant Garamond', 'Playfair Display', serif",
  mono: "'Inter', 'Poppins', sans-serif",
};

const typeMeta: Record<Slot["type"], { label: string; icon: JSX.Element }> = {
  solo: { label: "Solo", icon: <UserRound className="w-5 h-5" /> },
  collab: { label: "Collab", icon: <UsersRound className="w-5 h-5" /> },
  offline: { label: "Offline", icon: <CloudOff className="w-5 h-5" /> },
};

/* ---------- Ornament icon renderers ---------- */
const IconSVG = ({ d, size, color }: { d: string; size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
    <path d={d} fill={color} />
  </svg>
);
const IconGlyph = ({ ch, size, color }: { ch: string; size: number; color: string }) => (
  <span style={{ fontSize: size, lineHeight: 1, color, display: "inline-block" }}>{ch}</span>
);
const renderOrnamentIcon = (icon: OrnamentIconKey, size: number, color: string): JSX.Element => {
  switch (icon) {
    case "dot":
      return <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill={color} /></svg>;
    case "square":
      return <IconGlyph ch="◇" size={size} color={color} />;
    case "diagonal":
      return <IconGlyph ch="╱" size={size} color={color} />;
    case "star":
      return <IconGlyph ch="✦" size={size} color={color} />;
    case "sparkle":
      return <IconGlyph ch="✧" size={size} color={color} />;
    case "heart":
      return <IconSVG size={size} color={color}
        d="M12 21s-7.5-4.6-9.9-9.2C.4 7.9 3 4 6.6 4c2.1 0 3.7 1.2 5.4 3.4C13.7 5.2 15.3 4 17.4 4 21 4 23.6 7.9 21.9 11.8 19.5 16.4 12 21 12 21z" />;
    case "sakura":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="12" cy="6" rx="3.2" ry="4.2" fill={color}
              transform={`rotate(${a} 12 12)`} />
          ))}
          <circle cx="12" cy="12" r="1.8" fill="#fff" opacity="0.9" />
        </svg>
      );
    case "cross":
      return <IconGlyph ch="✚" size={size} color={color} />;
    case "circuit":
      return <IconGlyph ch="⌁" size={size} color={color} />;
    case "moon":
      return <IconGlyph ch="☾" size={size} color={color} />;
    case "paw":
      return <IconSVG size={size} color={color}
        d="M12 13.5c-2.6 0-6 2.6-6 5 0 1.6 1.4 2.5 3 2.5 1 0 1.8-.4 3-.4s2 .4 3 .4c1.6 0 3-.9 3-2.5 0-2.4-3.4-5-6-5zM6 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM9.5 6.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm5 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />;
  }
};

/* Deterministic pseudo-random */
const seededRand = (i: number): number => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const generatePositions = (count: number, spacing: number, W: number, H: number, seedBase: number) => {
  const cols = Math.max(1, Math.floor(W / Math.max(20, spacing)));
  const rows = Math.max(1, Math.floor(H / Math.max(20, spacing)));
  const total = cols * rows;
  const cells = Array.from({ length: total }, (_, i) => i)
    .sort((a, b) => seededRand(a + seedBase * 1000) - seededRand(b + seedBase * 1000));
  const positions: { x: number; y: number; r: number }[] = [];
  const n = Math.min(count, total);
  const s = Math.max(20, spacing);
  const cellW = W / cols, cellH = H / rows;
  for (let k = 0; k < n; k++) {
    const idx = cells[k];
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const jx = (seededRand(idx * 3 + seedBase) - 0.5) * s * 0.35;
    const jy = (seededRand(idx * 3 + 1 + seedBase) - 0.5) * s * 0.35;
    positions.push({
      x: col * cellW + cellW / 2 + jx,
      y: row * cellH + cellH / 2 + jy,
      r: (seededRand(idx * 5 + seedBase) - 0.5) * 40,
    });
  }
  for (let k = total; k < count; k++) {
    positions.push({
      x: seededRand(k * 7 + seedBase) * W,
      y: seededRand(k * 7 + 1 + seedBase) * H,
      r: (seededRand(k * 11 + seedBase) - 0.5) * 40,
    });
  }
  return positions;
};

const OrnamentLayerView = ({ layer, W, H, idx }: { layer: OrnamentLayer; W: number; H: number; idx: number }) => {
  const color = layer.color?.trim() ? layer.color : "hsl(var(--t-1))";
  const positions = generatePositions(layer.count, layer.spacing, W, H, idx + 1);
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity: layer.opacity }}>
      {positions.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          left: p.x + layer.offsetX,
          top: p.y + layer.offsetY,
          transform: `translate(-50%,-50%) rotate(${layer.rotation + p.r}deg)`,
          lineHeight: 0,
        }}>
          {renderOrnamentIcon(layer.icon, layer.size, color)}
        </div>
      ))}
    </div>
  );
};


const DAY_ABBR: Record<string, string> = {
  minggu: "SUN", senin: "MON", selasa: "TUE", rabu: "WED", kamis: "THU", jumat: "FRI", sabtu: "SAT",
  sunday: "SUN", monday: "MON", tuesday: "TUE", wednesday: "WED", thursday: "THU", friday: "FRI", saturday: "SAT",
};
const parseDay = (raw: string) => {
  const m = raw.trim().match(/^(\S+)\s*(\d+)?/);
  const word = (m?.[1] || raw).toLowerCase();
  const abbr = DAY_ABBR[word] || (m?.[1] || raw).slice(0, 3).toUpperCase();
  const num = m?.[2] || "";
  return { abbr, num };
};

const TikTokIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M19.6 6.3a5.7 5.7 0 0 1-3.4-1.1V15a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.8a2.8 2.8 0 1 0 1.9 2.7V2h2.7a5.7 5.7 0 0 0 3.5 4.3v0z"/>
  </svg>
);

const PlatformBadge = ({ p, compact }: { p: PlatformKey; compact?: boolean }) => {
  const cfg: Record<PlatformKey, { bg: string; fg: string; label: string; icon: JSX.Element }> = {
    twitch: { bg: "#9146FF", fg: "#fff", label: "Twitch", icon: <Twitch size={compact ? 14 : 16} /> },
    youtube: { bg: "#FF0033", fg: "#fff", label: "YouTube", icon: <Youtube size={compact ? 14 : 16} /> },
    tiktok: { bg: "#000", fg: "#fff", label: "TikTok", icon: <TikTokIcon size={compact ? 12 : 14} /> },
  };
  const c = cfg[p];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: c.bg, color: c.fg,
      padding: compact ? "3px 10px" : "5px 12px",
      borderRadius: 999, fontSize: compact ? 13 : 15, fontWeight: 800, lineHeight: 1,
    }}>
      {c.icon}{!compact && c.label}
    </span>
  );
};

const PlatformBadges = ({ list, compact }: { list: PlatformKey[]; compact?: boolean }) => {
  if (!list || list.length === 0) return null;
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      {list.map((p) => <PlatformBadge key={p} p={p} compact={compact} />)}
    </span>
  );
};

// Normalize legacy day items (with flat fields) into slot-based shape
const normalize = (d: any): DayItem => {
  const normSlot = (s: any): Slot => {
    let platforms: PlatformKey[] = [];
    if (Array.isArray(s.platforms)) platforms = s.platforms.filter((p: any) => p && p !== "none");
    else if (s.platform && s.platform !== "none") platforms = [s.platform];
    return { time: s.time || "", title: s.title || "", note: s.note || "", type: s.type || "solo", platforms };
  };
  if (d.slots) return { day: d.day, slots: d.slots.map(normSlot) };
  return { day: d.day, slots: [normSlot(d)] };
};

export const ScheduleCanvas = forwardRef<HTMLDivElement, ScheduleProps>(
  ({ title, subtitle, dateRange, days: rawDays, characterUrl, charFit, theme, ratio, ornaments, artBy, layout = "grid", youtubeHandle, twitchHandle, charScale = 1, charOffsetX = 0, charOffsetY = 0, texture }, ref) => {
    const w = 1920;
    const h = ratio === "16:9" ? 1080 : 1440;
    const days = rawDays.map(normalize);

    const textureOverlay = texture?.url && (texture.scope === "all" || texture.scope === "background") ? (
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 1, mixBlendMode: texture.blend as any, opacity: texture.opacity }}
      >
        <div
          className="absolute"
          style={{
            inset: "-25%",
            backgroundImage: `url(${texture.url})`,
            backgroundSize: texture.repeat ? `${texture.size}%` : "cover",
            backgroundRepeat: texture.repeat ? "repeat" : "no-repeat",
            backgroundPosition: `${50 + (texture.offsetX ?? 0) / 2}% ${50 + (texture.offsetY ?? 0) / 2}%`,
            transform: `rotate(${texture.rotation ?? 0}deg)`,
            transformOrigin: "center center",
          }}
        />
      </div>
    ) : null;

    return (
      <div
        ref={ref}
        className={`schedule-canvas theme-${theme} relative overflow-hidden`}
        style={{
          width: w,
          height: h,
          background: "var(--gradient-theme)",
          color: "hsl(var(--t-text))",
          fontFamily: themeFont[theme],
        }}
      >
        {ornaments && ornaments.length > 0 && (
          <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
            {ornaments.slice(0, 3).map((ly, i) => (
              <OrnamentLayerView key={i} idx={i} layer={ly} W={w} H={h} />
            ))}
          </div>
        )}
        {layout !== "royal" && (
          <>
            <div className="absolute" style={{ top: -160, right: -160, width: 600, height: 600, borderRadius: "9999px", filter: "blur(80px)", opacity: 0.4, background: "var(--gradient-accent)" }} />
            <div className="absolute" style={{ bottom: -160, left: -160, width: 500, height: 500, borderRadius: "9999px", filter: "blur(80px)", opacity: 0.3, background: "hsl(var(--t-2))" }} />
          </>
        )}

        {textureOverlay}

        {(() => {
          const charProps = { characterUrl, charFit, charScale, charOffsetX, charOffsetY };
          if (layout === "royal") return <RoyalLayout title={title} subtitle={subtitle} dateRange={dateRange} days={days} {...charProps} artBy={artBy} youtubeHandle={youtubeHandle} twitchHandle={twitchHandle} theme={theme} />;
          if (layout === "celestial") return <CelestialLayout title={title} subtitle={subtitle} dateRange={dateRange} days={days} {...charProps} artBy={artBy} youtubeHandle={youtubeHandle} twitchHandle={twitchHandle} theme={theme} />;
          if (layout === "animal") return <AnimalLayout title={title} subtitle={subtitle} dateRange={dateRange} days={days} {...charProps} artBy={artBy} theme={theme} youtubeHandle={youtubeHandle} twitchHandle={twitchHandle} />;
          if (layout === "bubbles") return <BubbleLayout title={title} subtitle={subtitle} dateRange={dateRange} ratio={ratio} days={days} {...charProps} artBy={artBy} />;
          return <GridLayout title={title} subtitle={subtitle} dateRange={dateRange} ratio={ratio} days={days} {...charProps} theme={theme} artBy={artBy} />;
        })()}
      </div>
    );
  }
);
ScheduleCanvas.displayName = "ScheduleCanvas";

/* ============================================================
   ROYAL LAYOUT — matches the uploaded reference
   ============================================================ */
const parseRange = (s: string): { d1: string; m1: string; d2: string; m2: string } | null => {
  const m = s.match(/(\d{1,2})\s*[-–to]+\s*(\d{1,2})\s*([A-Za-zÀ-ÿ]+)/);
  if (!m) return null;
  const month = m[3].slice(0, 3).toUpperCase();
  return {
    d1: m[1].padStart(2, "0"), m1: month,
    d2: m[2].padStart(2, "0"), m2: month,
  };
};

type RoyalPalette = {
  dark: string; light: string; ribbon: string; tag: string; accent: string;
  textOnDark: string; textOnLight: string; borderDeep: string;
};

const ROYAL_PALETTES: Record<ThemeKey, RoyalPalette> = {
  royalred:  { dark: "#6b1622", light: "#e6c168", ribbon: "#1a1a1a", tag: "#f5e9c8", accent: "#c9a060", textOnDark: "#fff", textOnLight: "#3a0a14", borderDeep: "#9b1c2c" },
  cute:      { dark: "#c2185b", light: "#ffd9b3", ribbon: "#2a0a1a", tag: "#fff0f5", accent: "#ff8fb1", textOnDark: "#fff", textOnLight: "#5a0e2e", borderDeep: "#e91e63" },
  aesthetic: { dark: "#5b21b6", light: "#7dd3fc", ribbon: "#1a0a2e", tag: "#ede9fe", accent: "#a78bfa", textOnDark: "#fff", textOnLight: "#2e1065", borderDeep: "#7c3aed" },
  gothic:    { dark: "#0a0a0a", light: "#dc2626", ribbon: "#000000", tag: "#1f1f1f", accent: "#dc2626", textOnDark: "#fff", textOnLight: "#fff",     borderDeep: "#7f1d1d" },
  sakura:    { dark: "#9d174d", light: "#fce7f3", ribbon: "#3a0a1f", tag: "#fff0f5", accent: "#f472b6", textOnDark: "#fff", textOnLight: "#831843", borderDeep: "#be185d" },
  cyber:     { dark: "#0891b2", light: "#ec4899", ribbon: "#0a1a2e", tag: "#cffafe", accent: "#22d3ee", textOnDark: "#fff", textOnLight: "#831843", borderDeep: "#0e7490" },
  mint:      { dark: "#0f766e", light: "#a7f3d0", ribbon: "#0a1f1a", tag: "#ecfdf5", accent: "#34d399", textOnDark: "#fff", textOnLight: "#064e3b", borderDeep: "#115e59" },
  magic:     { dark: "#3a1d6e", light: "#f3d27a", ribbon: "#1a0f3a", tag: "#fef3c7", accent: "#c9a4ff", textOnDark: "#fff", textOnLight: "#2a1158", borderDeep: "#4c1d95" },
  mono:      { dark: "#0a0a0a", light: "#f5f5f5", ribbon: "#1a1a1a", tag: "#ffffff", accent: "#666666", textOnDark: "#fff", textOnLight: "#0a0a0a", borderDeep: "#2a2a2a" },
};

const RoyalLayout = ({
  title, subtitle, dateRange, days, characterUrl, charFit, artBy, youtubeHandle, twitchHandle, theme,
  charScale = 1, charOffsetX = 0, charOffsetY = 0,
}: any) => {
  const range = parseRange(dateRange) || { d1: "01", m1: "WEEK", d2: "07", m2: "OF" };
  const p: RoyalPalette = ROYAL_PALETTES[(theme as ThemeKey)] || ROYAL_PALETTES.royalred;

  return (
    <div className="relative h-full w-full" style={{
      background: `linear-gradient(90deg, ${p.dark} 0%, ${p.dark} 46%, ${p.light} 46%, ${p.light} 100%)`,
      fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
    }}>
      {/* LEFT character panel */}
      <div className="absolute" style={{ left: 0, top: 0, bottom: 0, width: "44%", overflow: "hidden" }}>
        <div className="absolute" style={{ inset: 0, background: "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15), transparent 60%)" }} />
        {[
          { top: 80, left: 60, size: 60, rot: 0 },
          { top: 200, right: 120, size: 70, rot: 15 },
          { bottom: 250, left: 100, size: 50, rot: -10 },
        ].map((s, i) => (
          <div key={i} className="absolute" style={{
            ...s, color: "#fff", fontSize: s.size, lineHeight: 1, fontWeight: 100, opacity: 0.85,
            textShadow: "0 0 20px rgba(255,255,255,0.5)",
          }}>✦</div>
        ))}
        {characterUrl ? (
          <CharImage url={characterUrl} fit={charFit} scale={charScale} ox={charOffsetX} oy={charOffsetY} pos="center" />

        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: "rgba(255,255,255,0.6)", fontSize: 28 }}>
            Upload your character ✨
          </div>
        )}
        <div className="absolute" style={{
          top: 50, right: 60, color: "rgba(255,255,255,0.85)",
          fontSize: 22, letterSpacing: "0.3em", fontFamily: "'Inter', sans-serif",
        }}>
          — {(artBy || "YOUR NAME").replace(/^Art by\s*/i, "").toUpperCase()}
        </div>
        <div className="absolute" style={{
          bottom: 100, left: 30, width: 110, height: 130, background: "#fff",
          padding: 8, transform: "rotate(-8deg)", boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        }}>
          <div style={{ width: "100%", height: "85%", background: `linear-gradient(135deg,${p.accent},${p.dark})` }} />
        </div>
        <div className="absolute" style={{
          bottom: 60, left: 130, width: 90, height: 110, background: "#fff",
          padding: 6, transform: "rotate(6deg)", boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        }}>
          <div style={{ width: "100%", height: "82%", background: `linear-gradient(135deg,${p.light},${p.borderDeep})` }} />
        </div>
        <div className="absolute" style={{ top: 0, bottom: 0, right: 0, width: 8, background: p.borderDeep }} />
      </div>

      {/* CENTER divider */}
      <div className="absolute" style={{
        left: "calc(44% - 50px)", top: 0, bottom: 0, width: 100,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: `linear-gradient(180deg, ${p.ribbon} 0%, ${p.dark} 50%, ${p.ribbon} 100%)`,
        borderLeft: `3px solid ${p.borderDeep}`, borderRight: `3px solid ${p.borderDeep}`,
      }}>
        <div style={{ color: "#fff", fontSize: 14, letterSpacing: "0.3em", marginBottom: 14, fontFamily: "'Inter', sans-serif" }}>WEEK OF</div>
        <DiamondBadge num={range.d1} label={range.m1} tag={p.tag} accent={p.accent} text={p.textOnLight} />
        <div style={{ color: "#fff", fontSize: 14, letterSpacing: "0.3em", margin: "20px 0", fontFamily: "'Inter', sans-serif" }}>TO</div>
        <DiamondBadge num={range.d2} label={range.m2} tag={p.tag} accent={p.accent} text={p.textOnLight} />
      </div>

      {/* RIGHT panel */}
      <div className="absolute" style={{ left: "calc(44% + 50px)", right: 0, top: 0, bottom: 0, padding: "40px 50px 40px 30px", display: "flex", flexDirection: "column" }}>
        <div className="flex items-start justify-between" style={{ marginBottom: 30 }}>
          <div style={{ color: p.textOnLight, lineHeight: 1 }}>
            <div style={{ fontSize: 32, fontWeight: 700, fontStyle: "italic", letterSpacing: "0.05em" }}>Weekly</div>
            <div style={{
              fontSize: 88, fontWeight: 900, fontStyle: "italic", marginTop: -8,
              fontFamily: "'Allura', 'Pinyon Script', 'Cormorant Garamond', cursive",
              color: p.dark,
              textShadow: "2px 2px 0 #fff",
            }}>
              {title || "Stream"} <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 48, fontWeight: 600, color: p.textOnLight }}>Schedule</span>
            </div>
            {subtitle && <div style={{ marginTop: 8, fontSize: 18, fontWeight: 500, color: p.textOnLight, opacity: 0.8, fontFamily: "'Inter', sans-serif", letterSpacing: "0.15em" }}>{subtitle}</div>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {youtubeHandle && (
              <div style={{
                background: "#fff", borderRadius: 999, padding: "8px 18px",
                display: "flex", alignItems: "center", gap: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)", fontFamily: "'Inter', sans-serif",
              }}>
                <Youtube size={20} color="#FF0033" />
                <span style={{ fontSize: 16, fontWeight: 600, color: p.textOnLight }}>{youtubeHandle}</span>
              </div>
            )}
            {twitchHandle && (
              <div style={{
                background: "#fff", borderRadius: 999, padding: "8px 18px",
                display: "flex", alignItems: "center", gap: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)", fontFamily: "'Inter', sans-serif",
              }}>
                <Twitch size={20} color="#9146FF" />
                <span style={{ fontSize: 16, fontWeight: 600, color: p.textOnLight }}>{twitchHandle}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col" style={{ gap: 10, justifyContent: "space-around" }}>
          {days.slice(0, 7).map((d: DayItem, i: number) => {
            const { abbr } = parseDay(d.day);
            const slots = d.slots.length ? d.slots : [{ time: "", title: "", note: "", type: "solo", platforms: [] } as Slot];
            const allOffline = slots.every((s) => s.type === "offline");
            const rowH = slots.length > 1 ? 96 : 70;
            const tagText = slots.length > 1
              ? `${abbr} | 2 STREAMS`
              : `${abbr} | ${allOffline ? "NO STREAM TODAY" : (slots[0].time || "—")}`;
            return (
              <div key={i} className="relative" style={{ display: "flex", alignItems: "center", height: rowH }}>
                <div style={{
                  background: p.tag, color: p.textOnLight, padding: "10px 16px", borderRadius: 6,
                  display: "flex", alignItems: "center", gap: 10, fontFamily: "'Inter', sans-serif",
                  fontSize: 14, fontWeight: 700, marginRight: -8, position: "relative", zIndex: 2,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)", whiteSpace: "nowrap",
                }}>{tagText}</div>
                <div style={{
                  flex: 1,
                  background: allOffline
                    ? `linear-gradient(90deg, ${p.borderDeep} 0%, ${p.dark} 50%, ${p.borderDeep} 100%)`
                    : `linear-gradient(90deg, ${p.ribbon} 0%, ${p.dark} 50%, ${p.ribbon} 100%)`,
                  color: "#fff", padding: "10px 50px",
                  clipPath: "polygon(20px 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 20px 100%, 0 50%)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  border: `2px solid ${p.accent}`, position: "relative", height: rowH, gap: 12,
                }}>
                  <span style={{ color: p.accent, fontSize: 24, lineHeight: 1, flexShrink: 0 }}>✻</span>
                  <div style={{ flex: 1, fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", justifyContent: "center", gap: slots.length > 1 ? 4 : 0 }}>
                    {slots.map((s, si) => {
                      const off = s.type === "offline";
                      return (
                        <div key={si} style={{
                          display: "flex", alignItems: "center", gap: 12, justifyContent: "center",
                          paddingTop: si > 0 ? 4 : 0,
                          borderTop: si > 0 ? `1px solid ${p.accent}73` : undefined,
                        }}>
                          {slots.length > 1 && (
                            <span style={{ color: p.accent, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", minWidth: 100, textAlign: "right" }}>
                              {off ? "OFFLINE" : (s.time || "—")}
                            </span>
                          )}
                          <div style={{ flex: 1, textAlign: "center", lineHeight: 1.1 }}>
                            <div style={{ fontSize: slots.length > 1 ? 17 : 20, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                              {off ? "— OFFLINE —" : (s.title || "Your Stream Schedule Here")}
                            </div>
                            {slots.length === 1 && (
                              <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.8, marginTop: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                {off ? "NO SCHEDULE TODAY" : (s.note || "Your subtitle schedule here")}
                              </div>
                            )}
                          </div>
                          <div style={{ minWidth: 110, display: "flex", justifyContent: "flex-start" }}>
                            <PlatformBadges list={s.platforms} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <span style={{ color: p.accent, fontSize: 24, lineHeight: 1, flexShrink: 0 }}>✻</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const DiamondBadge = ({ num, label, tag, accent, text }: { num: string; label: string; tag?: string; accent?: string; text?: string }) => (
  <div style={{
    width: 70, height: 70, transform: "rotate(45deg)",
    background: tag || "#f5e9c8", border: `2px solid ${accent || "#c9a060"}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  }}>
    <div style={{ transform: "rotate(-45deg)", textAlign: "center", color: text || "#3a0a14", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{num}</div>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", marginTop: 2 }}>{label}</div>
    </div>
  </div>
);


/* ============================================================
   BUBBLE LAYOUT (existing, with multi-slot support)
   ============================================================ */
const BubbleLayout = ({ title, subtitle, dateRange, ratio, days, characterUrl, charFit, artBy, charScale = 1, charOffsetX = 0, charOffsetY = 0 }: any) => {

  return (
    <div className="relative h-full flex" style={{ padding: 56, gap: 48 }}>
      <div className="relative flex-shrink-0" style={{ width: ratio === "16:9" ? 720 : 820 }}>
        <div className="relative" style={{
          height: "100%", background: "hsl(var(--t-card))", borderRadius: 36, padding: 24,
          boxShadow: "var(--shadow-glow)", border: "3px solid hsl(var(--t-border) / 0.55)",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{
            position: "absolute", top: -18, left: "50%", transform: "translateX(-50%) rotate(-3deg)",
            width: 160, height: 36, background: "hsl(var(--t-1) / 0.55)",
            border: "1px dashed hsl(var(--t-bg-to) / 0.6)", borderRadius: 4, zIndex: 5,
          }} />
          <div className="relative flex-1 overflow-hidden" style={{
            borderRadius: 24, background: "hsl(var(--t-bg-from))",
            border: "2px solid hsl(var(--t-border) / 0.4)",
          }}>
            {characterUrl ? (
              <CharImage url={characterUrl} fit={charFit} scale={charScale} ox={charOffsetX} oy={charOffsetY} pos="center" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ fontSize: 28, color: "hsl(var(--t-muted))" }}>
                Upload your character ✨
              </div>
            )}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 240,
              background: "linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.15) 70%, transparent)",
              pointerEvents: "none",
            }} />
            <div style={{ position: "absolute", top: 28, left: 28, right: 28, color: "white", textShadow: "0 2px 14px rgba(0,0,0,0.75), 0 0 4px rgba(0,0,0,0.6)" }}>
              <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1 }}>{title || "Schedule"}</div>
              <div style={{ fontSize: 24, fontWeight: 500, marginTop: 10, opacity: 0.95 }}>{dateRange}</div>
              {subtitle && <div style={{ fontSize: 20, fontWeight: 400, marginTop: 4, opacity: 0.9 }}>{subtitle}</div>}
            </div>
          </div>
          <div style={{
            marginTop: 16, padding: "14px 20px", borderRadius: 16,
            background: "hsl(var(--t-bg-from) / 0.7)", border: "1px solid hsl(var(--t-border) / 0.4)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <Heart className="w-5 h-5" fill="currentColor" style={{ color: "hsl(var(--t-1))" }} />
            <div style={{ fontSize: 18, color: "hsl(var(--t-text))", fontWeight: 600 }}>
              {artBy && artBy.trim() ? artBy : "Stay tuned ♡"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col" style={{ gap: 10, minHeight: 0 }}>
        {days.slice(0, 7).map((d: DayItem, i: number) => {
          const { abbr, num } = parseDay(d.day);
          const slots = d.slots.length ? d.slots : [{ time: "", title: "", note: "", type: "solo", platforms: [] } as Slot];
          const altRow = i % 2 === 1;
          return (
            <div key={i} className="relative flex items-stretch" style={{
              flex: 1, gap: 16, padding: "10px 16px 10px 10px", borderRadius: 28,
              background: altRow ? "hsl(var(--t-2) / 0.45)" : "hsl(var(--t-1) / 0.32)",
              border: "2px solid hsl(var(--t-border) / 0.45)", boxShadow: "var(--shadow-card)",
            }}>
              <div className="flex flex-col items-center justify-center flex-shrink-0" style={{
                width: 100, borderRadius: 18,
                background: "hsl(var(--t-card) / 0.9)",
                border: "2px solid hsl(var(--t-border) / 0.6)", color: "hsl(var(--t-text))",
              }}>
                <div style={{ fontSize: 14, color: "hsl(var(--t-1))", fontWeight: 700, letterSpacing: 2 }}>{num || "•"}</div>
                <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, letterSpacing: 2 }}>{abbr}</div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 6, justifyContent: "center" }}>
                {slots.map((s, si) => {
                  const isOffline = s.type === "offline";
                  return (
                    <div key={si} className="flex items-center" style={{
                      gap: 14,
                      paddingTop: si > 0 ? 6 : 0,
                      borderTop: si > 0 ? "1px dashed hsl(var(--t-border) / 0.55)" : undefined,
                    }}>
                      <div className="flex-1 min-w-0">
                        {isOffline ? (
                          <span style={{ fontSize: slots.length > 1 ? 18 : 22, fontWeight: 800, color: "hsl(var(--t-muted))", textTransform: "uppercase", letterSpacing: 4 }}>
                            Offline
                          </span>
                        ) : (
                          <>
                            <div style={{ fontSize: slots.length > 1 ? 20 : 24, fontWeight: 800, color: "hsl(var(--t-text))", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {s.title || "Free"}
                            </div>
                            {s.note && slots.length === 1 && (
                              <div style={{ fontSize: 15, color: "hsl(var(--t-muted))", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {s.note}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div className="flex items-center flex-shrink-0" style={{ gap: 8 }}>
                        <PlatformBadges list={s.platforms} />
                        {isOffline ? (
                          <Moon className="w-7 h-7" style={{ color: "hsl(var(--t-1))" }} fill="currentColor" />
                        ) : (
                          <span style={{
                            fontSize: slots.length > 1 ? 17 : 20, fontWeight: 800, padding: "6px 16px", borderRadius: 999,
                            background: "hsl(var(--t-1) / 0.55)", color: "white",
                            border: "2px solid hsl(var(--t-border) / 0.6)", whiteSpace: "nowrap",
                          }}>{s.time || "—"}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================
   GRID LAYOUT (existing, with multi-slot support)
   ============================================================ */
const GridLayout = ({ title, subtitle, dateRange, ratio, days, characterUrl, charFit, theme, artBy, charScale = 1, charOffsetX = 0, charOffsetY = 0 }: any) => (
  <div className="relative h-full flex flex-col" style={{ padding: 64 }}>
    <header className="flex items-end justify-between" style={{ marginBottom: 40 }}>
      <div>
      <div style={{
        background: "hsl(var(--t-card) / 0.6)",
        padding: "20px 32px", borderRadius: 20,
        border: "1px solid hsl(var(--t-border) / 0.4)",
        backdropFilter: "blur(6px)",
      }}>
        <div className="flex items-center" style={{ gap: 12, marginBottom: 12, fontSize: 24, color: "hsl(var(--t-1))" }}>
          {themeIcon[theme as ThemeKey]}
          <span style={{ textTransform: "uppercase", letterSpacing: "0.4em", fontWeight: 600 }}>Weekly Schedule</span>
          {themeIcon[theme as ThemeKey]}
        </div>
        <h1 className="glow-text" style={{ fontSize: 96, fontWeight: 900, lineHeight: 1, color: "hsl(var(--t-text))", margin: 0 }}>
          {title || "VTuber Schedule"}
        </h1>
        {subtitle && <p style={{ marginTop: 16, fontSize: 30, fontWeight: 300, color: "hsl(var(--t-muted))" }}>{subtitle}</p>}
      </div>
      </div>
      <div style={{ textAlign: "right", padding: "16px 32px", borderRadius: 16, background: "hsl(var(--t-card) / 0.7)", border: "2px solid hsl(var(--t-border) / 0.6)" }}>
        <div style={{ fontSize: 20, textTransform: "uppercase", letterSpacing: "0.2em", color: "hsl(var(--t-1))" }}>Date</div>
        <div style={{ fontSize: 40, fontWeight: 700, marginTop: 4 }}>{dateRange}</div>
      </div>
    </header>

    <div className="flex-1 flex" style={{ gap: 40, minHeight: 0 }}>
      <div className="flex-1 grid" style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "repeat(4, 1fr)", gap: 20 }}>
        {days.map((d: DayItem, i: number) => (
          <div key={i} className="relative flex" style={{
            gridColumn: i === days.length - 1 ? "span 2" : undefined,
            gap: 20, padding: 20, borderRadius: 16,
            background: "hsl(var(--t-card) / 0.75)", border: "2px solid hsl(var(--t-border) / 0.5)",
            boxShadow: "var(--shadow-card)",
          }}>
            <div className="flex flex-col items-center justify-center" style={{
              padding: "0 16px", borderRadius: 12, minWidth: 120,
              background: "var(--gradient-accent)", color: "hsl(var(--t-bg-to))",
            }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700, opacity: 0.85 }}>Day</div>
              <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.1, textAlign: "center" }}>{d.day}</div>
            </div>
            <div className="flex-1 flex flex-col justify-center" style={{ gap: 10 }}>
              {d.slots.map((s, si) => (
                <div key={si} style={{
                  paddingTop: si > 0 ? 10 : 0,
                  borderTop: si > 0 ? "1px dashed hsl(var(--t-border) / 0.5)" : undefined,
                }}>
                  <div className="flex items-center" style={{ gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "hsl(var(--t-1))" }}>
                      {s.type === "offline" ? "—" : s.time || "—"}
                    </div>
                    <div className="flex items-center" style={{
                      gap: 6, padding: "4px 10px", borderRadius: 999,
                      background: s.type === "offline" ? "hsl(var(--t-muted) / 0.18)" : "hsl(var(--t-1) / 0.18)",
                      border: "1px solid hsl(var(--t-border) / 0.45)",
                      color: s.type === "offline" ? "hsl(var(--t-muted))" : "hsl(var(--t-1))",
                      fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>
                      {typeMeta[s.type].icon}{typeMeta[s.type].label}
                    </div>
                    <PlatformBadges list={s.platforms} />
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15, color: "hsl(var(--t-text))" }}>
                    {s.type === "offline" ? s.title || "Offline" : s.title || "Free"}
                  </div>
                  {s.note && <div style={{ fontSize: 15, marginTop: 2, color: "hsl(var(--t-muted))" }}>{s.note}</div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="relative flex-shrink-0 overflow-hidden" style={{
        width: ratio === "16:9" ? 600 : 700, height: "100%", borderRadius: 24,
        background: "hsl(var(--t-card))", border: "4px solid hsl(var(--t-border))",
        boxShadow: "var(--shadow-glow)",
      }}>
        {characterUrl ? (
          <CharImage url={characterUrl} fit={charFit} scale={charScale} ox={charOffsetX} oy={charOffsetY} pos="center" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ fontSize: 28, color: "hsl(var(--t-muted))" }}>
            Upload your character ✨
          </div>
        )}
      </div>
    </div>

    <footer className="flex items-center justify-between" style={{ marginTop: 32, fontSize: 20, color: "hsl(var(--t-muted))" }}>
      <span style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}>
        <Moon className="inline w-5 h-5 mr-2" /> Stay tuned ♡
      </span>
      {artBy && artBy.trim() && (
        <span style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}>{artBy}</span>
      )}
    </footer>
  </div>
);

/* ============================================================
   CELESTIAL LAYOUT — purple/gold magic, oval character + bubble rows
   ============================================================ */
const CELESTIAL_PALETTES: Record<string, { from: string; to: string; bubble: string; bubbleBorder: string; gold: string; goldSoft: string; deep: string; text: string }> = {
  magic:     { from: "#7a4ad9", to: "#f3c97a", bubble: "#1a0f3a", bubbleBorder: "#c9a4ff", gold: "#f5d97a", goldSoft: "#fef3c7", deep: "#2a1158", text: "#2a1158" },
  cute:      { from: "#ffb3d1", to: "#ffd9b3", bubble: "#3a0a1f", bubbleBorder: "#ff8fb1", gold: "#ff8fb1", goldSoft: "#fff0f5", deep: "#7a1e3f", text: "#5a0e2e" },
  aesthetic: { from: "#7c3aed", to: "#7dd3fc", bubble: "#1a0a2e", bubbleBorder: "#a78bfa", gold: "#a78bfa", goldSoft: "#ede9fe", deep: "#2e1065", text: "#2e1065" },
  gothic:    { from: "#1a0000", to: "#dc2626", bubble: "#0a0a0a", bubbleBorder: "#dc2626", gold: "#dc2626", goldSoft: "#fee2e2", deep: "#7f1d1d", text: "#fff" },
  sakura:    { from: "#f9a8d4", to: "#fce7f3", bubble: "#3a0a1f", bubbleBorder: "#f472b6", gold: "#f472b6", goldSoft: "#fff0f5", deep: "#831843", text: "#831843" },
  cyber:     { from: "#0891b2", to: "#ec4899", bubble: "#0a1a2e", bubbleBorder: "#22d3ee", gold: "#22d3ee", goldSoft: "#cffafe", deep: "#0e7490", text: "#0a1a2e" },
  mint:      { from: "#34d399", to: "#a7f3d0", bubble: "#0a1f1a", bubbleBorder: "#34d399", gold: "#fbbf24", goldSoft: "#fef3c7", deep: "#064e3b", text: "#064e3b" },
  royalred:  { from: "#7a1e2c", to: "#e6c168", bubble: "#1a0a14", bubbleBorder: "#e6c168", gold: "#e6c168", goldSoft: "#f5e9c8", deep: "#3a0a14", text: "#3a0a14" },
};

const DayCircle = ({ abbr, num, color, border }: { abbr: string; num: string; color: string; border: string }) => (
  <div className="relative flex-shrink-0" style={{ width: 100, height: 100 }}>
    <svg width="100" height="100" viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
      <circle cx="50" cy="50" r="46" fill="none" stroke={border} strokeWidth="1" opacity="0.7" />
      <circle cx="50" cy="50" r="48" fill="none" stroke={border} strokeWidth="0.5" opacity="0.3" />
      <circle cx="8" cy="50" r="2" fill={border} />
      <circle cx="92" cy="50" r="2" fill={border} />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ color, fontFamily: "'Cormorant Garamond', serif" }}>
      <div style={{ fontSize: 16, fontStyle: "italic", lineHeight: 1, letterSpacing: "0.05em", opacity: 0.9 }}>{abbr.toLowerCase()}</div>
      <div style={{ fontSize: 38, fontWeight: 700, lineHeight: 1, marginTop: 2 }}>{num || "—"}<span style={{ fontSize: 22 }}>.</span></div>
    </div>
  </div>
);

const Constellation = ({ style }: { style: React.CSSProperties }) => (
  <svg viewBox="0 0 200 200" style={{ position: "absolute", pointerEvents: "none", ...style }}>
    <g stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" fill="none">
      <path d="M20 30 L60 50 L90 25 L130 60 L170 40" />
      <path d="M40 120 L80 100 L110 140 L150 110 L180 150" />
    </g>
    <g fill="rgba(255,255,255,0.85)">
      {[[20,30],[60,50],[90,25],[130,60],[170,40],[40,120],[80,100],[110,140],[150,110],[180,150]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2 : 1.4} />
      ))}
    </g>
  </svg>
);

const CelestialLayout = ({
  title, subtitle, dateRange, days, characterUrl, charFit, artBy, youtubeHandle, twitchHandle, theme,
  charScale = 1, charOffsetX = 0, charOffsetY = 0,
}: any) => {
  const p = CELESTIAL_PALETTES[theme as string] || CELESTIAL_PALETTES.magic;
  const decoIcons = [Feather, Sparkles, Moon, Star, Wand2, Feather, Sparkles];

  return (
    <div className="relative h-full w-full" style={{
      background: `linear-gradient(135deg, ${p.from} 0%, ${p.from} 40%, ${p.to} 100%)`,
      fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
      padding: "50px 60px",
    }}>
      {/* corner constellations */}
      <Constellation style={{ top: 20, right: 40, width: 360, height: 360, opacity: 0.55 }} />
      <Constellation style={{ bottom: 20, left: 20, width: 320, height: 320, opacity: 0.45, transform: "scaleY(-1)" }} />
      {/* warm sun glow top-right */}
      <div className="absolute" style={{
        top: -120, right: -80, width: 520, height: 520, borderRadius: "9999px",
        background: `radial-gradient(circle, ${p.to} 0%, transparent 65%)`, opacity: 0.7, filter: "blur(20px)",
      }} />
      {/* decorative leaf corners */}
      <div className="absolute" style={{ top: 30, left: 30, color: p.deep, fontSize: 64, opacity: 0.55, lineHeight: 1 }}>❦</div>
      <div className="absolute" style={{ top: 40, right: 60, color: p.deep, fontSize: 56, opacity: 0.5, lineHeight: 1 }}>❧</div>

      {/* Title */}
      <div className="relative text-center" style={{ marginBottom: 30, color: p.text }}>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: "0.01em" }}>
          {title || "Celestial Stream Schedule"}
        </div>
        {subtitle && (
          <div style={{ fontSize: 22, marginTop: 8, fontFamily: "'Inter', sans-serif", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.75 }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="relative flex" style={{ gap: 40, height: "calc(100% - 180px)" }}>
        {/* LEFT: schedule bubbles */}
        <div className="flex-1 flex flex-col" style={{ gap: 12, justifyContent: "space-between" }}>
          {days.slice(0, 7).map((d: DayItem, i: number) => {
            const { abbr, num } = parseDay(d.day);
            const slots = d.slots.length ? d.slots : [{ time: "", title: "", note: "", type: "solo", platforms: [] } as Slot];
            const allOffline = slots.every((s) => s.type === "offline");
            const multi = slots.length > 1;
            const DecoLeft = decoIcons[i % decoIcons.length];
            const DecoRight = decoIcons[(i + 3) % decoIcons.length];

            return (
              <div key={i} className="flex items-center" style={{ gap: 14, marginLeft: i % 2 === 1 ? 50 : 0 }}>
                <DayCircle abbr={abbr} num={num} color={p.text} border={p.deep} />
                <div className="relative flex-1" style={{
                  background: p.bubble,
                  borderRadius: multi ? 32 : 999,
                  border: `1.5px solid ${p.bubbleBorder}`,
                  padding: multi ? "14px 28px" : "14px 28px",
                  display: "flex", alignItems: "center", gap: 14,
                  boxShadow: `0 4px 20px rgba(0,0,0,0.25), inset 0 0 30px ${p.bubbleBorder}22`,
                  minHeight: 70,
                }}>
                  <DecoLeft size={22} style={{ color: p.gold, flexShrink: 0 }} />
                  <svg width="50" height="20" style={{ flexShrink: 0, opacity: 0.6 }}>
                    <g fill={p.bubbleBorder}><circle cx="5" cy="10" r="1.2" /><circle cx="20" cy="6" r="1.2" /><circle cx="35" cy="14" r="1.2" /></g>
                    <g stroke={p.bubbleBorder} strokeWidth="0.4" fill="none"><path d="M5 10 L20 6 L35 14" /></g>
                  </svg>
                  <div className="flex-1 min-w-0 flex flex-col" style={{ gap: multi ? 8 : 0 }}>
                    {allOffline ? (
                      <div>
                        <div style={{ fontSize: 26, fontWeight: 600, color: p.gold, lineHeight: 1.1, fontFamily: "'Cormorant Garamond', serif" }}>Stream Offline</div>
                        <div style={{ fontSize: 14, color: "#d8c8ff", fontFamily: "'Inter', sans-serif", opacity: 0.8, marginTop: 2 }}>
                          - {slots[0].note || "outside counting the stars"}
                        </div>
                      </div>
                    ) : (
                      slots.map((s, si) => (
                        <div key={si} style={{
                          paddingTop: si > 0 ? 8 : 0,
                          borderTop: si > 0 ? `1px dashed ${p.bubbleBorder}55` : undefined,
                        }}>
                          <div className="flex items-center" style={{ gap: 10, flexWrap: "wrap" }}>
                            <div style={{
                              fontSize: multi ? 20 : 24, fontWeight: 600, color: p.gold,
                              fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.15,
                              flex: "1 1 auto", minWidth: 0,
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>
                              {s.type === "offline" ? "Stream Offline" : (s.title || "Stream content here...")}
                            </div>
                            {s.time && s.type !== "offline" && (
                              <span style={{
                                background: p.gold, color: p.bubble,
                                padding: "3px 9px", borderRadius: 4,
                                fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
                                whiteSpace: "nowrap", flexShrink: 0,
                              }}>{s.time}</span>
                            )}
                          </div>
                          <div className="flex items-center" style={{ gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                            {s.note && (
                              <span style={{ fontSize: 13, color: "#d8c8ff", fontFamily: "'Inter', sans-serif", opacity: 0.8 }}>
                                - {s.note}
                              </span>
                            )}
                            {s.platforms && s.platforms.length > 0 && (
                              <PlatformBadges list={s.platforms} compact />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {allOffline && (
                    <div style={{ color: p.bubbleBorder, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 22, opacity: 0.8, flexShrink: 0 }}>
                      zZzz...
                    </div>
                  )}
                  <DecoRight size={20} style={{ color: p.gold, flexShrink: 0, opacity: 0.8 }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: character oval + schedule signature */}
        <div className="relative flex-shrink-0 flex flex-col" style={{ width: 520 }}>
          {/* outer frame wrapper */}
          <div className="relative" style={{ flex: 1, padding: 16 }}>
            {/* outer thin frame */}
            <div className="absolute pointer-events-none" style={{
              inset: 0,
              borderRadius: "50% / 42%",
              border: `1px solid ${p.bubbleBorder}88`,
              boxShadow: `0 0 30px ${p.bubbleBorder}33`,
            }} />
            {/* decorations on the outer frame: 4 stars + 1 moon */}
            <div className="absolute pointer-events-none" style={{ top: -10, left: "48%", color: p.gold }}>
              <Moon size={28} fill={p.gold} />
            </div>
            <div className="absolute pointer-events-none" style={{ top: "18%", right: -6, color: p.gold }}>
              <Star size={22} fill={p.gold} />
            </div>
            <div className="absolute pointer-events-none" style={{ bottom: "18%", right: -6, color: p.gold }}>
              <Star size={18} fill={p.gold} />
            </div>
            <div className="absolute pointer-events-none" style={{ bottom: -6, left: "46%", color: p.gold }}>
              <Star size={22} fill={p.gold} />
            </div>
            <div className="absolute pointer-events-none" style={{ top: "20%", left: -6, color: p.gold }}>
              <Star size={20} fill={p.gold} />
            </div>

            {/* inner oval */}
            <div className="relative h-full w-full" style={{
              borderRadius: "50% / 42%",
              overflow: "hidden",
              border: `2px solid ${p.bubbleBorder}`,
              boxShadow: `0 0 60px ${p.bubbleBorder}66, inset 0 0 40px rgba(255,255,255,0.15)`,
              background: `radial-gradient(circle at 50% 30%, rgba(255,255,255,0.35), transparent 60%), ${p.bubble}`,
            }}>
              {characterUrl ? (
                <CharImage url={characterUrl} fit={charFit} scale={charScale} ox={charOffsetX} oy={charOffsetY} pos="center" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: "rgba(255,255,255,0.7)", fontSize: 24, fontFamily: "'Cormorant Garamond', serif" }}>
                  Upload your character ✦
                </div>
              )}
            </div>
          </div>

          {/* Schedule big text */}
          <div className="relative" style={{ marginTop: 16, lineHeight: 0.9, zIndex: 5 }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 76, fontWeight: 700, letterSpacing: "0.1em",
              background: `linear-gradient(180deg, ${p.goldSoft} 0%, ${p.gold} 100%)`,
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
              textShadow: `0 2px 0 ${p.deep}44`,
            }}>SCHE</div>
            <div className="flex items-end justify-between" style={{ marginTop: -10 }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 76, fontWeight: 700, letterSpacing: "0.1em",
                background: `linear-gradient(180deg, ${p.goldSoft} 0%, ${p.gold} 100%)`,
                WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
                textShadow: `0 2px 0 ${p.deep}44`,
              }}>DULE</div>
              <div style={{ textAlign: "right", color: p.text, fontFamily: "'Cormorant Garamond', serif" }}>
                <div style={{ fontSize: 18, fontStyle: "italic", opacity: 0.8 }}>week of {dateRange}</div>
                {artBy && (
                  <div style={{ fontSize: 14, marginTop: 4, fontFamily: "'Inter', sans-serif", opacity: 0.7 }}>
                    {artBy}
                  </div>
                )}
              </div>
            </div>
            {(twitchHandle || youtubeHandle) && (
              <div className="flex items-center justify-end" style={{ gap: 14, marginTop: 10, color: p.text, fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
                {twitchHandle && <span className="flex items-center" style={{ gap: 6 }}><Twitch size={14} />{twitchHandle}</span>}
                {youtubeHandle && <span className="flex items-center" style={{ gap: 6 }}><Youtube size={14} />{youtubeHandle}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   ANIMAL LAYOUT v2 — fresh rebuild
   Uses ONLY: paw-pink.png, cat-frame.png, pill-bar.png
   Structure:
     • Top-center banner: title inside a pill-bar with paw badges on sides
     • Left column: 7 day rows (paw badge circle + pill-bar with slot info)
     • Right column: character portrait framed by cat-frame.png
     • Bottom footer: date range + art credit + socials
   ============================================================ */

const ANIMAL_V2_PALETTES: Record<string, { bg1: string; bg2: string; bg3: string; dot: string; ink: string; sub: string; accent: string; accent2: string; cream: string; chipInk: string }> = {
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

const ANIMAL_V2_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/* ============================================================
   POSTER COMPOSITION — not a dashboard.
   Full-bleed 1920×{1080|1440} art object.
   Asymmetric split: LEFT ~58% editorial column, RIGHT ~42% hero character silhouette
   bleeding off top & right edges. Oversized rotated wordmark, hand-drawn paw stamps,
   thin rule lines, numbered day list (01→07) with generous leading. No cards, no
   pills-in-a-row grid, no dashboard bars.
   ============================================================ */

const AnimalLayout = ({
  title, subtitle, dateRange, days,
  characterUrl, charFit, artBy, theme,
  youtubeHandle, twitchHandle,
  charScale = 1, charOffsetX = 0, charOffsetY = 0,
}: any) => {
  const p = ANIMAL_V2_PALETTES[theme as string] || ANIMAL_V2_PALETTES.cute;

  // Tiny hand-drawn paw glyph (inline SVG mark used as poster stamp)
  const PawStamp = ({ size = 40, color = p.accent, opacity = 1, rotate = 0 }: any) => (
    <svg width={size} height={size} viewBox="0 0 40 40"
         style={{ transform: `rotate(${rotate}deg)`, opacity, display: "block" }}>
      <g fill={color}>
        <ellipse cx="20" cy="26" rx="9" ry="7.5" />
        <ellipse cx="8"  cy="16" rx="3.6" ry="4.6" />
        <ellipse cx="32" cy="16" rx="3.6" ry="4.6" />
        <ellipse cx="14" cy="8"  rx="3"   ry="4"   />
        <ellipse cx="26" cy="8"  rx="3"   ry="4"   />
      </g>
    </svg>
  );

  const Heart = ({ size = 20, color = p.accent, opacity = 1, rotate = 0 }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24"
         style={{ transform: `rotate(${rotate}deg)`, opacity, display: "block" }}>
      <path d="M12 21s-7-4.5-9.5-9C.8 8.6 2.6 4.5 6.4 4.5c2 0 3.5 1 4.6 2.6C12.1 5.5 13.6 4.5 15.6 4.5c3.8 0 5.6 4.1 3.9 7.5C19 16.5 12 21 12 21z"
            fill={color} />
    </svg>
  );

  const Star = ({ size = 18, color = p.accent2, opacity = 1, rotate = 0 }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24"
         style={{ transform: `rotate(${rotate}deg)`, opacity, display: "block" }}>
      <path d="M12 2l2.4 6.6L21 9.6l-5 4.6L17.5 21 12 17.4 6.5 21 8 14.2l-5-4.6 6.6-1z" fill={color} />
    </svg>
  );

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: `radial-gradient(1200px 900px at 15% 10%, ${p.bg3} 0%, transparent 55%), radial-gradient(1000px 800px at 90% 90%, ${p.bg3} 0%, transparent 55%), linear-gradient(165deg, ${p.bg1} 0%, ${p.bg2} 100%)`,
        color: p.ink,
        fontFamily: "'Quicksand', 'Nunito', 'Poppins', sans-serif",
      }}
    >
      {/* ~~~ fluffy pastel blobs ~~~ */}
      <div className="absolute pointer-events-none" style={{
        top: -180, left: -160, width: 620, height: 620, borderRadius: "50%",
        background: `radial-gradient(closest-side, ${p.accent}33, transparent 70%)`, filter: "blur(10px)",
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: -220, right: -140, width: 700, height: 700, borderRadius: "50%",
        background: `radial-gradient(closest-side, ${p.accent2}33, transparent 70%)`, filter: "blur(10px)",
      }} />

      {/* ~~~ polka dot backdrop ~~~ */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             backgroundImage: `radial-gradient(${p.dot}66 3px, transparent 4px)`,
             backgroundSize: "38px 38px",
             opacity: 0.5,
             mixBlendMode: "multiply",
           }}
      />

      {/* ~~~ kawaii frame: dashed rounded border ~~~ */}
      <div className="absolute pointer-events-none"
           style={{ inset: 40, border: `4px dashed ${p.accent}`, borderRadius: 42, opacity: 0.85 }} />
      <div className="absolute pointer-events-none"
           style={{ inset: 56, border: `2px solid ${p.accent2}`, borderRadius: 32, opacity: 0.55 }} />

      {/* corner cute stamps instead of registration ticks */}
      <div className="absolute pointer-events-none" style={{ top: 28, left: 28 }}><Heart size={38} color={p.accent} rotate={-18} /></div>
      <div className="absolute pointer-events-none" style={{ top: 28, right: 28 }}><Star size={38} color={p.accent2} rotate={12} /></div>
      <div className="absolute pointer-events-none" style={{ bottom: 28, left: 28 }}><Star size={34} color={p.accent2} rotate={-8} /></div>
      <div className="absolute pointer-events-none" style={{ bottom: 28, right: 28 }}><Heart size={34} color={p.accent} rotate={22} /></div>


      {/* ~~~ CHARACTER: full-bleed hero, right ~44%, bleeds off top & right ~~~ */}
      <div
        className="absolute overflow-hidden"
        style={{
          top: -20, right: -40, bottom: 220, width: 900,
          zIndex: 2,
        }}
      >
        {/* soft radial halo behind character */}
        <div className="absolute" style={{
          inset: 40,
          background: `radial-gradient(closest-side, ${p.accent}33, transparent 70%)`,
          filter: "blur(20px)",
        }} />
        {characterUrl ? (
          <div className="relative w-full h-full">
            <CharImage url={characterUrl} fit={charFit || "contain"} scale={charScale} ox={charOffsetX} oy={charOffsetY} pos="center" />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3"
               style={{ color: p.sub, border: `2px dashed ${p.accent}66`, borderRadius: 24, margin: 40 }}>
            <PawStamp size={80} />
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Quicksand', sans-serif" }}>
              upload your character
            </div>
          </div>
        )}
      </div>

      {/* ~~~ HERO WORDMARK — oversized, rotated, off-center ~~~ */}
      <div className="absolute" style={{ top: 96, left: 96, zIndex: 6, maxWidth: 1080 }}>
        {/* micro eyebrow — issue no. */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 14,
          fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
          fontSize: 13, letterSpacing: "0.32em", textTransform: "uppercase",
          color: p.sub, marginBottom: 18,
        }}>
          <span style={{ width: 42, height: 1, background: p.sub, display: "inline-block" }} />
          Vol. 01 — Weekly Broadcast
          <PawStamp size={18} color={p.sub} opacity={0.7} rotate={-12} />
        </div>

        {/* huge display title */}
        <div style={{
          fontSize: 200,
          lineHeight: 0.86,
          fontWeight: 400,
          fontFamily: "'Fredoka One', 'Pacifico', 'Quicksand', cursive",
          letterSpacing: "-0.02em",
          color: p.accent,
          textShadow: `4px 4px 0 ${p.ink}, 8px 8px 0 ${p.accent2}55`,
          transform: "translateX(-6px) rotate(-2deg)",
        }}>
          Stream
        </div>
        <div style={{
          fontSize: 200,
          lineHeight: 0.86,
          fontWeight: 400,
          fontFamily: "'Fredoka One', 'Pacifico', 'Quicksand', cursive",
          letterSpacing: "-0.02em",
          color: p.cream,
          WebkitTextStroke: `4px ${p.ink}`,
          textShadow: `6px 6px 0 ${p.accent}66`,
          marginTop: -4,
          display: "flex", alignItems: "center", gap: 28,
          transform: "rotate(-1deg)",
        }}>
          <span>Schedule</span>
          <PawStamp size={72} color={p.accent} rotate={18} />
        </div>


        {/* sub-line: date range + issue tagline */}
        <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 22 }}>
          {dateRange && (
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 20, letterSpacing: "0.14em", textTransform: "uppercase",
              color: p.ink,
            }}>{dateRange}</span>
          )}
          <span style={{ flex: "0 0 60px", height: 1, background: p.ink, opacity: 0.5 }} />
          {(subtitle || title) && (
            <span style={{
              fontStyle: "italic",
              fontSize: 24,
              color: p.sub,
              fontFamily: "'Caveat', 'Pacifico', cursive",
              fontWeight: 700,
            }}>
              {subtitle || title}
            </span>
          )}
        </div>
      </div>

      {/* ~~~ EDITORIAL DAY LIST — numbered, typographic, no card chrome ~~~ */}
      <div className="absolute" style={{
        left: 96, top: 600, width: 1000, zIndex: 5,
      }}>
        {days.slice(0, 7).map((d: DayItem, i: number) => {
          const label = ANIMAL_V2_DAYS[i] || d.day.slice(0, 3).toLowerCase();
          const { num } = parseDay(d.day);
          const slots = d.slots.length ? d.slots : [{ time: "", title: "", note: "", type: "solo", platforms: [] } as Slot];
          const first = slots[0];
          const off = first.type === "offline";
          const idx = String(i + 1).padStart(2, "0");

          return (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "56px 130px 1fr auto",
              alignItems: "baseline",
              gap: 28,
              padding: "14px 0 14px 0",
              borderBottom: `2px dashed ${p.accent}55`,
            }}>
              {/* index number in a heart */}
              <span style={{
                position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 44, height: 44,
              }}>
                <Heart size={44} color={`${p.accent}33`} rotate={-6} />
                <span style={{
                  position: "absolute",
                  fontFamily: "'Fredoka One', 'Quicksand', cursive",
                  fontSize: 16, color: p.accent, letterSpacing: "0.02em",
                  lineHeight: 1,
                }}>{idx}</span>
              </span>

              {/* day + date */}
              <span style={{ display: "flex", alignItems: "baseline", gap: 10, lineHeight: 1 }}>
                <span style={{
                  fontFamily: "'Fredoka One', 'Quicksand', cursive",
                  fontSize: 36, fontWeight: 400, color: p.ink,
                  textTransform: "lowercase",
                }}>{label}</span>
                {num && (
                  <span style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: 22, fontWeight: 700, color: p.accent, letterSpacing: "0.02em",
                  }}>·{num}</span>
                )}
              </span>

              {/* title */}
              <span style={{
                fontFamily: "'Quicksand', 'Nunito', sans-serif",
                fontSize: off ? 26 : 28,
                fontWeight: off ? 600 : 700,
                fontStyle: off ? "italic" : "normal",
                color: off ? p.sub : p.ink,
                lineHeight: 1.15,
                letterSpacing: "-0.005em",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                display: "inline-flex", alignItems: "center", gap: 10,
              }}>
                {!off && <Heart size={14} color={p.accent} />}
                {off ? "— resting day —" : (first.title || "untitled broadcast")}
              </span>

              {/* right meta */}
              <span style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 28 }}>
                {!off && first.time && (
                  <span style={{
                    fontFamily: "'Fredoka One', 'Quicksand', cursive",
                    fontSize: 15, letterSpacing: "0.06em",
                    color: p.cream, background: p.accent,
                    padding: "6px 14px", borderRadius: 999,
                    border: `2px solid ${p.ink}`,
                    boxShadow: `2px 2px 0 ${p.ink}`,
                    whiteSpace: "nowrap",
                  }}>{first.time}</span>
                )}
                {!off && first.platforms?.length > 0 && (
                  <PlatformBadges list={first.platforms} compact />
                )}
                {off && (
                  <Star size={22} color={p.accent2} opacity={0.7} rotate={i * 17} />
                )}
              </span>
            </div>
          );

        })}
      </div>

      {/* ~~~ scattered kawaii accents (off-grid, deliberate) ~~~ */}
      <div className="absolute" style={{ top: 470, left: 60, zIndex: 4 }}>
        <PawStamp size={50} color={p.accent} rotate={-24} />
      </div>
      <div className="absolute" style={{ top: 78, right: 120, zIndex: 7 }}>
        <Star size={54} color={p.accent2} opacity={0.85} rotate={22} />
      </div>
      <div className="absolute" style={{ bottom: 260, left: "48%", zIndex: 4 }}>
        <Heart size={34} color={p.accent} opacity={0.75} rotate={20} />
      </div>
      <div className="absolute" style={{ top: 340, left: 40, zIndex: 4 }}>
        <Star size={22} color={p.accent2} opacity={0.85} rotate={-10} />
      </div>
      <div className="absolute" style={{ top: 560, right: 80, zIndex: 4 }}>
        <PawStamp size={34} color={p.accent2} opacity={0.7} rotate={30} />
      </div>

      {/* ~~~ FOOTER — kawaii ribbon strip ~~~ */}
      <div className="absolute" style={{ left: 96, right: 96, bottom: 88, zIndex: 8 }}>
        <div style={{ height: 3, borderRadius: 3, background: `repeating-linear-gradient(90deg, ${p.accent} 0 12px, transparent 12px 22px)`, opacity: 0.75, marginBottom: 18 }} />
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontFamily: "'Quicksand', 'Nunito', sans-serif",
          fontSize: 14, letterSpacing: "0.16em", textTransform: "uppercase",
          color: p.sub, fontWeight: 700,
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Heart size={16} color={p.accent} />
            {artBy ? <>Illust — <span style={{ color: p.ink }}>{artBy}</span></> : "Illust — —"}
          </span>
          <span style={{ color: p.accent, fontFamily: "'Caveat', 'Pacifico', cursive", textTransform: "none", letterSpacing: 0, fontSize: 26, fontWeight: 700 }}>
            a cozy weekly poster ♡
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {youtubeHandle && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Youtube size={14} /> {youtubeHandle}
              </span>
            )}
            {twitchHandle && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Twitch size={14} /> {twitchHandle}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};



