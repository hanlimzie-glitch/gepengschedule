import { useRef, useState, useCallback, useEffect } from "react";
import { toPng } from "html-to-image";
import { Upload, Download, Sparkles, ImageIcon, UserRound, UsersRound, CloudOff, Plus, Minus, Calendar as CalendarIcon, Twitch, Youtube, Music2 } from "lucide-react";
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
import { ScheduleCanvas, type DayItem, type Slot, type ThemeKey, type OrnamentKey, type LayoutKey, type PlatformKey } from "./ScheduleCanvas";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DAYS_ID = ["Senin 5", "Selasa 6", "Rabu 7", "Kamis 8", "Jumat 9", "Sabtu 10", "Minggu 11"];

const makeSlot = (over: Partial<Slot> = {}): Slot => ({
  time: "19:00 WIB", title: "Just Chatting", note: "", type: "solo", platforms: [], ...over,
});

const initialDays: DayItem[] = DAYS_ID.map((d) => ({ day: d, slots: [makeSlot()] }));

const themes: { key: ThemeKey; label: string; swatch: string; defaultOrnament: OrnamentKey }[] = [
  { key: "cute", label: "Cute", swatch: "linear-gradient(135deg,hsl(330 100% 78%),hsl(25 100% 82%))", defaultOrnament: "hearts" },
  { key: "aesthetic", label: "Aesthetic", swatch: "linear-gradient(135deg,hsl(280 90% 75%),hsl(200 95% 75%))", defaultOrnament: "stars" },
  { key: "gothic", label: "Gothic", swatch: "linear-gradient(135deg,hsl(0 0% 4%),hsl(0 80% 55%))", defaultOrnament: "crosses" },
  { key: "sakura", label: "Sakura", swatch: "linear-gradient(135deg,hsl(340 90% 70%),hsl(350 100% 88%))", defaultOrnament: "sakura" },
  { key: "cyber", label: "Cyber", swatch: "linear-gradient(135deg,hsl(180 100% 55%),hsl(320 100% 60%))", defaultOrnament: "circuit" },
  { key: "mint", label: "Mint", swatch: "linear-gradient(135deg,hsl(160 70% 55%),hsl(190 80% 70%))", defaultOrnament: "dots" },
  { key: "royalred", label: "Royal Red", swatch: "linear-gradient(90deg,#6b1622 50%,#e6c168 50%)", defaultOrnament: "none" },
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

const formatRange = (from?: Date, to?: Date) => {
  if (!from) return "";
  if (!to || from.getTime() === to.getTime()) return format(from, "d MMMM yyyy", { locale: idLocale });
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();
  return sameMonth
    ? `${format(from, "d", { locale: idLocale })} - ${format(to, "d MMMM yyyy", { locale: idLocale })}`
    : `${format(from, "d MMM", { locale: idLocale })} - ${format(to, "d MMM yyyy", { locale: idLocale })}`;
};

const ornamentOptions: { key: OrnamentKey; label: string }[] = [
  { key: "dots", label: "Dots" }, { key: "grid", label: "Grid" }, { key: "diagonal", label: "Diagonal" },
  { key: "stars", label: "Stars" }, { key: "hearts", label: "Hearts" }, { key: "sakura", label: "Sakura" },
  { key: "crosses", label: "Crosses" }, { key: "circuit", label: "Circuit" }, { key: "none", label: "None" },
];

export const ScheduleEditor = () => {
  const [title, setTitle] = useState("Huan Weekly Schedule");
  const [subtitle, setSubtitle] = useState("powered by Huan");
  const [dateRange, setDateRange] = useState("5 - 11 Mei 2026");
  const [dateRangeObj, setDateRangeObj] = useState<DateRange | undefined>({
    from: new Date(2026, 4, 5),
    to: new Date(2026, 4, 11),
  });
  const [artBy, setArtBy] = useState("Art by @yourname");
  const [youtubeHandle, setYoutubeHandle] = useState("@your youtube channel");
  const [twitchHandle, setTwitchHandle] = useState("@your twitch channel");
  const [days, setDays] = useState<DayItem[]>(initialDays);
  const [characterUrl, setCharacterUrl] = useState<string | null>(null);
  const [charFit, setCharFit] = useState<"cover" | "contain">("cover");
  const [theme, setTheme] = useState<ThemeKey>("cute");
  const [ornament, setOrnament] = useState<OrnamentKey>("hearts");
  const [layout, setLayout] = useState<LayoutKey>("bubbles");
  const [ratio, setRatio] = useState<"16:9" | "4:3">("16:9");
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [scale, setScale] = useState(0.4);

  const canvasRef = useRef<HTMLDivElement>(null);
  const previewWrapRef = useRef<HTMLDivElement>(null);

  const pickTheme = (k: ThemeKey) => {
    if (layout === "royal" && k !== "royalred") {
      toast.info("Layout Royal hanya mendukung tema Royal Red");
      return;
    }
    setTheme(k);
    const t = themes.find((x) => x.key === k);
    if (t) setOrnament(t.defaultOrnament);
    if (k === "cute" || k === "sakura") setLayout("bubbles");
    if (k === "royalred") setLayout("royal");
  };

  const handleDateRange = (r: DateRange | undefined) => {
    setDateRangeObj(r);
    if (r?.from) setDateRange(formatRange(r.from, r.to));
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

  useEffect(() => {
    const wrap = previewWrapRef.current;
    if (!wrap) return;
    let raf = 0;
    const update = () => { raf = 0; setScale(Math.min(1, wrap.clientWidth / 1920)); };
    const ro = new ResizeObserver(() => { if (raf) return; raf = requestAnimationFrame(update); });
    ro.observe(wrap); update();
    return () => { ro.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const downloadPng = async () => {
    if (!canvasRef.current) return;
    setBusy(true);
    try {
      const node = canvasRef.current;
      const w = 1920; const h = ratio === "16:9" ? 1080 : 1440;
      const dataUrl = await toPng(node, {
        width: w, height: h, pixelRatio: 2, cacheBust: true,
        style: { transform: "none", margin: "0", inset: "auto" },
      });
      const a = document.createElement("a");
      a.href = dataUrl; a.download = `${title.replace(/\s+/g, "_")}_${ratio.replace(":", "x")}.png`;
      a.click();
      toast.success("Schedule berhasil di-download! ✨");
    } catch (err) { console.error(err); toast.error("Gagal export. Coba lagi."); }
    finally { setBusy(false); }
  };

  const canvasH = ratio === "16:9" ? 1080 : 1440;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="max-w-[1800px] mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--gradient-accent)" }}>
            <Sparkles className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black gradient-text leading-tight">VTuber Schedule Maker</h1>
            <p className="text-sm text-muted-foreground">Buat jadwal mingguan keren — export PNG kualitas tinggi</p>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        <aside className="space-y-5 animate-fade-in">
          <Section title="Judul">
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
              <Field label="Art credit (di bawah karakter)"><Input value={artBy} onChange={(e) => setArtBy(e.target.value)} placeholder="Art by @yourname" /></Field>
              <Field label="YouTube handle (Royal layout)"><Input value={youtubeHandle} onChange={(e) => setYoutubeHandle(e.target.value)} placeholder="@your youtube channel" /></Field>
              <Field label="Twitch handle (Royal layout)"><Input value={twitchHandle} onChange={(e) => setTwitchHandle(e.target.value)} placeholder="@your twitch channel" /></Field>
            </div>
          </Section>

          <Section title="Tema">
            <div className="grid grid-cols-2 gap-3">
              {themes.map((t) => {
                const locked = layout === "royal" && t.key !== "royalred";
                return (
                  <button type="button" key={t.key} onClick={() => pickTheme(t.key)} disabled={locked}
                    title={locked ? "Layout Royal hanya mendukung Royal Red" : undefined}
                    className={cn("rounded-xl p-3 border-2 text-left transition-all hover:scale-[1.02]",
                      theme === t.key ? "border-primary shadow-[0_0_20px_hsl(var(--primary)/0.5)]" : "border-border",
                      locked && "opacity-40 cursor-not-allowed hover:scale-100")}
                    style={{ background: "hsl(var(--card))" }}>
                    <div className="h-10 rounded-lg mb-2" style={{ background: t.swatch }} />
                    <div className="text-sm font-semibold">{t.label}</div>
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Layout">
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: "bubbles", label: "Bubbles", desc: "Polaroid + chat" },
                { key: "grid", label: "Grid", desc: "2-col cards" },
                { key: "royal", label: "Royal", desc: "Red/gold banner" },
              ] as { key: LayoutKey; label: string; desc: string }[]).map((l) => (
                <button key={l.key} type="button" onClick={() => {
                  setLayout(l.key);
                  if (l.key === "royal") { setTheme("royalred"); setOrnament("none"); }
                }}
                  className={cn("rounded-xl p-3 border-2 text-left transition-all hover:scale-[1.02]",
                    layout === l.key ? "border-primary shadow-[0_0_20px_hsl(var(--primary)/0.5)]" : "border-border")}>
                  <div className="text-sm font-bold">{l.label}</div>
                  <div className="text-[11px] text-muted-foreground">{l.desc}</div>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Ornament">
            <div className="grid grid-cols-3 gap-2">
              {ornamentOptions.map((o) => (
                <button type="button" key={o.key} onClick={() => setOrnament(o.key)}
                  className={cn("rounded-lg p-2 border-2 text-xs font-semibold transition-all hover:scale-[1.02]",
                    ornament === o.key ? "border-primary" : "border-border")}>
                  <div className={`h-10 rounded mb-1 theme-${theme} ornament-${o.key}`} style={{ backgroundColor: "hsl(var(--t-card))" }} />
                  {o.label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Karakter VTuber">
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
              <Button variant="outline" size="sm" onClick={() => setCharacterUrl(null)} disabled={!characterUrl}>Hapus</Button>
            </div>
          </Section>

          <Section title="Jadwal Mingguan">
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
          </Section>

          <Section title="Export">
            <Field label="Rasio">
              <Select value={ratio} onValueChange={(v) => setRatio(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 (1920×1080)</SelectItem>
                  <SelectItem value="4:3">4:3 (1920×1440)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <p className="text-xs text-muted-foreground mt-2">Output di-render @2x untuk hasil ultra HD.</p>
          </Section>
        </aside>

        <main className="animate-fade-in">
          <div className="glass rounded-2xl p-4 sticky top-4">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-sm text-muted-foreground">Preview ({ratio})</span>
              <span className="text-xs text-muted-foreground">Output: {ratio === "16:9" ? "3840×2160" : "3840×2880"} (HD)</span>
            </div>
            <div ref={previewWrapRef} className="w-full overflow-hidden rounded-xl border border-border bg-black/30"
              style={{ height: canvasH * scale }}>
              <div style={{ width: 1920, height: canvasH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
                <ScheduleCanvas ref={canvasRef} title={title} subtitle={subtitle} dateRange={dateRange}
                  days={days} characterUrl={characterUrl} charFit={charFit} theme={theme} ratio={ratio}
                  ornament={ornament} layout={layout} artBy={artBy}
                  youtubeHandle={youtubeHandle} twitchHandle={twitchHandle} />
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

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="glass rounded-2xl p-5">
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
