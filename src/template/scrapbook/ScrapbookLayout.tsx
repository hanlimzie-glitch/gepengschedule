/* ============================================================
   SCRAPBOOK TEMPLATE — Layer A: fixed visual composition
   ------------------------------------------------------------
   Recreates the reference pastel scrapbook poster on a fixed
   1920×1080 surface. Every major element has an explicit
   position / size / rotation / layer order (constants below);
   content (Layer B) and colors (Layer C) flow in via props and
   can never move the composition.

   Measured from the reference (scaled to 1920×1080):
   - username strip      ≈ 4.4% wide, full height, far left
   - schedule paper      ≈ left 6%, top 2.5%, 52% wide, 95% high, rot ≈ -2.4°
   - character stamp     ≈ right 5%, top 6%, 35% wide, 83% high, rot ≈ +3.5°
   - date ribbon         hangs over the paper's top-right corner
   - clouds              in FRONT of paper & frame along the bottom
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
  SparkleGlyph, StampFrame, StarBurstBadge, StarSticker,
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
const STRIP_W = 84;
const PAPER = { left: 118, top: 26, width: 1000, height: 1024, rotate: -2.4 };
const HEADER_TOP = 52;
const ROWS_TOP = 296;                    // rows ALWAYS start here
const ROWS_BOTTOM = 40;
const FRAME = { right: 96, top: 64, width: 680, height: 900, rotate: 3.5 };
const BACK_EXTRA_ROTATE = 3.5;           // second sheet behind the stamp

/* Slightly irregular, hand-cut paper silhouette (reference is not a clean rect) */
const PaperShape = ({ w, h, fill, notch }: { w: number; h: number; fill: string; notch: string }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden
    style={{ position: "absolute", inset: 0, display: "block", overflow: "visible" }}>
    <path
      d={`M 22 10
          C ${w * 0.3} 3, ${w * 0.72} 5, ${w - 16} 14
          C ${w - 8} ${h * 0.3}, ${w - 10} ${h * 0.72}, ${w - 18} ${h - 14}
          C ${w * 0.7} ${h - 4}, ${w * 0.28} ${h - 6}, 16 ${h - 16}
          C 8 ${h * 0.7}, 10 ${h * 0.3}, 22 10 Z`}
      fill={fill} stroke={fill} strokeWidth={10} strokeLinejoin="round"
    />
    {/* binder notches cut into the left edge */}
    {Array.from({ length: Math.floor((h - 90) / 46) }, (_, i) => (
      <circle key={i} cx={13} cy={52 + i * 46} r={7.5} fill={notch} />
    ))}
  </svg>
);

/* coil rings straddling the binder edge */
const BinderCoil = ({ h, color }: { h: number; color: string }) => (
  <svg width={40} height={h} viewBox={`0 0 40 ${h}`} aria-hidden
    style={{ position: "absolute", left: -14, top: 0, display: "block", overflow: "visible" }}>
    {Array.from({ length: Math.floor((h - 90) / 46) }, (_, i) => {
      const y = 52 + i * 46;
      return (
        <path key={i}
          d={`M 8 ${y - 9} Q 30 ${y - 15} 31 ${y - 1} Q 30 ${y + 11} 10 ${y + 8}`}
          fill="none" stroke={color} strokeWidth={4.5} strokeLinecap="round" opacity={0.85} />
      );
    })}
  </svg>
);

const CharImg = ({ url, scale, ox, oy }: {
  url: string; scale: number; ox: number; oy: number;
}) => (
  <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
    <img src={url} alt="character" crossOrigin="anonymous" style={{
      width: "100%", height: "100%", objectFit: "contain", objectPosition: "center",
      transform: `translate(${ox}%, ${oy}%) scale(${scale})`,
      transformOrigin: "center center", display: "block",
    }} />
  </div>
);

const titleFontSize = (t: string) => {
  const n = t.length;
  if (n <= 8) return 78;
  if (n <= 12) return 66;
  if (n <= 16) return 56;
  if (n <= 22) return 46;
  if (n <= 28) return 38;
  return 32;
};

export const ScrapbookLayout = ({
  title, subtitle, days, characterUrl, charFit, charScale, charOffsetX, charOffsetY,
  artBy, socialHandles, ribbonStart, ribbonEnd, themeKey, custom, deco,
}: ScrapbookLayoutProps) => {
  void charFit; // scrapbook selalu "contain" agar karakter tidak ter-crop (sesuai spesifikasi)
  const t = resolveScrapTheme(themeKey, custom);
  const decoColor = deco.decoColor.trim() || t.deco;
  const rows = days.slice(0, 7);
  const handles = socialHandles.filter((h) => h.trim()).slice(0, 4);
  const sidebarHandles = handles.length ? handles : ["@username"];

  const star = (size: number, rotate: number) => <StarSticker size={size} color={decoColor} rotate={rotate} />;
  const heart = (size: number, rotate: number) => <HeartSticker size={size} color={decoColor} rotate={rotate} />;
  const scattered: { x: number; y: number; el: (s: number, r: number) => React.ReactNode }[] =
    deco.set === "stars" ? [
      { x: 1736, y: 44, el: star }, { x: 1116, y: 520, el: star },
      { x: 1788, y: 872, el: star }, { x: 1146, y: 764, el: star },
    ] : deco.set === "hearts" ? [
      { x: 1736, y: 44, el: heart }, { x: 1116, y: 520, el: heart },
      { x: 1788, y: 872, el: heart }, { x: 1146, y: 764, el: heart },
    ] : deco.set === "mixed" ? [
      { x: 1736, y: 44, el: star }, { x: 1116, y: 520, el: heart },
      { x: 1788, y: 872, el: heart }, { x: 1146, y: 764, el: star },
    ] : [];

  return (
    <div data-testid="scrap-root" className="relative h-full w-full overflow-hidden"
      style={{
        background: t.bg,
        fontFamily: "'Quicksand','Nunito','Poppins',sans-serif",
      }}>

      {/* ── left username strip ── */}
      {deco.showSidebar && (
        <div data-testid="scrap-sidebar" className="absolute" style={{ left: 0, top: 0, bottom: 0, width: STRIP_W, zIndex: 3 }}>
          <div className="absolute inset-0" style={{ background: t.strip }} />
          <div className="absolute" style={{ top: 0, bottom: 0, right: -11, width: 22, overflow: "hidden" }}>
            <div style={{
              width: 22, height: "100%",
              backgroundImage: `radial-gradient(circle at 0 14px, ${t.strip} 11px, transparent 12px)`,
              backgroundSize: "22px 30px", backgroundRepeat: "repeat-y",
            }} />
          </div>
          <div className="absolute inset-0 flex flex-col items-center"
            style={{ justifyContent: "space-around", padding: "30px 0" }}>
            {sidebarHandles.map((h, i) => (
              <div key={i} style={{
                background: t.paper, borderRadius: 999, padding: "12px 0",
                width: 44, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                boxShadow: "0 3px 10px rgba(0,0,0,0.18)",
              }}>
                <AnimalFace animal={deco.animal} size={24} body={decoColor} inner={t.paper} ink={t.strip} />
                <span style={{
                  writingMode: "vertical-rl", transform: "rotate(180deg)",
                  fontSize: 14, fontWeight: 700, color: t.strip, letterSpacing: "0.06em",
                  maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── schedule paper ── */}
      <div data-testid="scrap-paper" className="absolute" style={{
        left: PAPER.left, top: PAPER.top, width: PAPER.width, height: PAPER.height,
        transform: `rotate(${PAPER.rotate}deg)`, zIndex: 4,
        filter: "drop-shadow(0 18px 34px rgba(90,40,70,0.20))",
      }}>
        <PaperShape w={PAPER.width} h={PAPER.height} fill={t.paper} notch={t.bg} />
        <BinderCoil h={PAPER.height} color={t.sub} />

        {/* date ribbon hanging over the top-right corner */}
        {deco.showRibbon && (
          <div data-testid="scrap-ribbon" className="absolute" style={{ top: -24, right: 104, zIndex: 6 }}>
            <RibbonBanner width={128} height={208} color={t.ribbon}>
              <span style={{ color: "#fff", fontSize: 27, fontWeight: 800, lineHeight: 1 }}>{ribbonStart}</span>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 800, letterSpacing: "0.2em", margin: "8px 0" }}>••</span>
              <span style={{ color: "#fff", fontSize: 27, fontWeight: 800, lineHeight: 1 }}>{ribbonEnd}</span>
            </RibbonBanner>
          </div>
        )}

        {/* header */}
        <div className="absolute" style={{ left: 96, right: 64, top: HEADER_TOP }}>
          <div style={{
            fontFamily: "'Caveat','Pacifico',cursive", fontSize: 38, fontWeight: 700,
            color: t.accent, lineHeight: 1, transform: "rotate(-2deg)", transformOrigin: "left bottom",
          }}>
            {subtitle.trim() || "weekly"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 0 }}>
            <span style={{
              fontFamily: "'Fredoka One','Quicksand',cursive", fontSize: titleFontSize(title || "schedule"),
              color: t.text, lineHeight: 1.08, letterSpacing: "0.01em",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{title || "schedule"}</span>
            <SparkleGlyph size={30} color={t.sub} />
          </div>
          <div style={{ marginTop: 14, borderBottom: `3px dashed ${t.sub}`, opacity: 0.75 }} />
        </div>

        {/* seven fixed rows */}
        <div data-testid="scrap-rows" className="absolute" style={{
          left: 96, right: 56, top: ROWS_TOP, bottom: ROWS_BOTTOM,
          display: "flex", flexDirection: "column",
        }}>
          {Array.from({ length: 7 }, (_, i) => {
            const d: DayItem | undefined = rows[i];
            const { abbr, num } = parseDay(d?.day ?? "");
            const slot: Slot = d?.slots?.[0] ?? { time: "", title: "", note: "", type: "solo", platforms: [] };
            const off = slot.type === "offline";
            return (
              <div key={i} data-testid={`scrap-row-${i}`} style={{
                flex: "1 1 0", minHeight: 0, display: "flex", alignItems: "center", gap: 20,
              }}>
                {!d ? (
                  <div className="w-full flex items-center justify-center">
                    <span style={{ fontSize: 20, fontWeight: 700, color: t.sub, opacity: 0.6, letterSpacing: "0.1em" }}>—</span>
                  </div>
                ) : off ? (
                  <div className="w-full flex items-center justify-center" style={{ gap: 16 }}>
                    <StarSticker size={24} color={t.accent} rotate={-14} />
                    <span style={{
                      fontSize: 26, fontWeight: 800, color: t.accent,
                      letterSpacing: "0.12em", textTransform: "uppercase",
                    }}>{slot.title || "Day Off — No Stream"}</span>
                    <StarSticker size={24} color={t.accent} rotate={14} />
                  </div>
                ) : (
                  <>
                    <StarBurstBadge size={92} outline={t.accent} fill={t.paper}>
                      <span style={{ fontSize: 26, fontWeight: 800, color: t.text, lineHeight: 1 }}>{num || String(i + 1).padStart(2, "0")}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: t.sub, letterSpacing: "0.08em", marginTop: 3 }}>{abbr}</span>
                    </StarBurstBadge>
                    <div style={{ flex: "0 1 auto", minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                      <span style={{
                        fontSize: 30, fontWeight: 800, color: t.text, textTransform: "uppercase",
                        letterSpacing: "0.03em", lineHeight: 1.1,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>{slot.title || "—"}</span>
                      {slot.note && (
                        <span style={{
                          fontSize: 17, fontWeight: 700, color: t.sub, lineHeight: 1.1,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>{slot.note}</span>
                      )}
                    </div>
                    <div style={{ flex: 1, borderBottom: `3px dotted ${t.sub}`, opacity: 0.7, minWidth: 40, marginBottom: 16 }} />
                    {slot.time && (
                      <div data-testid="scrap-time" style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
                        <ClockDot size={21} color={t.accent} />
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

      {/* ── character scrapbook cluster ── */}
      <div data-testid="scrap-char" className="absolute" style={{
        right: FRAME.right, top: FRAME.top, width: FRAME.width, height: FRAME.height, zIndex: 5,
      }}>
        {/* secondary paper sheet behind, rotated further clockwise */}
        <div className="absolute" style={{
          inset: 0, background: t.layer2, borderRadius: 4,
          transform: `rotate(${FRAME.rotate + BACK_EXTRA_ROTATE}deg) translate(30px, 16px)`,
          boxShadow: "0 14px 40px rgba(90,40,70,0.16)",
        }} />
        {/* the stamp frame itself — rotated like the reference */}
        <div className="absolute inset-0" style={{ transform: `rotate(${FRAME.rotate}deg)` }}>
          <StampFrame width={FRAME.width} height={FRAME.height} frame={t.frame} punch={t.bg}>
              <div className="absolute" style={{
                inset: 26, overflow: "hidden", background: t.cloud,
                backgroundImage: `radial-gradient(${t.deco}55 3px, transparent 4px)`,
                backgroundSize: "34px 34px",
              }}>
                {characterUrl ? (
                  <CharImg url={characterUrl} scale={charScale} ox={charOffsetX} oy={charOffsetY} />
                ) : (
                  /* small, integrated placeholder — bukan kotak kosong besar */
                  <div className="w-full h-full flex flex-col items-center justify-center" style={{ gap: 12 }}>
                    <AnimalFace animal={deco.animal} size={92} body={t.frame} inner={decoColor} ink={t.sub} />
                    <span style={{
                      background: t.paper, color: t.sub, fontSize: 16, fontWeight: 800,
                      padding: "7px 16px", borderRadius: 999, boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
                    }}>upload your character</span>
                  </div>
                )}
              </div>
              {/* vertical art credit on the right border */}
              <div className="absolute" style={{
                right: 3, top: "50%", transform: "translateY(-50%) rotate(90deg)",
                transformOrigin: "center", whiteSpace: "nowrap",
                fontSize: 19, fontWeight: 700, color: t.text, opacity: 0.6, fontFamily: "'Caveat','Pacifico',cursive",
              }}>
                art by: {(artBy || "@artistname").replace(/^art\s*by\s*/i, "")}
              </div>
            </StampFrame>
        </div>
        {/* peeking animal + star sticker on the top-left corner */}
        <div className="absolute pointer-events-none" style={{ top: -44, left: 44, zIndex: 7 }}>
          <AnimalFace animal={deco.animal} size={84} body={t.frame} inner={decoColor} ink={t.text} />
        </div>
        <div className="absolute pointer-events-none" style={{ top: -34, left: 102, zIndex: 8 }}>
          <StarSticker size={140} color={decoColor} rotate={-14} />
        </div>
        <div className="absolute pointer-events-none" style={{ bottom: -18, right: -16, zIndex: 7 }}>
          <HeartSticker size={54} color={decoColor} rotate={12} />
        </div>
      </div>

      {/* ── scattered stickers (fixed positions) ── */}
      {deco.showStickers && scattered.length > 0 && (
        <div data-testid="scrap-stickers" className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          {scattered.map((s, i) => (
            <div key={i} className="absolute" style={{ left: s.x, top: s.y }}>
              {s.el(i % 2 === 0 ? 56 : 38, (i * 37) % 40 - 20)}
            </div>
          ))}
        </div>
      )}

      {/* ── clouds IN FRONT of paper & frame, along the bottom (like the reference) ── */}
      {deco.showClouds && (
        <div data-testid="scrap-clouds" className="absolute inset-0 pointer-events-none" style={{ zIndex: 6 }}>
          <div className="absolute" style={{ left: -90, bottom: -80 }}>
            <CloudPuff width={560} height={200} color={t.cloud} />
          </div>
          <div className="absolute" style={{ right: -110, bottom: -120 }}>
            <CloudPuff width={980} height={330} color={t.cloud} flip />
          </div>
          <div className="absolute" style={{ right: 250, bottom: -150 }}>
            <CloudPuff width={640} height={240} color={t.cloud} />
          </div>
        </div>
      )}
    </div>
  );
};
