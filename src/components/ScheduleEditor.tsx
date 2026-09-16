import { useRef, useState, useCallback, useEffect } from "react";
import appLogo from "@/assets/logo.svg";
import { toPng } from "html-to-image";
import { Upload, Download, ImageIcon, UserRound, UsersRound, CloudOff, Plus, Minus, Calendar as CalendarIcon, CalendarClock, RotateCcw, Twitch, Youtube, Music2, Instagram, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { ScheduleCanvas, type DayItem, type Slot, type ThemeKey, type OrnamentIconKey, type OrnamentLayer, type LayoutKey, type PlatformKey, type SocialKey, type TextureSettings } from "./ScheduleCanvas";
import { loadState, saveState, clearState, type SaveResult } from "@/lib/persistence";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DEFAULT_SCRAP_DECO, DEFAULT_SCRAP_THEME, SCRAP_ANIMALS, SCRAP_ANIMAL_LABELS,
  SCRAP_COLOR_FIELDS, SCRAP_DECO_SETS, SCRAP_DECO_SET_LABELS, SCRAP_THEME_KEYS,
  SCRAP_THEME_LABELS, SCRAP_THEME_PRESETS, resolveScrapTheme,
  type ScrapDecoConfig, type ScrapThemeColors, type ScrapThemeKey,
} from "@/template/scrapbook/types";

const DAY_NAMES_ID = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const buildDayLabels = (from?: Date): string[] => {
  if (!from) return DAY_NAMES_ID.map((n) => n);
  // Find Monday of the week containing `from`
  const start = new Date(from);
  const dow = start.getDay(); // 0=Sun..6=Sat
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  start.setDate(start.getDate() + diffToMonday);
  return DAY_NAMES_ID.map((n, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return `${n} ${d.getDate()}`;
  });
};

const makeSlot = (over: Partial<Slot> = {}): Slot => ({
  time: "19:00 WIB", title: "Just Chatting", note: "", type: "solo", platforms: [], ...over,
});

const getCurrentWeekMonday = (): Date => {
  const d = new Date();
  const dow = d.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};
const CURRENT_MONDAY = getCurrentWeekMonday();
const CURRENT_SUNDAY = new Date(CURRENT_MONDAY);
CURRENT_SUNDAY.setDate(CURRENT_MONDAY.getDate() + 6);
const initialDays: DayItem[] = buildDayLabels(CURRENT_MONDAY).map((d) => ({ day: d, slots: [makeSlot()] }));

const makeLayer = (over: Partial<OrnamentLayer> = {}): OrnamentLayer => ({
  icon: "star", count: 40, size: 32, spacing: 160,
  offsetX: 0, offsetY: 0, rotation: 0, opacity: 0.35, color: "", ...over,
});

const themes: { key: ThemeKey; label: string; swatch: string; defaultLayers: OrnamentLayer[] }[] = [
  { key: "cute",      label: "Cute",      swatch: "linear-gradient(135deg,hsl(330 100% 78%),hsl(25 100% 82%))", defaultLayers: [makeLayer({ icon: "heart", count: 50, size: 36 })] },
  { key: "aesthetic", label: "Aesthetic", swatch: "linear-gradient(135deg,hsl(280 90% 75%),hsl(200 95% 75%))",  defaultLayers: [makeLayer({ icon: "sparkle", count: 45 })] },
  { key: "gothic",    label: "Gothic",    swatch: "linear-gradient(135deg,hsl(0 0% 4%),hsl(0 80% 55%))",       defaultLayers: [makeLayer({ icon: "moon", count: 35 })] }, // cross dihapus -> moon (elegan)
  { key: "sakura",    label: "Sakura",    swatch: "linear-gradient(135deg,hsl(340 90% 70%),hsl(350 100% 88%))", defaultLayers: [makeLayer({ icon: "sakura", count: 40, size: 42 })] },
  { key: "cyber",     label: "Cyber",     swatch: "linear-gradient(135deg,hsl(180 100% 55%),hsl(320 100% 60%))", defaultLayers: [makeLayer({ icon: "star", count: 40 })] }, // circuit dihapus -> star
  { key: "mint",      label: "Mint",      swatch: "linear-gradient(135deg,hsl(160 70% 55%),hsl(190 80% 70%))",  defaultLayers: [makeLayer({ icon: "dot", count: 80, size: 14, spacing: 120 })] },
  { key: "royalred",  label: "Royal Red", swatch: "linear-gradient(90deg,#6b1622 50%,#e6c168 50%)",             defaultLayers: [] },
  { key: "magic",     label: "Magic",     swatch: "linear-gradient(135deg,hsl(270 60% 55%),hsl(35 80% 70%))",   defaultLayers: [makeLayer({ icon: "star", count: 45 }), makeLayer({ icon: "moon", count: 12, size: 44, opacity: 0.4 })] },
  { key: "mono",      label: "Mono",      swatch: "linear-gradient(90deg,#0a0a0a 50%,#f5f5f5 50%)",             defaultLayers: [makeLayer({ icon: "dot", count: 100, size: 10, color: "#000" })] },
];

const scheduleTypes: { key: Slot["type"]; label: string; icon: JSX.Element }[] = [
  { key: "solo", label: "Solo", icon: <UserRound className="w-4 h-4" /> },
  { key: "collab", label: "Collab", icon: <UsersRound className="w-4 h-4" /> },
  { key: "offline", label: "Offline", icon: <CloudOff className="w-4 h-4" /> },
];

const platformOptions: { key: PlatformKey; label: string; icon: JSX.Element }[] = [
  { key: "twitch", label: "Twitch", icon: <Twitch className="w-3.5 h-3.5" /> },
  { key: "youtube", label: "YouTube", icon: <Youtube className="w-3.5 h-3.5" /> },
  { key: "tiktok", label: "TikTok", icon: <Music2 className="w-3.5 h-3.5" /> },
];

// Input media sosial di footer poster — masing-masing bisa di-cek/uncek (optional)
const SOCIAL_FIELDS: { key: SocialKey; label: string; placeholder: string; Icon: LucideIcon }[] = [
  { key: "youtube", label: "YouTube", placeholder: "@your youtube channel", Icon: Youtube },
  { key: "twitch", label: "Twitch", placeholder: "@your twitch channel", Icon: Twitch },
  { key: "instagram", label: "Instagram", placeholder: "@your instagram", Icon: Instagram },
  { key: "x", label: "X (Twitter)", placeholder: "@your_x_handle", Icon: X },
  { key: "tiktok", label: "TikTok", placeholder: "@your tiktok", Icon: Music2 },
];

// Navigasi cepat antar-section — tampil di toolbar sticky di bawah header
const NAV_ITEMS = [
  { id: "sec-judul", label: "Judul" },
  { id: "sec-layout", label: "Layout" },
  { id: "sec-color", label: "Color" },
  { id: "sec-ornament", label: "Ornament" },
  { id: "sec-karakter", label: "Karakter" },
  { id: "sec-jadwal", label: "Jadwal" },
  { id: "sec-texture", label: "Texture" },
] as const;

const scrollToSection = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

const formatRange = (from?: Date, to?: Date) => {
  if (!from) return "";
  if (!to || from.getTime() === to.getTime()) return format(from, "d MMMM yyyy", { locale: idLocale });
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();
  return sameMonth
    ? `${format(from, "d", { locale: idLocale })} - ${format(to, "d MMMM yyyy", { locale: idLocale })}`
    : `${format(from, "d MMM", { locale: idLocale })} - ${format(to, "d MMM yyyy", { locale: idLocale })}`;
};

const ornamentIconOptions: { key: OrnamentIconKey; label: string; glyph: string }[] = [
  { key: "dot", label: "Dot", glyph: "●" },
  { key: "star", label: "Star", glyph: "✦" },
  { key: "sparkle", label: "Sparkle", glyph: "✧" },
  { key: "heart", label: "Heart", glyph: "♥" },
  { key: "sakura", label: "Sakura", glyph: "❀" },
  { key: "moon", label: "Moon", glyph: "☾" },
  { key: "paw", label: "Paw", glyph: "🐾" },
  { key: "feather", label: "Feather", glyph: "🪶" }, // dari Celestial
  { key: "fish", label: "Fish", glyph: "🐟" }, // dari Cat
];

export const ScheduleEditor = () => {
  const [persisted] = useState(() => loadState());
  const [title, setTitle] = useState(persisted?.title ?? "Huan Weekly Schedule");
  const [subtitle, setSubtitle] = useState(persisted?.subtitle ?? "powered by Huan");
  const [dateRange, setDateRange] = useState(persisted?.dateRange ?? formatRange(CURRENT_MONDAY, CURRENT_SUNDAY));
  const [dateRangeObj, setDateRangeObj] = useState<DateRange | undefined>(() => {
    if (persisted?.dateFrom) {
      const from = new Date(persisted.dateFrom);
      const to = persisted.dateTo ? new Date(persisted.dateTo) : undefined;
      if (!isNaN(from.getTime())) return { from, to: to && !isNaN(to.getTime()) ? to : undefined };
    }
    return { from: CURRENT_MONDAY, to: CURRENT_SUNDAY };
  });
  const [artBy, setArtBy] = useState(persisted?.artBy ?? "Art by @yourname");
  // Sosial media — handle + saklar tampil per platform (centang = tampil di poster)
  const [socials, setSocials] = useState<Record<SocialKey, string>>(
    persisted?.socials ?? {
      youtube: "@your youtube channel",
      twitch: "@your twitch channel",
      instagram: "@your instagram",
      x: "@your_x_handle",
      tiktok: "@your tiktok",
    }
  );
  const [socialEnabled, setSocialEnabled] = useState<Record<SocialKey, boolean>>(
    persisted?.socialEnabled ?? { youtube: true, twitch: true, instagram: false, x: false, tiktok: false }
  );
  const setSocialHandle = (key: SocialKey, val: string) => setSocials((s) => ({ ...s, [key]: val }));
  const setSocialOn = (key: SocialKey, on: boolean) => setSocialEnabled((s) => ({ ...s, [key]: on }));
  const [days, setDays] = useState<DayItem[]>(persisted?.days?.length ? persisted.days : initialDays);
  const [characterUrl, setCharacterUrl] = useState<string | null>(persisted?.characterUrl ?? null);
  const [charFit, setCharFit] = useState<"cover" | "contain">(persisted?.charFit ?? "cover");
  const [charScale, setCharScale] = useState(persisted?.charScale ?? 1);
  const [charOffsetX, setCharOffsetX] = useState(persisted?.charOffsetX ?? 0);
  const [charOffsetY, setCharOffsetY] = useState(persisted?.charOffsetY ?? 0);
  const [theme, setTheme] = useState<ThemeKey>(persisted?.theme ?? "cute");
  const [ornaments, setOrnaments] = useState<OrnamentLayer[]>(
    persisted?.ornaments?.length ? persisted.ornaments : [makeLayer({ icon: "heart", count: 50, size: 36 })]
  );
  const updateLayer = (i: number, patch: Partial<OrnamentLayer>) =>
    setOrnaments((prev) => prev.map((l, idx) => idx === i ? { ...l, ...patch } : l));
  const addLayer = () => setOrnaments((prev) => prev.length >= 3 ? prev : [...prev, makeLayer()]);
  const removeLayer = (i: number) => setOrnaments((prev) => prev.filter((_, idx) => idx !== i));
  const [layout, setLayout] = useState<LayoutKey>(persisted?.layout ?? "scrapbook");
  /* ── scrapbook template (Layer C): theme + controlled decorations ── */
  const [scrapTheme, setScrapTheme] = useState<ScrapThemeKey>(persisted?.scrapTheme ?? DEFAULT_SCRAP_THEME);
  const [scrapCustom, setScrapCustom] = useState<Partial<ScrapThemeColors>>(persisted?.scrapCustom ?? {});
  const [scrapDeco, setScrapDeco] = useState<ScrapDecoConfig>(persisted?.scrapDeco ?? DEFAULT_SCRAP_DECO);
  const [scrapRibbon, setScrapRibbon] = useState<string>(
    persisted?.scrapRibbonStart && persisted?.scrapRibbonEnd
      ? `${persisted.scrapRibbonStart} - ${persisted.scrapRibbonEnd}`
      : ""
  );
  const updateScrapDeco = (patch: Partial<ScrapDecoConfig>) => setScrapDeco((d) => ({ ...d, ...patch }));
  const setScrapColor = (key: keyof ScrapThemeColors, value: string) => {
    setScrapCustom((c) => ({ ...c, [key]: value }));
    setScrapTheme("custom");
  };
  const pickScrapTheme = (k: ScrapThemeKey) => {
    if (k === "custom") setScrapCustom((c) => ({ ...resolveScrapTheme(scrapTheme, c) }));
    setScrapTheme(k);
  };
  const ratio = "16:9" as const; // 4:3 dihapus — hanya 16:9 (persisted lama otomatis jadi 16:9)
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [scale, setScale] = useState(0.4);
  const [texture, setTexture] = useState<TextureSettings>(persisted?.texture ?? {
    url: null, blend: "overlay", opacity: 0.5, size: 100, repeat: true, scope: "all",
    offsetX: 0, offsetY: 0, rotation: 0,
  });
  const [textureEdit, setTextureEdit] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ status: SaveResult | "idle"; at: number | null }>({ status: "idle", at: null });
  const updateTexture = <K extends keyof TextureSettings>(k: K, v: TextureSettings[K]) =>
    setTexture((t) => ({ ...t, [k]: v }));
  const handleTextureFile = (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("File harus berupa gambar"); return; }
    const r = new FileReader();
    r.onload = (e) => updateTexture("url", e.target?.result as string);
    r.readAsDataURL(file);
  };

  // Ribbon tanggal scrapbook: override manual ("01/01 - 07/01") atau otomatis dari date picker
  const autoRibbon = (() => {
    const f = dateRangeObj?.from;
    const t2 = dateRangeObj?.to ?? dateRangeObj?.from;
    if (!f || !t2) return { start: "01/01", end: "07/01" };
    return { start: format(f, "dd/MM"), end: format(t2, "dd/MM") };
  })();
  const ribbonOverride = (() => {
    const m = scrapRibbon.trim().match(/^([^\-–•]+)[-–•]+(.+)$/);
    return m ? { start: m[1].trim(), end: m[2].trim() } : null;
  })();
  const ribbonStart = ribbonOverride?.start ?? autoRibbon.start;
  const ribbonEnd = ribbonOverride?.end ?? autoRibbon.end;

  const canvasRef = useRef<HTMLDivElement>(null);
  const previewWrapRef = useRef<HTMLDivElement>(null);

  const pickTheme = (k: ThemeKey) => {
    setTheme(k);
    // FIX #4: ganti Color tidak lagi ikut ganti Layout ornaments.
    // Sebelumnya: pilih tema magic otomatis ganti layout ke celestial & reset ornaments ke default tema — bikin "ganti warna ikut ganti layout".
    // Sekarang: theme, layout, dan ornaments independen — user atur manual masing-masing.
  };

  const pickLayout = (k: LayoutKey) => {
    // Normalisasi alias legacy animal -> cat
    const normalized = (k === "animal" ? "cat" : k) as LayoutKey;
    setLayout(normalized);
    // FIX #3: jangan reset ornaments saat ganti layout (termasuk cat).
    // Sebelumnya pickLayout("animal") selalu reset ke 1 layer paw, jadi user yang sudah tambah 2-3 layer merasa "tidak bisa tambah layer" karena ke-reset.
  };

  const handleDateRange = (r: DateRange | undefined) => {
    setDateRangeObj(r);
    if (r?.from) {
      setDateRange(formatRange(r.from, r.to));
      const labels = buildDayLabels(r.from);
      setDays((prev) => prev.map((d, i) => ({ ...d, day: labels[i] ?? d.day })));
    }
  };

  const togglePlatform = (di: number, si: number, p: PlatformKey) => {
    setDays((prev) => prev.map((d, i) =>
      i !== di ? d : {
        ...d,
        slots: d.slots.map((s, j) => j !== si ? s : {
          ...s,
          platforms: s.platforms.includes(p) ? s.platforms.filter((x) => x !== p) : [...s.platforms, p],
        }),
      }
    ));
  };

  const updateSlot = <K extends keyof Slot>(di: number, si: number, key: K, val: Slot[K]) => {
    setDays((prev) => prev.map((d, i) =>
      i !== di ? d : { ...d, slots: d.slots.map((s, j) => j === si ? { ...s, [key]: val } : s) }
    ));
  };
  const addSlot = (di: number) => setDays((p) => p.map((d, i) =>
    i !== di ? d : { ...d, slots: [...d.slots, makeSlot({ time: "21:00 WIB", title: "Stream 2" })] }
  ));
  const removeSlot = (di: number) => setDays((p) => p.map((d, i) =>
    i !== di ? d : { ...d, slots: d.slots.slice(0, 1) }
  ));

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("File harus berupa gambar"); return; }
    const reader = new FileReader();
    reader.onload = (e) => setCharacterUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0]; if (f) handleFile(f);
  };

  // ── Auto-save ke localStorage (debounce 400ms) ─────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      const res = saveState({
        v: 1,
        savedAt: Date.now(),
        title, subtitle, dateRange,
        dateFrom: dateRangeObj?.from ? dateRangeObj.from.toISOString() : null,
        dateTo: dateRangeObj?.to ? dateRangeObj.to.toISOString() : null,
        artBy,
        youtubeHandle: socials.youtube,
        twitchHandle: socials.twitch,
        socials, socialEnabled,
        days, characterUrl, charFit, charScale, charOffsetX, charOffsetY,
        theme, ornaments, layout, ratio, texture,
        scrapTheme, scrapCustom, scrapDeco, scrapRibbonStart: ribbonStart, scrapRibbonEnd: ribbonEnd,
      });
      setSaveStatus({ status: res, at: Date.now() });
    }, 400);
    return () => clearTimeout(t);
  }, [title, subtitle, dateRange, dateRangeObj, artBy, socials, socialEnabled, days,
      characterUrl, charFit, charScale, charOffsetX, charOffsetY, theme, ornaments, layout, ratio, texture,
      scrapTheme, scrapCustom, scrapDeco, ribbonStart, ribbonEnd]);

  // Peringatan hanya saat status BERUBAH (tidak spam toast)
  const lastToastStatus = useRef<string>("idle");
  useEffect(() => {
    if (saveStatus.status === "stripped" && lastToastStatus.current !== "stripped")
      toast.warning("Gambar terlalu besar — tersimpan tanpa gambar karakter/texture.");
    if (saveStatus.status === "error" && lastToastStatus.current !== "error")
      toast.error("Auto-save gagal (localStorage penuh?)");
    lastToastStatus.current = saveStatus.status;
  }, [saveStatus]);

  // Duplikat isi jadwal ke minggu berikutnya (konten sama, tanggal & label bergeser)
  const shiftToNextWeek = () => {
    const base = dateRangeObj?.from ?? CURRENT_MONDAY;
    const from = new Date(base); from.setDate(from.getDate() + 7);
    const to = new Date(from); to.setDate(from.getDate() + 6);
    handleDateRange({ from, to });
    toast.success("Jadwal digeser ke minggu depan — isi stream tetap sama 📅");
  };

  const resetAll = () => {
    if (!window.confirm("Kembali ke default? Semua perubahan & data tersimpan akan hilang.")) return;
    clearState();
    setLayout("scrapbook");
    setScrapTheme(DEFAULT_SCRAP_THEME);
    setScrapCustom({});
    setScrapDeco(DEFAULT_SCRAP_DECO);
    setScrapRibbon("");
    setTitle("Huan Weekly Schedule"); setSubtitle("powered by Huan");
    setDateRange(formatRange(CURRENT_MONDAY, CURRENT_SUNDAY));
    setDateRangeObj({ from: CURRENT_MONDAY, to: CURRENT_SUNDAY });
    setArtBy("Art by @yourname");
    setSocials({
      youtube: "@your youtube channel", twitch: "@your twitch channel",
      instagram: "@your instagram", x: "@your_x_handle", tiktok: "@your tiktok",
    });
    setSocialEnabled({ youtube: true, twitch: true, instagram: false, x: false, tiktok: false });
    setDays(buildDayLabels(CURRENT_MONDAY).map((d) => ({ day: d, slots: [makeSlot()] })));
    setCharacterUrl(null); setCharFit("cover"); setCharScale(1); setCharOffsetX(0); setCharOffsetY(0);
    setTheme("cute"); setOrnaments([makeLayer({ icon: "heart", count: 50, size: 36 })]);
    setLayout("cat");
    setTexture({ url: null, blend: "overlay", opacity: 0.5, size: 100, repeat: true, scope: "all", offsetX: 0, offsetY: 0, rotation: 0 });
    setTextureEdit(false);
    toast.success("Kembali ke default ✨");
  };

  useEffect(() => {
    const wrap = previewWrapRef.current;
    if (!wrap) return;
    let raf = 0;
    const canvasH = 1080;
    const update = () => {
      raf = 0;
      const sx = wrap.clientWidth / 1920;
      const sy = (window.innerHeight - 200) / canvasH;
      setScale(Math.max(0.1, Math.min(1, sx, sy)));
    };
    const ro = new ResizeObserver(() => { if (raf) return; raf = requestAnimationFrame(update); });
    ro.observe(wrap);
    window.addEventListener("resize", update);
    update();
    return () => { ro.disconnect(); window.removeEventListener("resize", update); if (raf) cancelAnimationFrame(raf); };
  }, []); // ratio fixed 16:9 — tidak perlu depend

  // ── Zoom via wheel ─────────────────────────────────────────────────
  // React 17+ memasang handler onWheel sebagai passive listener →
  // e.preventDefault() diabaikan & halaman ikut scroll. Solusinya:
  // pasang listener native dengan { passive: false } + gate ref untuk kondisi terkini.
  const wheelGateRef = useRef({ texEditing: false, charReady: false });
  wheelGateRef.current = {
    texEditing: Boolean(textureEdit && texture.url),
    charReady: Boolean(characterUrl),
  };
  useEffect(() => {
    const el = previewWrapRef.current;
    if (!el) return;
    const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
    const onWheelNative = (e: WheelEvent) => {
      const gate = wheelGateRef.current;
      if (gate.texEditing) {
        e.preventDefault();
        setTexture((t) => ({ ...t, rotation: clamp(t.rotation + (e.deltaY < 0 ? 2 : -2), -180, 180) }));
      } else if (gate.charReady) {
        e.preventDefault();
        setCharScale((s) => clamp(s + (e.deltaY < 0 ? 0.05 : -0.05), 0.3, 3));
      }
    };
    el.addEventListener("wheel", onWheelNative, { passive: false });
    return () => el.removeEventListener("wheel", onWheelNative);
  }, []);

  const downloadPng = async () => {
    if (!canvasRef.current) return;
    setBusy(true);
    try {
      const node = canvasRef.current;
      const w = 1920; const h = 1080; // hanya 16:9
      const dataUrl = await toPng(node, {
        width: w, height: h, pixelRatio: 2, cacheBust: true,
        style: { transform: "none", margin: "0", inset: "auto" },
      });
      const a = document.createElement("a");
      a.href = dataUrl; a.download = `${(title || "schedule").replace(/\s+/g, "_")}_16x9.png`;
      a.click();
      toast.success("Schedule berhasil di-download! ✨");
    } catch (err) { console.error(err); toast.error("Gagal export. Coba lagi."); }
    finally { setBusy(false); }
  };

  const canvasH = 1080 as const; // hanya 16:9

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="max-w-[1800px] mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <img src={appLogo} alt="VTuber Schedule Maker logo" className="w-12 h-12 shadow-md" />
          <div>
            <h1 className="text-3xl md:text-4xl font-black gradient-text leading-tight">VTuber Schedule Maker</h1>
            <p className="text-sm text-muted-foreground">Bikin jadwal streaming mingguanmu jadi rapi & estetik — tinggal atur, langsung export jadi gambar siap posting ✨</p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground md:text-right" aria-live="polite">
          {saveStatus.status === "saved" && saveStatus.at && (
            <span>💾 Tersimpan otomatis • {new Date(saveStatus.at).toLocaleTimeString("id-ID")}</span>
          )}
          {saveStatus.status === "stripped" && (
            <span className="text-amber-400">⚠️ Tersimpan tanpa gambar (file terlalu besar)</span>
          )}
          {saveStatus.status === "error" && <span className="text-red-400">⚠️ Auto-save gagal</span>}
          {saveStatus.status === "idle" && <span>💾 Auto-save aktif</span>}
        </div>
      </header>

      {/* Toolbar navigasi section — sticky; tidak perlu scroll bolak-balik */}
      <nav aria-label="Navigasi section" className="sticky top-2 z-40 max-w-[1800px] mx-auto mb-6">
        <div className="glass rounded-2xl px-2 py-1.5 flex items-center gap-1 overflow-x-auto">
          {(layout === "scrapbook" ? [
            { id: "sec-judul", label: "Judul" },
            { id: "sec-layout", label: "Layout" },
            { id: "sec-scrapcolor", label: "Color" },
            { id: "sec-scrapdeco", label: "Dekorasi" },
            { id: "sec-karakter", label: "Karakter" },
            { id: "sec-jadwal", label: "Jadwal" },
          ] : NAV_ITEMS).map((it) => (
            <button key={it.id} type="button" onClick={() => scrollToSection(it.id)}
              className="px-3 h-8 rounded-lg text-xs font-semibold whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
              {it.label}
            </button>
          ))}
          <div className="ml-auto pl-2 shrink-0">
            <Button size="sm" onClick={downloadPng} disabled={busy}
              className="h-8 rounded-lg text-xs font-bold gap-1.5"
              style={{ background: "var(--gradient-accent)", color: "hsl(var(--primary-foreground))" }}>
              <Download className="w-3.5 h-3.5" />{busy ? "Rendering..." : "Export"}
            </Button>
          </div>
        </div>
      </nav>

      {/* Breakpoint UX:
          <md (HP)      : 1 kolom — preview di atas & sticky mengikuti scroll
          md–lg (Tablet): 1 kolom — preview di atas, TIDAK sticky (tidak menutupi layar)
          >=lg (Desktop): 2 kolom — form kiri, preview kanan sticky di kolomnya */}
      <div className="max-w-[1800px] mx-auto flex flex-col gap-6 lg:grid lg:grid-cols-[380px_1fr]">
        <aside className="space-y-5 animate-fade-in order-2 lg:order-none lg:col-start-1 lg:row-start-1">
          <Section title="Judul" id="sec-judul">
            <div className="space-y-3">
              <Field label="Judul utama"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
              <Field label="Subtitle (opsional)"><Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} /></Field>
              <Field label="Tanggal / Periode">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateRangeObj?.from && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRangeObj?.from ? formatRange(dateRangeObj.from, dateRangeObj.to) : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="range" selected={dateRangeObj} onSelect={handleDateRange} numberOfMonths={2} initialFocus className={cn("p-3 pointer-events-auto")} locale={idLocale} />
                  </PopoverContent>
                </Popover>
              </Field>
              {layout === "scrapbook" && (
                <Field label="Date ribbon (kosong = otomatis dari tanggal)">
                  <Input value={scrapRibbon} onChange={(e) => setScrapRibbon(e.target.value)}
                    placeholder={`${autoRibbon.start} - ${autoRibbon.end}`} className="h-8" />
                </Field>
              )}
              <Field label="Art credit (di bawah karakter)"><Input value={artBy} onChange={(e) => setArtBy(e.target.value)} placeholder="Art by @yourname" /></Field>
              <Field label="Media sosial — centang yang ingin ditampilkan">
                <div className="space-y-1.5 pt-0.5">
                  {SOCIAL_FIELDS.map(({ key, label, placeholder, Icon }) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        id={`social-${key}`}
                        checked={socialEnabled[key]}
                        onCheckedChange={(v) => setSocialOn(key, v === true)}
                        aria-label={`Tampilkan ${label}`}
                      />
                      <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                      <Input
                        value={socials[key]}
                        onChange={(e) => setSocialHandle(key, e.target.value)}
                        placeholder={placeholder}
                        disabled={!socialEnabled[key]}
                        className="h-8 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </Field>
            </div>
          </Section>

          <Section title="Layout" id="sec-layout">
            <div className="grid grid-cols-2 gap-2">
              {([
                { key: "scrapbook", label: "Scrapbook" },
                { key: "bubbles", label: "Bubbles" },
                { key: "grid", label: "Grid" },
                { key: "royal", label: "Royal" },
                { key: "celestial", label: "Celestial" },
                { key: "cat", label: "Cat" },
              ] as { key: LayoutKey; label: string }[]).map((l) => (
                <button key={l.key} type="button" onClick={() => pickLayout(l.key)}
                  className={cn("rounded-xl p-3 border-2 text-center transition-all hover:scale-[1.02] relative",
                    layout === l.key ? "border-primary shadow-[0_0_20px_hsl(var(--primary)/0.5)]" : "border-border")}>
                  <div className="text-sm font-bold flex items-center justify-center gap-1">{l.label}{l.key === "scrapbook" && <span className="text-[8px] bg-pink-400 text-white px-1 py-0.5 rounded-full leading-none">REF</span>}{l.key === "cat" && <span className="text-[8px] bg-pink-400 text-white px-1 py-0.5 rounded-full leading-none">NEW</span>}</div>
                </button>
              ))}
            </div>
          </Section>

          {layout !== "scrapbook" && (<>
          <Section title="Color" id="sec-color">
            <div className="grid grid-cols-2 gap-3">
              {themes.map((t) => (
                <button type="button" key={t.key} onClick={() => pickTheme(t.key)}
                  className={cn("rounded-xl p-3 border-2 text-left transition-all hover:scale-[1.02]",
                    theme === t.key ? "border-primary shadow-[0_0_20px_hsl(var(--primary)/0.5)]" : "border-border")}
                  style={{ background: "hsl(var(--card))" }}>
                  <div className="h-10 rounded-lg mb-2" style={{ background: t.swatch }} />
                  <div className="text-sm font-semibold">{t.label}</div>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Ornament Layers" id="sec-ornament">
            <p className="text-[11px] text-muted-foreground mb-3">
              Max 3 layer. Setiap layer bisa custom icon, jumlah (1-200), jarak, ukuran, posisi, rotasi, & opacity.
            </p>
            <div className="space-y-3">
              {ornaments.map((ly, i) => (
                <div key={i} className={`rounded-xl p-3 border-2 space-y-2 ${theme ? `theme-${theme}` : ""}`} style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card) / 0.6)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Layer {i + 1}</span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => removeLayer(i)}>
                      <Minus className="w-3 h-3 mr-1" />Hapus
                    </Button>
                  </div>

                  <div className="grid grid-cols-6 gap-1.5">
                    {ornamentIconOptions.map((o) => (
                      <button key={o.key} type="button" onClick={() => updateLayer(i, { icon: o.key })}
                        title={o.label}
                        className={cn("h-10 rounded border-2 flex items-center justify-center text-lg leading-none",
                          ly.icon === o.key ? "border-primary text-primary" : "border-border text-foreground/70 hover:border-primary/50")}>
                        {o.glyph}
                      </button>
                    ))}
                  </div>

                  <LayerSlider label="Jumlah" value={ly.count} min={1} max={200} step={1}
                    onChange={(v) => updateLayer(i, { count: v })} />
                  <LayerSlider label="Jarak (spacing)" value={ly.spacing} min={40} max={500} step={5} unit="px"
                    onChange={(v) => updateLayer(i, { spacing: v })} />
                  <LayerSlider label="Ukuran" value={ly.size} min={8} max={240} step={2} unit="px"
                    onChange={(v) => updateLayer(i, { size: v })} />
                  <LayerSlider label="Posisi X" value={ly.offsetX} min={-400} max={400} step={2} unit="px"
                    onChange={(v) => updateLayer(i, { offsetX: v })} />
                  <LayerSlider label="Posisi Y" value={ly.offsetY} min={-400} max={400} step={2} unit="px"
                    onChange={(v) => updateLayer(i, { offsetY: v })} />
                  <LayerSlider label="Rotasi" value={ly.rotation} min={-180} max={180} step={1} unit="°"
                    onChange={(v) => updateLayer(i, { rotation: v })} />
                  <LayerSlider label="Opacity" value={Math.round(ly.opacity * 100)} min={0} max={100} step={1} unit="%"
                    onChange={(v) => updateLayer(i, { opacity: v / 100 })} />

                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground w-16">Warna</Label>
                    <input type="color" value={ly.color || "#ffffff"}
                      onChange={(e) => updateLayer(i, { color: e.target.value })}
                      className="h-8 w-12 rounded border border-border cursor-pointer bg-transparent" />
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => updateLayer(i, { color: "" })}>
                      Auto (tema)
                    </Button>
                  </div>
                </div>
              ))}
              {ornaments.length < 3 && (
                <Button variant="outline" size="sm" className="w-full" onClick={addLayer}>
                  <Plus className="w-4 h-4 mr-1" />Tambah Layer ({ornaments.length}/3)
                </Button>
              )}
              {ornaments.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">Belum ada ornament.</p>
              )}
            </div>
          </Section>
          </>)}

          {layout === "scrapbook" && (<>
          <Section title="Scrapbook Color" id="sec-scrapcolor">
            <p className="text-[11px] text-muted-foreground mb-3">
              Ganti warna tidak mengubah komposisi template — hanya properti visual.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {SCRAP_THEME_KEYS.map((k) => {
                const pal = k === "custom" ? resolveScrapTheme("custom", scrapCustom) : SCRAP_THEME_PRESETS[k];
                return (
                  <button type="button" key={k} onClick={() => pickScrapTheme(k)}
                    className={cn("rounded-xl p-3 border-2 text-left transition-all hover:scale-[1.02]",
                      scrapTheme === k ? "border-primary shadow-[0_0_20px_hsl(var(--primary)/0.5)]" : "border-border")}
                    style={{ background: "hsl(var(--card))" }}>
                    <div className="h-10 rounded-lg mb-2" style={{ background: `linear-gradient(135deg, ${pal.bg} 45%, ${pal.accent} 45%)` }} />
                    <div className="text-sm font-semibold">{SCRAP_THEME_LABELS[k]}</div>
                  </button>
                );
              })}
            </div>
            {scrapTheme === "custom" && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {SCRAP_COLOR_FIELDS.map((f) => (
                  <div key={f.key} className="flex items-center gap-2">
                    <input type="color" value={resolveScrapTheme("custom", scrapCustom)[f.key]}
                      onChange={(e) => setScrapColor(f.key, e.target.value)}
                      className="h-8 w-10 rounded border border-border cursor-pointer bg-transparent" />
                    <span className="text-xs text-muted-foreground">{f.label}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Scrapbook Decoration" id="sec-scrapdeco">
            <div className="space-y-4">
              <Field label="Animal theme">
                <div className="grid grid-cols-4 gap-2">
                  {SCRAP_ANIMALS.map((a) => (
                    <button key={a} type="button" onClick={() => updateScrapDeco({ animal: a })}
                      className={cn("rounded-lg border-2 p-2 text-xs font-bold transition-colors",
                        scrapDeco.animal === a ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/50")}>
                      {SCRAP_ANIMAL_LABELS[a]}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Decoration set">
                <div className="grid grid-cols-4 gap-2">
                  {SCRAP_DECO_SETS.map((s) => (
                    <button key={s} type="button" onClick={() => updateScrapDeco({ set: s })}
                      className={cn("rounded-lg border-2 p-2 text-xs font-bold transition-colors",
                        scrapDeco.set === s ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/50")}>
                      {SCRAP_DECO_SET_LABELS[s]}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="space-y-1.5">
                {([
                  ["showClouds", "Awan (clouds)"],
                  ["showStickers", "Stiker tersebar"],
                  ["showSidebar", "Strip username kiri"],
                  ["showRibbon", "Pita tanggal"],
                ] as [keyof ScrapDecoConfig, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox checked={Boolean(scrapDeco[key])} onCheckedChange={(v) => updateScrapDeco({ [key]: v === true })} />
                    {label}
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground w-24">Warna dekorasi</Label>
                <input type="color" value={scrapDeco.decoColor || resolveScrapTheme(scrapTheme, scrapCustom).deco}
                  onChange={(e) => updateScrapDeco({ decoColor: e.target.value })}
                  className="h-8 w-12 rounded border border-border cursor-pointer bg-transparent" />
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => updateScrapDeco({ decoColor: "" })}>
                  Auto (tema)
                </Button>
              </div>
            </div>
          </Section>
          </>)}


          <Section title="Karakter VTuber" id="sec-karakter">
            <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)} onDrop={onDrop}
              className={cn("border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer",
                dragOver ? "border-primary bg-primary/10" : "border-border hover:border-primary/60")}
              onClick={() => document.getElementById("char-upload")?.click()}>
              {characterUrl ? (
                <img src={characterUrl} alt="preview" className="mx-auto max-h-40 rounded-lg object-contain" />
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drag & drop atau klik untuk upload PNG/JPG</p>
                </>
              )}
              <input id="char-upload" type="file" accept="image/*" hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => setCharFit(charFit === "cover" ? "contain" : "cover")}>
                <ImageIcon className="w-4 h-4 mr-1" />Fit: {charFit === "cover" ? "Cover" : "Contain"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setCharacterUrl(null); setCharScale(1); setCharOffsetX(0); setCharOffsetY(0); }} disabled={!characterUrl}>Hapus</Button>
            </div>
            {characterUrl && (
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Zoom</span><span>{charScale.toFixed(2)}x</span>
                  </div>
                  <input type="range" min="0.3" max="3" step="0.05" value={charScale}
                    onChange={(e) => setCharScale(parseFloat(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Geser ↔</span><span>{charOffsetX}%</span>
                  </div>
                  <input type="range" min="-100" max="100" step="1" value={charOffsetX}
                    onChange={(e) => setCharOffsetX(parseInt(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Geser ↕</span><span>{charOffsetY}%</span>
                  </div>
                  <input type="range" min="-100" max="100" step="1" value={charOffsetY}
                    onChange={(e) => setCharOffsetY(parseInt(e.target.value))} className="w-full accent-primary" />
                </div>
                <Button variant="ghost" size="sm" className="w-full h-7 text-xs"
                  onClick={() => { setCharScale(1); setCharOffsetX(0); setCharOffsetY(0); }}>
                  Reset posisi
                </Button>
                <p className="text-[11px] text-muted-foreground">Tip: drag langsung pada preview untuk geser, scroll pada gambar untuk zoom.</p>
              </div>
            )}
          </Section>

          <Section title="Jadwal Mingguan" id="sec-jadwal">
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {days.map((d, i) => (
                <div key={i} className="rounded-xl p-3 border border-border bg-card/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">{d.day}</span>
                    {d.slots.length === 1 ? (
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addSlot(i)}>
                        <Plus className="w-3 h-3 mr-1" />Jadwal kedua
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => removeSlot(i)}>
                        <Minus className="w-3 h-3 mr-1" />Hapus #2
                      </Button>
                    )}
                  </div>
                  {d.slots.map((s, si) => (
                    <div key={si} className="space-y-2 rounded-lg p-2 border border-border/60 bg-background/30">
                      {d.slots.length > 1 && (
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Slot {si + 1}</div>
                      )}
                      <Select value={s.type} onValueChange={(v) => updateSlot(i, si, "type", v as Slot["type"])}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {scheduleTypes.map((type) => (
                            <SelectItem key={type.key} value={type.key}>
                              <span className="inline-flex items-center gap-2">{type.icon}{type.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-3 px-1 py-1">
                        {platformOptions.map((p) => {
                          const checked = s.platforms.includes(p.key);
                          return (
                            <label key={p.key} className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                              <Checkbox checked={checked} onCheckedChange={() => togglePlatform(i, si, p.key)} />
                              <span className="inline-flex items-center gap-1">{p.icon}{p.label}</span>
                            </label>
                          );
                        })}
                      </div>
                      <Input value={s.time} onChange={(e) => updateSlot(i, si, "time", e.target.value)} placeholder="19:00 WIB" className="h-8" />
                      <Input value={s.title} onChange={(e) => updateSlot(i, si, "title", e.target.value)} placeholder="Aktivitas" className="h-8" />
                      <Textarea value={s.note} onChange={(e) => updateSlot(i, si, "note", e.target.value)} placeholder="Catatan (opsional)" rows={1} className="min-h-[32px]" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={shiftToNextWeek}
                title="Duplikat isi jadwal ke minggu depan (konten sama, tanggal & label hari bergeser)">
                <CalendarClock className="w-4 h-4 mr-1" />Minggu depan
              </Button>
              <Button variant="outline" size="sm" onClick={resetAll}
                title="Hapus semua perubahan & data tersimpan di browser">
                <RotateCcw className="w-4 h-4 mr-1" />Reset
              </Button>
            </div>
          </Section>

          {layout !== "scrapbook" && (
          <Section title="Texture Overlay" id="sec-texture">
            <div
              className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-primary/60 transition-colors"
              onClick={() => document.getElementById("tex-upload")?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleTextureFile(f); }}
            >
              {texture.url ? (
                <img src={texture.url} alt="tex" className="mx-auto max-h-24 rounded object-contain" />
              ) : (
                <>
                  <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Upload texture (grunge, paper, noise, glitter, dll)</p>
                </>
              )}
              <input id="tex-upload" type="file" accept="image/*" hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleTextureFile(f); }} />
            </div>
            {texture.url && (
              <div className="mt-3 space-y-3">
                <Field label="Blend mode">
                  <Select value={texture.blend} onValueChange={(v) => updateTexture("blend", v)}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["normal","multiply","screen","overlay","soft-light","hard-light","color-dodge","color-burn","darken","lighten","difference","exclusion","hue","saturation","color","luminosity"].map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Opacity</span><span>{Math.round(texture.opacity * 100)}%</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" value={texture.opacity}
                    onChange={(e) => updateTexture("opacity", parseFloat(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Size</span><span>{texture.size}%</span>
                  </div>
                  <input type="range" min="20" max="400" step="5" value={texture.size}
                    onChange={(e) => updateTexture("size", parseInt(e.target.value))} className="w-full accent-primary"
                    disabled={!texture.repeat} />
                </div>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox checked={texture.repeat} onCheckedChange={(v) => updateTexture("repeat", !!v)} />
                  Repeat / tile (off = cover full canvas)
                </label>

                <div className="pt-2 border-t border-border/50 space-y-3">
                  <label className="flex items-center gap-2 text-xs cursor-pointer font-semibold text-primary">
                    <Checkbox checked={textureEdit} onCheckedChange={(v) => setTextureEdit(!!v)} />
                    Edit posisi texture (drag di preview)
                  </label>
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Posisi X</span><span>{texture.offsetX}%</span>
                    </div>
                    <input type="range" min="-100" max="100" step="1" value={texture.offsetX}
                      onChange={(e) => updateTexture("offsetX", parseInt(e.target.value))} className="w-full accent-primary" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Posisi Y</span><span>{texture.offsetY}%</span>
                    </div>
                    <input type="range" min="-100" max="100" step="1" value={texture.offsetY}
                      onChange={(e) => updateTexture("offsetY", parseInt(e.target.value))} className="w-full accent-primary" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Rotasi</span><span>{texture.rotation}°</span>
                    </div>
                    <input type="range" min="-180" max="180" step="1" value={texture.rotation}
                      onChange={(e) => updateTexture("rotation", parseInt(e.target.value))} className="w-full accent-primary" />
                  </div>
                  <Button variant="outline" size="sm" className="w-full h-7 text-xs"
                    onClick={() => setTexture((t) => ({ ...t, offsetX: 0, offsetY: 0, rotation: 0 }))}>
                    Reset posisi & rotasi
                  </Button>
                </div>

                <Button variant="ghost" size="sm" className="w-full h-7 text-xs"
                  onClick={() => { setTextureEdit(false); setTexture({ url: null, blend: "overlay", opacity: 0.5, size: 100, repeat: true, scope: "all", offsetX: 0, offsetY: 0, rotation: 0 }); }}>
                  Hapus texture
                </Button>
              </div>
            )}
          </Section>
          )}



        </aside>

        {/* Sticky hanya di HP (<md): <main> sebagai flex item bisa bergerak mengikuti
            container tinggi. Di tablet static (supaya tidak menutupi layar).
            Di desktop (lg+): grid item kanan, sticky-nya ada di div batin. */}
        <main className="animate-fade-in order-1 lg:order-none lg:col-start-2 lg:row-start-1 sticky top-[76px] z-30 w-full md:static">
          <div className="glass rounded-2xl p-4 lg:sticky lg:top-4">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-sm text-muted-foreground">Preview (16:9)</span>
              <span className="text-xs text-muted-foreground">Output: 3840×2160 (HD)</span>
            </div>
            <div ref={previewWrapRef} className="w-full overflow-hidden rounded-xl border border-border bg-black/30 relative"
              style={{ height: canvasH * scale, cursor: (textureEdit && texture.url) || characterUrl ? "grab" : "default" }}
              onPointerDown={(e) => {
                const editingTex = textureEdit && texture.url;
                if (!editingTex && !characterUrl) return;
                const startX = e.clientX, startY = e.clientY;
                const ox0 = editingTex ? texture.offsetX : charOffsetX;
                const oy0 = editingTex ? texture.offsetY : charOffsetY;
                (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                (e.currentTarget as HTMLDivElement).style.cursor = "grabbing";
                const move = (ev: PointerEvent) => {
                  const dx = (ev.clientX - startX) / scale;
                  const dy = (ev.clientY - startY) / scale;
                  const nx = Math.max(-100, Math.min(100, Math.round(ox0 + (dx / 1920) * 200)));
                  const ny = Math.max(-100, Math.min(100, Math.round(oy0 + (dy / canvasH) * 200)));
                  if (editingTex) {
                    setTexture((t) => ({ ...t, offsetX: nx, offsetY: ny }));
                  } else {
                    setCharOffsetX(Math.max(-100, Math.min(100, Math.round(ox0 + (dx / 1920) * 100))));
                    setCharOffsetY(Math.max(-100, Math.min(100, Math.round(oy0 + (dy / canvasH) * 100))));
                  }
                };
                const up = () => {
                  window.removeEventListener("pointermove", move);
                  window.removeEventListener("pointerup", up);
                };
                window.addEventListener("pointermove", move);
                window.addEventListener("pointerup", up);
              }}>
              {textureEdit && texture.url && (
                <div className="absolute top-2 left-2 z-20 pointer-events-none px-2 py-1 rounded bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                  Texture edit • drag = pindah • scroll = rotasi
                </div>
              )}
              <div style={{ width: 1920, height: canvasH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
                <ScheduleCanvas ref={canvasRef} title={title} subtitle={subtitle} dateRange={dateRange}
                  days={days} characterUrl={characterUrl} charFit={charFit} theme={theme} ratio={ratio}
                  ornaments={ornaments} layout={layout} artBy={artBy}
                  youtubeHandle={socialEnabled.youtube ? socials.youtube : ""}
                  twitchHandle={socialEnabled.twitch ? socials.twitch : ""}
                  instagramHandle={socialEnabled.instagram ? socials.instagram : ""}
                  xHandle={socialEnabled.x ? socials.x : ""}
                  tiktokHandle={socialEnabled.tiktok ? socials.tiktok : ""}
                  charScale={charScale} charOffsetX={charOffsetX} charOffsetY={charOffsetY}
                  texture={texture}
                  scrapTheme={scrapTheme} scrapCustom={scrapCustom} scrapDeco={scrapDeco}
                  scrapRibbonStart={ribbonStart} scrapRibbonEnd={ribbonEnd} />
              </div>
            </div>
            <Button size="lg" onClick={downloadPng} disabled={busy}
              className="mt-4 h-12 w-full rounded-xl text-base font-black tracking-wide shadow-[0_0_30px_hsl(var(--primary)/0.35)]"
              style={{ background: "var(--gradient-accent)", color: "hsl(var(--primary-foreground))" }}>
              <Download className="w-5 h-5" />{busy ? "Rendering..." : "Download Schedule"}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

const Section = ({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) => (
  <div id={id} className="glass rounded-2xl p-5 scroll-mt-[380px] md:scroll-mt-24">
    <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-primary">{title}</h2>
    {children}
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    {children}
  </div>
);

const LayerSlider = ({ label, value, min, max, step = 1, unit = "", onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void;
}) => (
  <div>
    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
      <span>{label}</span><span>{value}{unit}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-primary" />
  </div>
);
