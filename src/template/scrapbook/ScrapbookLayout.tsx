/* ============================================================
   SCRAPBOOK TEMPLATE — Layer A: fixed visual composition
   ------------------------------------------------------------
   Recreates the reference pastel scrapbook poster on a fixed
   1920×1080 surface with absolute positioning. Positions,
   sizes, layering and rotations are CONSTANTS here; content
   (Layer B) and colors (Layer C) flow in via props and can
   never move the composition.
   ============================================================ */
import type { DayItem, Slot } from "@/components/ScheduleCanvas";
import { parseDay } from "@/lib/dayParse";
import {
  resolveScrapTheme,
  type ScrapThemeColors,
  type ScrapThemeKey,
  type ScrapDecoConfig,
} from "./types";
import {
  AnimalFace, ClockDot, CloudPuff, HeartSticker, RibbonBanner,
  SparkleGlyph, SpiralBinding, StampFrame, StarBurstBadge, StarSticker,
} from "./decorations";

export type ScrapbookLayoutProps = {
  /* Layer B — schedule data */
  title: string;
  subtitle: string;
  days: DayItem[];
  characterUrl: string | null;
  charFit: "cover" | "contain";
  charScale: number;
  charOffsetX: number;
  charOffsetY: number;
  artBy?: string;
  socialHandles: string[];
  ribbonStart: string;
  ribbonEnd: string;
  /* Layer C — theme + decoration */
  themeKey: ScrapThemeKey;
  custom: Partial<ScrapThemeColors>;
  deco: ScrapDecoConfig;
};

/* ---------- Layer A: fixed composition constants (never data-driven) ---------- */
const STRIP_W = 88;
const PAPER = { left: 150, top: 40, width: 950, height: 1000, rotate: -1.5 };
const HEADER_H = 250;                    // script line + big title + dashed rule
const ROWS_BOTTOM = 42;                  // paper bottom padding
const FRAME = { right: 108, top: 84, width: 660, height: 872, rotate: 4 };
const BACK_ROTATE = 8;

const CharImg = ({ url, fit, scale, ox, oy }: {
  url: string; fit: "cover" | "contain"; scale: number; ox: number; oy: number;
}) => (
  <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
    <img src={url} alt="character" crossOrigin="anonymous" style={{
      width: "100%", height: "100%", objectFit: fit, objectPosition: "center",
      transform: `translate(${ox}%, ${oy}%) scale(${scale})`,
      transformOrigin: "center center", display: "block",
    }} />
  </div>
);

const titleFontSize = (t: string) => {
  const n = t.length;
  if (n <= 8) return 84;
  if (n <= 12) return 70;
  if (n <= 16) return 58;
  if (n <= 22) return 48;
  if (n <= 28) return 40;
  return 34;
};

export const ScrapbookLayout = ({
  title, subtitle, days, characterUrl, charFit, charScale, charOffsetX, charOffsetY,
  artBy, socialHandles, ribbonStart, ribbonEnd, themeKey, custom, deco,
}: ScrapbookLayoutProps) => {
  const t = resolveScrapTheme(themeKey, custom);
  const decoColor = deco.decoColor.trim() || t.deco;
  const rows = days.slice(0, 7);
  const handles = socialHandles.filter((h) => h.trim()).slice(0, 4);
  const sidebarHandles = handles.length ? handles : ["@username"];

  const stickerStar = (size: number, rotate: number) => <StarSticker size={size} color={decoColor} rotate={rotate} />;
  const stickerHeart = (size: number, rotate: number) => <HeartSticker size={size} color={decoColor} rotate={rotate} />;
  const scattered: { x: number; y: number; el: (s: number, r: number) => React.ReactNode }[] =
    deco.set === "stars" ? [
      { x: 1128, y: 96, el: stickerStar }, { x: 1108, y: 560, el: stickerStar },
      { x: 1762, y: 40, el: stickerStar }, { x: 1806, y: 880, el: stickerStar },
      { x: 1150, y: 780, el: stickerStar },
    ] : deco.set === "hearts" ? [
      { x: 1128, y: 96, el: stickerHeart }, { x: 1108, y: 560, el: stickerHeart },
      { x: 1762, y: 40, el: stickerHeart }, { x: 1806, y: 880, el: stickerHeart },
      { x: 1150, y: 780, el: stickerHeart },
    ] : deco.set === "mixed" ? [
      { x: 1128, y: 96, el: stickerStar }, { x: 1108, y: 560, el: stickerHeart },
      { x: 1762, y: 40, el: stickerStar }, { x: 1806, y: 880, el: stickerHeart },
      { x: 1150, y: 780, el: stickerStar },
    ] : [];

  return (
    <div data-testid="scrap-root" className="relative h-full w-full overflow-hidden"
      style={{ background: t.bg, fontFamily: "'Quicksand','Nunito','Poppins',sans-serif" }}>

      {/* ── clouds (fixed positions, in front of paper/frame like the reference) ── */}
      {deco.showClouds && (
        <div data-testid="scrap-clouds" className="absolute inset-0 pointer-events-none" style={{ zIndex: 6 }}>
          <div className="absolute" style={{ left: -70, bottom: -60 }}>
            <CloudPuff width={400} height={150} color={t.cloud} />
          </div>
          <div className="absolute" style={{ right: -80, bottom: -90 }}>
            <CloudPuff width={880} height={290} color={t.cloud} flip />
          </div>
          <div className="absolute" style={{ right: 300, bottom: -120 }}>
            <CloudPuff width={620} height={230} color={t.cloud} />
          </div>
        </div>
      )}

      {/* ── scattered stickers (fixed positions, set-controlled glyphs) ── */}
      {deco.showStickers && scattered.length > 0 && (
        <div data-testid="scrap-stickers" className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          {scattered.map((s, i) => (
            <div key={i} className="absolute" style={{ left: s.x, top: s.y }}>
              {s.el(i % 2 === 0 ? 58 : 40, (i * 37) % 40 - 20)}
            </div>
          ))}
        </div>
      )}

      {/* ── left username strip ── */}
      {deco.showSidebar && (
        <div data-testid="scrap-sidebar" className="absolute" style={{ left: 0, top: 0, bottom: 0, width: STRIP_W, zIndex: 3 }}>
          <div className="absolute inset-0" style={{ background: t.strip }} />
          {/* scalloped right edge */}
          <div className="absolute" style={{ top: 0, bottom: 0, right: -11, width: 22, overflow: "hidden" }}>
            <div style={{
              width: 22, height: "100%",
              backgroundImage: `radial-gradient(circle at 0 14px, ${t.strip} 11px, transparent 12px)`,
              backgroundSize: `22px 30px`, backgroundRepeat: "repeat-y",
            }} />
          </div>
          <div className="absolute inset-0 flex flex-col items-center"
            style={{ justifyContent: "space-around", padding: "26px 0" }}>
            {sidebarHandles.map((h, i) => (
              <div key={i} style={{
                background: t.paper, borderRadius: 999, padding: "14px 0",
                width: 46, display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                boxShadow: "0 3px 10px rgba(0,0,0,0.18)",
              }}>
                <AnimalFace animal={deco.animal} size={26} body={decoColor} inner={t.paper} ink={t.strip} />
                <span style={{
                  writingMode: "vertical-rl", transform: "rotate(180deg)",
                  fontSize: 15, fontWeight: 700, color: t.strip, letterSpacing: "0.06em",
                  maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── schedule paper (fixed zone) ── */}
      <div data-testid="scrap-paper" className="absolute" style={{
        left: PAPER.left, top: PAPER.top, width: PAPER.width, height: PAPER.height,
        transform: `rotate(${PAPER.rotate}deg)`, zIndex: 4,
      }}>
        <div className="absolute inset-0" style={{
          background: t.paper, borderRadius: 16,
          boxShadow: "0 22px 60px rgba(90,40,70,0.18), 0 4px 14px rgba(90,40,70,0.10)",
        }} />
        {/* spiral binding */}
        <div className="absolute" style={{ left: -16, top: 20, bottom: 20 }}>
          <SpiralBinding height={PAPER.height - 40} color={t.sub} />
        </div>

        {/* date ribbon */}
        {deco.showRibbon && (
          <div data-testid="scrap-ribbon" className="absolute" style={{ top: -26, right: 90, zIndex: 6 }}>
            <RibbonBanner width={118} height={196} color={t.ribbon}>
              <span style={{ color: "#fff", fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{ribbonStart}</span>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 800, letterSpacing: "0.2em", margin: "8px 0" }}>••</span>
              <span style={{ color: "#fff", fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{ribbonEnd}</span>
            </RibbonBanner>
          </div>
        )}

        {/* header */}
        <div className="absolute" style={{ left: 88, right: 60, top: 56, height: HEADER_H - 60 }}>
          <div style={{
            fontFamily: "'Caveat','Pacifico',cursive", fontSize: 40, fontWeight: 700,
            color: t.accent, lineHeight: 1, transform: "rotate(-2deg)", transformOrigin: "left bottom",
          }}>
            {subtitle.trim() || "weekly"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 2 }}>
            <span style={{
              fontFamily: "'Fredoka One','Quicksand',cursive", fontSize: titleFontSize(title || "schedule"),
              color: t.text, lineHeight: 1.05, letterSpacing: "0.01em",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{title || "schedule"}</span>
            <SparkleGlyph size={34} color={t.sub} />
          </div>
          <div style={{ marginTop: 18, borderBottom: `3px dashed ${t.sub}`, opacity: 0.75 }} />
        </div>

        {/* seven fixed rows */}
        <div data-testid="scrap-rows" className="absolute" style={{
          left: 88, right: 56, top: HEADER_H + 30, bottom: ROWS_BOTTOM,
          display: "flex", flexDirection: "column",
        }}>
          {Array.from({ length: 7 }, (_, i) => {
            const d: DayItem | undefined = rows[i];
            const { abbr, num } = parseDay(d?.day ?? "");
            const slot: Slot = d?.slots?.[0] ?? { time: "", title: "", note: "", type: "solo", platforms: [] };
            const off = slot.type === "offline";
            return (
              <div key={i} data-testid={`scrap-row-${i}`} style={{
                flex: "1 1 0", minHeight: 0, display: "flex", alignItems: "center", gap: 22,
              }}>
                {off || !d ? (
                  off ? (
                    <div className="w-full flex items-center justify-center" style={{ gap: 16 }}>
                      <StarSticker size={26} color={t.accent} rotate={-14} />
                      <span style={{
                        fontSize: 27, fontWeight: 800, color: t.accent,
                        letterSpacing: "0.12em", textTransform: "uppercase",
                      }}>{slot.title || "Day Off — No Stream"}</span>
                      <StarSticker size={26} color={t.accent} rotate={14} />
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-center">
                      <span style={{ fontSize: 22, fontWeight: 700, color: t.sub, opacity: 0.7, letterSpacing: "0.1em" }}>—</span>
                    </div>
                  )
                ) : (
                  <>
                    <StarBurstBadge size={78} outline={t.accent} fill={t.paper}>
                      <span style={{ fontSize: 24, fontWeight: 800, color: t.text, lineHeight: 1 }}>{num || String(i + 1).padStart(2, "0")}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: t.sub, letterSpacing: "0.08em", marginTop: 3 }}>{abbr}</span>
                    </StarBurstBadge>
                    <div style={{ flex: "0 1 auto", minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{
                        fontSize: 29, fontWeight: 800, color: t.text, textTransform: "uppercase",
                        letterSpacing: "0.03em", lineHeight: 1.1,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>{slot.title || "—"}</span>
                      {slot.note && (
                        <span style={{
                          fontSize: 17, fontWeight: 600, color: t.sub, lineHeight: 1.1,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>{slot.note}</span>
                      )}
                    </div>
                    <div style={{ flex: 1, borderBottom: `3px dotted ${t.sub}`, opacity: 0.7, minWidth: 40, marginBottom: 18 }} />
                    {slot.time && (
                      <div data-testid="scrap-time" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                        <ClockDot size={22} color={t.accent} />
                        <span style={{ fontSize: 24, fontWeight: 800, color: t.accent, whiteSpace: "nowrap" }}>{slot.time}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── character scrapbook cluster (fixed zone) ── */}
      <div data-testid="scrap-char" className="absolute" style={{
        right: FRAME.right, top: FRAME.top, width: FRAME.width, height: FRAME.height, zIndex: 5,
      }}>
        {/* secondary paper layer behind */}
        <div className="absolute" style={{
          inset: 0, background: t.layer2, borderRadius: 6,
          transform: `rotate(${BACK_ROTATE - FRAME.rotate}deg) translate(26px, 18px)`,
          boxShadow: "0 14px 40px rgba(90,40,70,0.16)",
        }} />
        {/* stamp frame */}
        <div className="absolute inset-0" style={{ transform: `rotate(0deg)` }}>
          <StampFrame width={FRAME.width} height={FRAME.height} frame={t.frame} punch={t.bg}>
            <div className="absolute" style={{ inset: 26, overflow: "hidden", background: t.cloud }}>
              {characterUrl ? (
                <CharImg url={characterUrl} fit={charFit} scale={charScale} ox={charOffsetX} oy={charOffsetY} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center" style={{ gap: 14, color: t.sub }}>
                  <AnimalFace animal={deco.animal} size={110} body={decoColor} inner={t.paper} ink={t.text} />
                  <span style={{ fontSize: 24, fontWeight: 700 }}>upload your character</span>
                </div>
              )}
            </div>
            {/* vertical art credit on the right border */}
            <div className="absolute" style={{
              right: 4, top: "50%", transform: "translateY(-50%) rotate(90deg)",
              transformOrigin: "center", whiteSpace: "nowrap",
              fontSize: 19, fontWeight: 700, color: t.text, opacity: 0.65, fontFamily: "'Caveat','Pacifico',cursive",
            }}>
              art by: {(artBy || "@artistname").replace(/^art\s*by\s*/i, "")}
            </div>
          </StampFrame>
        </div>
        {/* peeking animal + star sticker on the top corner */}
        <div className="absolute pointer-events-none" style={{ top: -46, left: 60, zIndex: 7 }}>
          <AnimalFace animal={deco.animal} size={86} body={t.frame} inner={decoColor} ink={t.text} />
        </div>
        <div className="absolute pointer-events-none" style={{ top: -34, left: 118, zIndex: 8 }}>
          <StarSticker size={120} color={decoColor} rotate={-14} />
        </div>
        <div className="absolute pointer-events-none" style={{ bottom: -20, right: -18, zIndex: 7 }}>
          <HeartSticker size={54} color={decoColor} rotate={12} />
        </div>
      </div>
    </div>
  );
};
