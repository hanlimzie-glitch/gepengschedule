/* ============================================================
   SCRAPBOOK TEMPLATE — decorative SVG parts (Layer A assets)
   Pure inline SVG so PNG export (html-to-image) always works.
   Positions are decided by ScrapbookLayout; these parts only
   know their own size/color.
   ============================================================ */
import type { ScrapAnimal } from "./types";

/** 12-point starburst outline used as the day badge on the paper. */
export const StarBurstBadge = ({ size, outline, fill, children }: {
  size: number; outline: string; fill: string; children?: React.ReactNode;
}) => {
  const points = 12;
  const outer = 50, inner = 42;
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    pts.push(`${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`);
  }
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
        <polygon points={pts.join(" ")} fill={fill} stroke={outline} strokeWidth={2.5} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
        {children}
      </div>
    </div>
  );
};

/** Chunky rounded star sticker (like the reference's pink stars). */
export const StarSticker = ({ size, color, rotate = 0, opacity = 1 }: {
  size: number; color: string; rotate?: number; opacity?: number;
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden
    style={{ display: "block", transform: `rotate(${rotate}deg)`, opacity }}>
    <path
      d="M50 4 C56 26 60 32 78 38 C62 50 60 56 60 78 C50 66 44 66 32 74 C36 56 34 50 22 40 C40 36 44 28 50 4 Z"
      fill={color} stroke={color} strokeWidth={6} strokeLinejoin="round"
    />
  </svg>
);

export const HeartSticker = ({ size, color, rotate = 0, opacity = 1 }: {
  size: number; color: string; rotate?: number; opacity?: number;
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden
    style={{ display: "block", transform: `rotate(${rotate}deg)`, opacity }}>
    <path d="M12 21s-7.5-4.7-9.9-9.3C.4 7.8 3 4 6.6 4c2.1 0 3.7 1.2 5.4 3.4C13.7 5.2 15.3 4 17.4 4 21 4 23.6 7.8 21.9 11.7 19.5 16.3 12 21 12 21z" fill={color} />
  </svg>
);

/** Tiny 4-point sparkle (the ✧ after "schedule"). */
export const SparkleGlyph = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "block" }}>
    <path d="M12 1 L14.5 9.5 L23 12 L14.5 14.5 L12 23 L9.5 14.5 L1 12 L9.5 9.5 Z"
      fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
  </svg>
);

/** Simple kawaii animal face used on stickers / sidebar pills / header. */
export const AnimalFace = ({ animal, size, body, inner, ink }: {
  animal: ScrapAnimal; size: number; body: string; inner: string; ink: string;
}) => {
  const ears: Record<ScrapAnimal, React.ReactNode> = {
    cat: (
      <>
        <path d="M18 26 L24 8 L36 20 Z" fill={body} stroke={ink} strokeWidth={2} strokeLinejoin="round" />
        <path d="M82 26 L76 8 L64 20 Z" fill={body} stroke={ink} strokeWidth={2} strokeLinejoin="round" />
        <path d="M24 22 L27 13 L33 19 Z" fill={inner} />
        <path d="M76 22 L73 13 L67 19 Z" fill={inner} />
      </>
    ),
    bunny: (
      <>
        <ellipse cx="34" cy="16" rx="9" ry="16" fill={body} stroke={ink} strokeWidth={2} transform="rotate(-12 34 16)" />
        <ellipse cx="66" cy="16" rx="9" ry="16" fill={body} stroke={ink} strokeWidth={2} transform="rotate(12 66 16)" />
        <ellipse cx="34" cy="17" rx="4" ry="10" fill={inner} transform="rotate(-12 34 17)" />
        <ellipse cx="66" cy="17" rx="4" ry="10" fill={inner} transform="rotate(12 66 17)" />
      </>
    ),
    fox: (
      <>
        <path d="M16 30 L20 6 L40 18 Z" fill={body} stroke={ink} strokeWidth={2} strokeLinejoin="round" />
        <path d="M84 30 L80 6 L60 18 Z" fill={body} stroke={ink} strokeWidth={2} strokeLinejoin="round" />
        <path d="M23 24 L25 13 L33 18 Z" fill={inner} />
        <path d="M77 24 L75 13 L67 18 Z" fill={inner} />
      </>
    ),
    bear: (
      <>
        <circle cx="26" cy="20" r="11" fill={body} stroke={ink} strokeWidth={2} />
        <circle cx="74" cy="20" r="11" fill={body} stroke={ink} strokeWidth={2} />
        <circle cx="26" cy="20" r="5" fill={inner} />
        <circle cx="74" cy="20" r="5" fill={inner} />
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden style={{ display: "block" }}>
      {ears[animal]}
      <circle cx="50" cy="56" r="34" fill={body} stroke={ink} strokeWidth={2} />
      <circle cx="38" cy="52" r="3.4" fill={ink} />
      <circle cx="62" cy="52" r="3.4" fill={ink} />
      <ellipse cx="50" cy="62" rx="7" ry="5" fill={inner} />
      <circle cx="50" cy="60" r="2.2" fill={ink} />
      <path d="M44 70 Q50 74 56 70" fill="none" stroke={ink} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
};

/** Fluffy cloud puff (row of overlapping ellipses). */
export const CloudPuff = ({ width, height, color, flip = false }: {
  width: number; height: number; color: string; flip?: boolean;
}) => (
  <svg width={width} height={height} viewBox="0 0 400 160" aria-hidden
    preserveAspectRatio="none"
    style={{ display: "block", transform: flip ? "scaleX(-1)" : undefined }}>
    <g fill={color}>
      <ellipse cx="40" cy="150" rx="90" ry="60" />
      <ellipse cx="140" cy="130" rx="100" ry="70" />
      <ellipse cx="250" cy="145" rx="110" ry="65" />
      <ellipse cx="360" cy="135" rx="95" ry="70" />
      <ellipse cx="200" cy="160" rx="220" ry="60" />
    </g>
  </svg>
);

/** Postage-stamp style frame: white rect with punched perforation holes. */
export const StampFrame = ({ width, height, frame, punch, children, borderColor }: {
  width: number; height: number; frame: string; punch: string; borderColor?: string;
  children?: React.ReactNode;
}) => {
  const r = 9;         // hole radius
  const gap = 34;      // hole spacing
  const holes: { x: number; y: number }[] = [];
  for (let x = gap / 2; x < width; x += gap) { holes.push({ x, y: 0 }, { x, y: height }); }
  for (let y = gap / 2; y < height; y += gap) { holes.push({ x: 0, y }, { x: width, y }); }
  return (
    <div style={{ position: "relative", width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", inset: 0, display: "block" }}>
        <rect x={0} y={0} width={width} height={height} fill={frame}
          stroke={borderColor ?? "none"} strokeWidth={borderColor ? 2 : 0} />
        {holes.map((h, i) => (
          <circle key={i} cx={h.x} cy={h.y} r={r} fill={punch} />
        ))}
      </svg>
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
    </div>
  );
};

/** Spiral notebook binding — column of ring loops. */
export const SpiralBinding = ({ height, color }: { height: number; color: string }) => {
  const rings = Math.max(4, Math.floor(height / 44));
  return (
    <svg width={34} height={height} viewBox={`0 0 34 ${height}`} aria-hidden
      style={{ display: "block" }}>
      {Array.from({ length: rings }, (_, i) => {
        const y = 22 + (i * (height - 44)) / (rings - 1);
        return (
          <g key={i}>
            <circle cx={26} cy={y} r={5} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
            <path d={`M 6 ${y - 8} Q 26 ${y - 14} 27 ${y} Q 26 ${y + 10} 8 ${y + 7}`}
              fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
};

/** Hanging ribbon banner with a notched bottom (date ribbon). */
export const RibbonBanner = ({ width, height, color, children }: {
  width: number; height: number; color: string; children?: React.ReactNode;
}) => (
  <div style={{ position: "relative", width, height }}>
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden
      style={{ position: "absolute", inset: 0, display: "block" }}>
      <path
        d={`M0 0 H${width} V${height - 22} L${width / 2} ${height} L0 ${height - 22} Z`}
        fill={color}
      />
      <path d={`M0 0 H${width} V10 H0 Z`} fill="rgba(255,255,255,0.22)" />
    </svg>
    <div style={{ position: "absolute", inset: 0, paddingBottom: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
      {children}
    </div>
  </div>
);

/** Clock dot — the small round stream indicator before the time. */
export const ClockDot = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "block", flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" fill={color} />
    <path d="M12 6.5 V12 L15.5 14" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
  </svg>
);
