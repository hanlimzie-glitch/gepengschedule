import { forwardRef } from "react";
import { Sparkles, Heart, Moon, Flower2, Skull, Cpu, Leaf, UserRound, UsersRound, CloudOff } from "lucide-react";

export type DayItem = {
  day: string;
  time: string;
  title: string;
  note: string;
  type: "solo" | "collab" | "offline";
};

export type ThemeKey = "cute" | "aesthetic" | "gothic" | "sakura" | "cyber" | "mint";
export type OrnamentKey =
  | "dots" | "grid" | "diagonal" | "stars" | "hearts" | "sakura" | "crosses" | "circuit" | "none";

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
};

const themeIcon: Record<ThemeKey, JSX.Element> = {
  cute: <Heart className="w-6 h-6" fill="currentColor" />,
  aesthetic: <Sparkles className="w-6 h-6" />,
  gothic: <Skull className="w-6 h-6" />,
  sakura: <Flower2 className="w-6 h-6" fill="currentColor" />,
  cyber: <Cpu className="w-6 h-6" />,
  mint: <Leaf className="w-6 h-6" fill="currentColor" />,
};

const themeFont: Record<ThemeKey, string> = {
  cute: "'Quicksand', 'Poppins', sans-serif",
  aesthetic: "'Playfair Display', 'Poppins', serif",
  gothic: "'Cormorant Garamond', 'Playfair Display', serif",
  sakura: "'Sawarabi Mincho', 'Playfair Display', serif",
  cyber: "'Orbitron', 'Poppins', sans-serif",
  mint: "'Quicksand', 'Poppins', sans-serif",
};

const typeMeta: Record<DayItem["type"], { label: string; icon: JSX.Element }> = {
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

export const ScheduleCanvas = forwardRef<HTMLDivElement, ScheduleProps>(
  ({ title, subtitle, dateRange, days, characterUrl, charFit, theme, ratio, ornament }, ref) => {
    const w = 1920;
    const h = ratio === "16:9" ? 1080 : 1440;

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
        {ornament !== "none" && (
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
        <div
          className="absolute"
          style={{
            top: -160, right: -160, width: 600, height: 600,
            borderRadius: "9999px", filter: "blur(80px)", opacity: 0.4,
            background: "var(--gradient-accent)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: -160, left: -160, width: 500, height: 500,
            borderRadius: "9999px", filter: "blur(80px)", opacity: 0.3,
            background: "hsl(var(--t-2))",
          }}
        />

        <div className="relative h-full flex flex-col" style={{ padding: 64 }}>
          <header className="flex items-end justify-between" style={{ marginBottom: 40 }}>
            <div>
              <div
                className="flex items-center"
                style={{ gap: 12, marginBottom: 12, fontSize: 24, color: "hsl(var(--t-1))" }}
              >
                {themeIcon[theme]}
                <span style={{ textTransform: "uppercase", letterSpacing: "0.4em", fontWeight: 600 }}>
                  Weekly Schedule
                </span>
                {themeIcon[theme]}
              </div>
              <h1
                className="glow-text"
                style={{ fontSize: 96, fontWeight: 900, lineHeight: 1, color: "hsl(var(--t-text))", margin: 0 }}
              >
                {title || "VTuber Schedule"}
              </h1>
              {subtitle && (
                <p style={{ marginTop: 16, fontSize: 30, fontWeight: 300, color: "hsl(var(--t-muted))" }}>
                  {subtitle}
                </p>
              )}
            </div>
            <div
              style={{
                textAlign: "right",
                padding: "16px 32px",
                borderRadius: 16,
                background: "hsl(var(--t-card) / 0.7)",
                border: "2px solid hsl(var(--t-border) / 0.6)",
              }}
            >
              <div style={{ fontSize: 20, textTransform: "uppercase", letterSpacing: "0.2em", color: "hsl(var(--t-1))" }}>
                Date
              </div>
              <div style={{ fontSize: 40, fontWeight: 700, marginTop: 4 }}>{dateRange}</div>
            </div>
          </header>

          <div className="flex-1 flex" style={{ gap: 40, minHeight: 0 }}>
            <div
              className="flex-1 grid"
              style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "repeat(4, 1fr)", gap: 20 }}
            >
              {days.map((d, i) => (
                <div
                  key={i}
                  className="relative flex"
                  style={{
                    gridColumn: i === days.length - 1 ? "span 2" : undefined,
                    gap: 20,
                    padding: 24,
                    borderRadius: 16,
                    background: "hsl(var(--t-card) / 0.75)",
                    border: "2px solid hsl(var(--t-border) / 0.5)",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <div
                    className="flex flex-col items-center justify-center"
                    style={{
                      padding: "0 20px", borderRadius: 12, minWidth: 140,
                      background: "var(--gradient-accent)", color: "hsl(var(--t-bg-to))",
                    }}
                  >
                    <div style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700, opacity: 0.85 }}>
                      Day
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.1, textAlign: "center" }}>{d.day}</div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center" style={{ gap: 12, marginBottom: 8 }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "hsl(var(--t-1))" }}>
                        {d.type === "offline" ? "—" : d.time || "—"}
                      </div>
                      <div
                        className="flex items-center"
                        style={{
                          gap: 8,
                          padding: "6px 12px",
                          borderRadius: 999,
                          background: d.type === "offline" ? "hsl(var(--t-muted) / 0.18)" : "hsl(var(--t-1) / 0.18)",
                          border: d.type === "offline" ? "1px solid hsl(var(--t-muted) / 0.35)" : "1px solid hsl(var(--t-border) / 0.45)",
                          color: d.type === "offline" ? "hsl(var(--t-muted))" : "hsl(var(--t-1))",
                          fontSize: 16,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {typeMeta[d.type].icon}
                        {typeMeta[d.type].label}
                      </div>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.15, color: "hsl(var(--t-text))" }}>
                      {d.type === "offline" ? d.title || "Offline" : d.title || "Free"}
                    </div>
                    {d.note && (
                      <div style={{ fontSize: 18, marginTop: 4, color: "hsl(var(--t-muted))" }}>
                        {d.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="relative flex-shrink-0 overflow-hidden"
              style={{
                width: ratio === "16:9" ? 600 : 700,
                height: "100%",
                borderRadius: 24,
                background: "hsl(var(--t-card))",
                border: "4px solid hsl(var(--t-border))",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              {characterUrl ? (
                <img
                  src={characterUrl}
                  alt="VTuber character"
                  crossOrigin="anonymous"
                  style={{
                    width: "100%", height: "100%",
                    objectFit: charFit, objectPosition: "center",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ fontSize: 28, color: "hsl(var(--t-muted))" }}
                >
                  Upload your character ✨
                </div>
              )}
              {[
                { top: 12, left: 12, bt: 4, bl: 4, br: 0, bb: 0, tl: 16 },
                { top: 12, right: 12, bt: 4, br: 4, bl: 0, bb: 0, tr: 16 },
                { bottom: 12, left: 12, bb: 4, bl: 4, bt: 0, br: 0, bbl: 16 },
                { bottom: 12, right: 12, bb: 4, br: 4, bt: 0, bl: 0, bbr: 16 },
              ].map((c, i) => (
                <div key={i} className="absolute" style={{
                  width: 48, height: 48,
                  top: (c as any).top, left: (c as any).left, right: (c as any).right, bottom: (c as any).bottom,
                  borderTopWidth: c.bt, borderLeftWidth: c.bl, borderRightWidth: c.br, borderBottomWidth: c.bb,
                  borderStyle: "solid", borderColor: "hsl(var(--t-1))",
                  borderTopLeftRadius: (c as any).tl ?? 0,
                  borderTopRightRadius: (c as any).tr ?? 0,
                  borderBottomLeftRadius: (c as any).bbl ?? 0,
                  borderBottomRightRadius: (c as any).bbr ?? 0,
                }} />
              ))}
            </div>
          </div>

          <footer
            className="flex items-center justify-between"
            style={{ marginTop: 32, fontSize: 20, color: "hsl(var(--t-muted))" }}
          >
            <span style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}>
              <Moon className="inline w-5 h-5 mr-2" /> Stay tuned ♡
            </span>
            <span style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}>All times local</span>
          </footer>
        </div>
      </div>
    );
  }
);
ScheduleCanvas.displayName = "ScheduleCanvas";
