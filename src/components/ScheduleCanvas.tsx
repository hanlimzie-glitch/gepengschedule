import { forwardRef } from "react";
import { Sparkles, Heart, Moon, Flower2, Skull, Cpu, Leaf, UserRound, UsersRound, CloudOff, Cloud, Twitch, Youtube, Crown, Wand2, Feather, Star } from "lucide-react";

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

export type ThemeKey = "cute" | "aesthetic" | "gothic" | "sakura" | "cyber" | "mint" | "royalred" | "magic";
export type LayoutKey = "grid" | "bubbles" | "royal" | "celestial";
export type OrnamentKey =
  | "dots" | "grid" | "diagonal" | "stars" | "hearts" | "sakura" | "crosses" | "circuit" | "magic" | "none";

export type ScheduleProps = {
  title: string;
  subtitle: string;
  dateRange: string;
  days: DayItem[];
  characterUrl: string | null;
  charFit: "cover" | "contain";
  theme: ThemeKey;
  ratio: "16:9" | "4:3";
  ornament: OrnamentKey;
  artBy?: string;
  layout?: LayoutKey;
  youtubeHandle?: string;
  twitchHandle?: string;
};

const themeIcon: Record<ThemeKey, JSX.Element> = {
  cute: <Heart className="w-6 h-6" fill="currentColor" />,
  aesthetic: <Sparkles className="w-6 h-6" />,
  gothic: <Skull className="w-6 h-6" />,
  sakura: <Flower2 className="w-6 h-6" fill="currentColor" />,
  cyber: <Cpu className="w-6 h-6" />,
  mint: <Leaf className="w-6 h-6" fill="currentColor" />,
  royalred: <Crown className="w-6 h-6" fill="currentColor" />,
  magic: <Wand2 className="w-6 h-6" />,
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
};

const typeMeta: Record<Slot["type"], { label: string; icon: JSX.Element }> = {
  solo: { label: "Solo", icon: <UserRound className="w-5 h-5" /> },
  collab: { label: "Collab", icon: <UsersRound className="w-5 h-5" /> },
  offline: { label: "Offline", icon: <CloudOff className="w-5 h-5" /> },
};

const ornamentGlyphs: Record<OrnamentKey, string[]> = {
  dots: ["•", "·", "•", "·"],
  grid: ["□", "◇", "□", "◇"],
  diagonal: ["╱", "╲", "╱", "╲"],
  stars: ["✦", "✧", "⋆", "✩"],
  hearts: ["♡", "♥", "♡", "❥"],
  sakura: ["✿", "❀", "✽", "✿"],
  crosses: ["✚", "✦", "†", "✚"],
  circuit: ["⌁", "◇", "⟐", "⌬"],
  none: [],
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
  ({ title, subtitle, dateRange, days: rawDays, characterUrl, charFit, theme, ratio, ornament, artBy, layout = "grid", youtubeHandle, twitchHandle }, ref) => {
    const w = 1920;
    const h = ratio === "16:9" ? 1080 : 1440;
    const days = rawDays.map(normalize);

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
        <div className={`absolute inset-0 ornament-${ornament}`} style={{ opacity: 0.95 }} />
        {ornament !== "none" && ornament !== "hearts" && ornament !== "sakura" && (
          <div className="absolute inset-0" style={{ pointerEvents: "none", color: "hsl(var(--t-1))" }}>
            {Array.from({ length: 36 }).map((_, i) => {
              const glyph = ornamentGlyphs[ornament][i % ornamentGlyphs[ornament].length];
              return (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${(i * 17) % 96}%`,
                    top: `${(i * 29) % 92}%`,
                    fontSize: 28 + ((i * 7) % 34),
                    opacity: 0.16 + ((i % 3) * 0.06),
                    transform: `rotate(${(i * 23) % 70 - 35}deg)`,
                    lineHeight: 1,
                  }}
                >
                  {glyph}
                </span>
              );
            })}
          </div>
        )}
        {layout !== "royal" && (
          <>
            <div className="absolute" style={{ top: -160, right: -160, width: 600, height: 600, borderRadius: "9999px", filter: "blur(80px)", opacity: 0.4, background: "var(--gradient-accent)" }} />
            <div className="absolute" style={{ bottom: -160, left: -160, width: 500, height: 500, borderRadius: "9999px", filter: "blur(80px)", opacity: 0.3, background: "hsl(var(--t-2))" }} />
          </>
        )}

        {layout === "royal" ? (
          <RoyalLayout
            title={title} subtitle={subtitle} dateRange={dateRange}
            days={days} characterUrl={characterUrl} charFit={charFit}
            artBy={artBy} youtubeHandle={youtubeHandle} twitchHandle={twitchHandle}
            theme={theme}
          />
        ) : layout === "celestial" ? (
          <CelestialLayout
            title={title} subtitle={subtitle} dateRange={dateRange}
            days={days} characterUrl={characterUrl} charFit={charFit}
            artBy={artBy} youtubeHandle={youtubeHandle} twitchHandle={twitchHandle}
            theme={theme}
          />
        ) : layout === "bubbles" ? (
          <BubbleLayout
            title={title} subtitle={subtitle} dateRange={dateRange} ratio={ratio}
            days={days} characterUrl={characterUrl} charFit={charFit} artBy={artBy}
          />
        ) : (
          <GridLayout
            title={title} subtitle={subtitle} dateRange={dateRange} ratio={ratio}
            days={days} characterUrl={characterUrl} charFit={charFit}
            theme={theme} artBy={artBy}
          />
        )}
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
};

const RoyalLayout = ({
  title, subtitle, dateRange, days, characterUrl, charFit, artBy, youtubeHandle, twitchHandle, theme,
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
          <img src={characterUrl} alt="character" crossOrigin="anonymous"
            style={{ width: "100%", height: "100%", objectFit: charFit, objectPosition: "center" }} />
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
const BubbleLayout = ({ title, subtitle, dateRange, ratio, days, characterUrl, charFit, artBy }: any) => {

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
              <img src={characterUrl} alt="VTuber character" crossOrigin="anonymous"
                style={{ width: "100%", height: "100%", objectFit: charFit, objectPosition: "center", display: "block" }} />
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
const GridLayout = ({ title, subtitle, dateRange, ratio, days, characterUrl, charFit, theme, artBy }: any) => (
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
          <img src={characterUrl} alt="VTuber character" crossOrigin="anonymous"
            style={{ width: "100%", height: "100%", objectFit: charFit, objectPosition: "center", display: "block" }} />
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
        <div className="flex-1 flex flex-col" style={{ gap: 14, justifyContent: "space-between" }}>
          {days.slice(0, 7).map((d: DayItem, i: number) => {
            const { abbr, num } = parseDay(d.day);
            const slots = d.slots.length ? d.slots : [{ time: "", title: "", note: "", type: "solo", platforms: [] } as Slot];
            const slot = slots[0];
            const isOffline = slot.type === "offline" || slots.every((s) => s.type === "offline");
            const DecoLeft = decoIcons[i % decoIcons.length];
            const DecoRight = decoIcons[(i + 3) % decoIcons.length];

            return (
              <div key={i} className="flex items-center" style={{ gap: 14, marginLeft: i % 2 === 1 ? 60 : 0 }}>
                <DayCircle abbr={abbr} num={num} color={p.text} border={p.deep} />
                <div className="relative flex-1" style={{
                  background: p.bubble,
                  borderRadius: 999,
                  border: `1.5px solid ${p.bubbleBorder}`,
                  padding: "14px 32px",
                  display: "flex", alignItems: "center", gap: 16,
                  boxShadow: `0 4px 20px rgba(0,0,0,0.25), inset 0 0 30px ${p.bubbleBorder}22`,
                  minHeight: 70,
                }}>
                  {/* deco left icon */}
                  <DecoLeft size={22} style={{ color: p.gold, flexShrink: 0 }} />
                  {/* constellation dots inside bubble */}
                  <svg width="60" height="20" style={{ flexShrink: 0, opacity: 0.6 }}>
                    <g fill={p.bubbleBorder}><circle cx="5" cy="10" r="1.2" /><circle cx="20" cy="6" r="1.2" /><circle cx="35" cy="14" r="1.2" /><circle cx="50" cy="8" r="1.2" /></g>
                    <g stroke={p.bubbleBorder} strokeWidth="0.4" fill="none"><path d="M5 10 L20 6 L35 14 L50 8" /></g>
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div style={{
                      fontSize: 26, fontWeight: 600, color: p.gold,
                      fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.1,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {isOffline ? "Stream Offline" : (slot.title || "Stream content here...")}
                    </div>
                    {(slot.note || isOffline) && (
                      <div style={{ fontSize: 14, color: "#d8c8ff", fontFamily: "'Inter', sans-serif", marginTop: 2, opacity: 0.8 }}>
                        - {isOffline ? "outside counting the stars" : (slot.note || "subtitle text here")}
                      </div>
                    )}
                  </div>
                  {/* right side: time pills or zZz */}
                  {isOffline ? (
                    <div style={{ color: p.bubbleBorder, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 22, opacity: 0.8, flexShrink: 0 }}>
                      zZzz...
                    </div>
                  ) : (
                    <div className="flex items-center" style={{ gap: 6, flexShrink: 0 }}>
                      {slots.slice(0, 3).map((s, si) => (
                        <span key={si} style={{
                          background: si === 1 ? p.gold : "transparent",
                          color: si === 1 ? p.bubble : "#fff",
                          border: si === 1 ? "none" : `1px solid ${p.bubbleBorder}88`,
                          padding: "4px 10px", borderRadius: 4,
                          fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em",
                          whiteSpace: "nowrap",
                        }}>{s.time || "—"}</span>
                      ))}
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
          <div className="relative" style={{
            flex: 1,
            borderRadius: "50% / 42%",
            overflow: "hidden",
            border: `2px solid ${p.bubbleBorder}`,
            boxShadow: `0 0 60px ${p.bubbleBorder}66, inset 0 0 40px rgba(255,255,255,0.15)`,
            background: `radial-gradient(circle at 50% 30%, rgba(255,255,255,0.35), transparent 60%), ${p.bubble}`,
          }}>
            {characterUrl ? (
              <img src={characterUrl} alt="character" crossOrigin="anonymous"
                style={{ width: "100%", height: "100%", objectFit: charFit, objectPosition: "center" }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ color: "rgba(255,255,255,0.7)", fontSize: 24, fontFamily: "'Cormorant Garamond', serif" }}>
                Upload your character ✦
              </div>
            )}
          </div>

          {/* Schedule big text */}
          <div className="relative" style={{ marginTop: 20, lineHeight: 0.9 }}>
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
                background: `linear-gradient(180deg, ${p.bubbleBorder} 0%, ${p.deep} 100%)`,
                WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
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
