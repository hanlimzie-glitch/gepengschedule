import { useRef, useState, useCallback, useEffect } from "react";
import { toPng } from "html-to-image";
import { Upload, Download, Sparkles, ImageIcon, UserRound, UsersRound, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ScheduleCanvas, type DayItem, type ThemeKey, type OrnamentKey } from "./ScheduleCanvas";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DAYS_ID = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const initialDays: DayItem[] = DAYS_ID.map((d) => ({
  day: d, time: "19:00 WIB", title: "Just Chatting", note: "", type: "solo",
}));

const themes: { key: ThemeKey; label: string; swatch: string; defaultOrnament: OrnamentKey }[] = [
  { key: "cute", label: "Cute", swatch: "linear-gradient(135deg,hsl(330 100% 78%),hsl(25 100% 82%))", defaultOrnament: "hearts" },
  { key: "aesthetic", label: "Aesthetic", swatch: "linear-gradient(135deg,hsl(280 90% 75%),hsl(200 95% 75%))", defaultOrnament: "stars" },
  { key: "gothic", label: "Gothic", swatch: "linear-gradient(135deg,hsl(0 0% 4%),hsl(0 80% 55%))", defaultOrnament: "crosses" },
  { key: "sakura", label: "Sakura", swatch: "linear-gradient(135deg,hsl(340 90% 70%),hsl(350 100% 88%))", defaultOrnament: "sakura" },
  { key: "cyber", label: "Cyber", swatch: "linear-gradient(135deg,hsl(180 100% 55%),hsl(320 100% 60%))", defaultOrnament: "circuit" },
  { key: "mint", label: "Mint", swatch: "linear-gradient(135deg,hsl(160 70% 55%),hsl(190 80% 70%))", defaultOrnament: "dots" },
];

const scheduleTypes: { key: DayItem["type"]; label: string; icon: JSX.Element }[] = [
  { key: "solo", label: "Solo", icon: <UserRound className="w-4 h-4" /> },
  { key: "collab", label: "Collab", icon: <UsersRound className="w-4 h-4" /> },
  { key: "offline", label: "Offline", icon: <CloudOff className="w-4 h-4" /> },
];

const ornamentOptions: { key: OrnamentKey; label: string }[] = [
  { key: "dots", label: "Dots" },
  { key: "grid", label: "Grid" },
  { key: "diagonal", label: "Diagonal" },
  { key: "stars", label: "Stars" },
  { key: "hearts", label: "Hearts" },
  { key: "sakura", label: "Sakura" },
  { key: "crosses", label: "Crosses" },
  { key: "circuit", label: "Circuit" },
  { key: "none", label: "None" },
];

export const ScheduleEditor = () => {
  const [title, setTitle] = useState("Huan Weekly Schedule");
  const [subtitle, setSubtitle] = useState("Powered by Lovable ♡");
  const [dateRange, setDateRange] = useState("5 - 11 Mei 2026");
  const [artBy, setArtBy] = useState("Art by @yourname");
  const [days, setDays] = useState<DayItem[]>(initialDays);
  const [characterUrl, setCharacterUrl] = useState<string | null>(null);
  const [charFit, setCharFit] = useState<"cover" | "contain">("cover");
  const [theme, setTheme] = useState<ThemeKey>("cute");
  const [ornament, setOrnament] = useState<OrnamentKey>("hearts");
  const [ratio, setRatio] = useState<"16:9" | "4:3">("16:9");
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [scale, setScale] = useState(0.4);

  const canvasRef = useRef<HTMLDivElement>(null);
  const previewWrapRef = useRef<HTMLDivElement>(null);

  // Sync ornament when theme changes
  const pickTheme = (k: ThemeKey) => {
    setTheme(k);
    const t = themes.find((x) => x.key === k);
    if (t) setOrnament(t.defaultOrnament);
  };

  const updateDay = <K extends keyof DayItem>(i: number, key: K, val: DayItem[K]) => {
    setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, [key]: val } : d)));
  };

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setCharacterUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  // Responsive preview scaling (rAF debounced to avoid ResizeObserver loop)
  useEffect(() => {
    const wrap = previewWrapRef.current;
    if (!wrap) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const s = Math.min(1, wrap.clientWidth / 1920);
      setScale(s);
    };
    const ro = new ResizeObserver(() => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    });
    ro.observe(wrap);
    update();
    return () => { ro.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const downloadPng = async () => {
    if (!canvasRef.current) return;
    setBusy(true);
    try {
      const node = canvasRef.current;
      const w = 1920;
      const h = ratio === "16:9" ? 1080 : 1440;
      const dataUrl = await toPng(node, {
        width: w,
        height: h,
        pixelRatio: 2,
        cacheBust: true,
        style: {
          transform: "none",
          margin: "0",
          inset: "auto",
        },
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${title.replace(/\s+/g, "_")}_${ratio.replace(":", "x")}.png`;
      a.click();
      toast.success("Schedule berhasil di-download! ✨");
    } catch (err) {
      console.error(err);
      toast.error("Gagal export. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  const canvasH = ratio === "16:9" ? 1080 : 1440;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="max-w-[1800px] mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
               style={{ background: "var(--gradient-accent)" }}>
            <Sparkles className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black gradient-text leading-tight">
              VTuber Schedule Maker
            </h1>
            <p className="text-sm text-muted-foreground">
              Buat jadwal mingguan keren — export PNG kualitas tinggi
            </p>
          </div>
        </div>
        <div className="hidden md:block text-sm text-muted-foreground">Preview di kanan, download di bawah preview</div>
      </header>

      <div className="max-w-[1800px] mx-auto grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        <aside className="space-y-5 animate-fade-in">
          <Section title="Judul">
            <div className="space-y-3">
              <Field label="Judul utama">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="Subtitle (opsional)">
                <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
              </Field>
              <Field label="Tanggal / Periode">
                <Input value={dateRange} onChange={(e) => setDateRange(e.target.value)}
                       placeholder="5 - 11 Mei 2026" />
              </Field>
            </div>
          </Section>

          <Section title="Tema">
            <div className="grid grid-cols-2 gap-3">
              {themes.map((t) => (
                <button
                  type="button"
                  key={t.key}
                  onClick={() => pickTheme(t.key)}
                  className={cn(
                    "rounded-xl p-3 border-2 text-left transition-all hover:scale-[1.02]",
                    theme === t.key ? "border-primary shadow-[0_0_20px_hsl(var(--primary)/0.5)]" : "border-border"
                  )}
                  style={{ background: "hsl(var(--card))" }}
                >
                  <div className="h-10 rounded-lg mb-2" style={{ background: t.swatch }} />
                  <div className="text-sm font-semibold">{t.label}</div>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Ornament">
            <div className="grid grid-cols-3 gap-2">
              {ornamentOptions.map((o) => (
                <button
                  type="button"
                  key={o.key}
                  onClick={() => setOrnament(o.key)}
                  className={cn(
                    "rounded-lg p-2 border-2 text-xs font-semibold transition-all hover:scale-[1.02]",
                    ornament === o.key ? "border-primary" : "border-border"
                  )}
                >
                  <div className={`h-10 rounded mb-1 theme-${theme} ornament-${o.key}`}
                       style={{ backgroundColor: "hsl(var(--t-card))" }} />
                  {o.label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Karakter VTuber">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={cn(
                "border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer",
                dragOver ? "border-primary bg-primary/10" : "border-border hover:border-primary/60"
              )}
              onClick={() => document.getElementById("char-upload")?.click()}
            >
              {characterUrl ? (
                <img src={characterUrl} alt="preview"
                     className="mx-auto max-h-40 rounded-lg object-contain" />
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag & drop atau klik untuk upload PNG/JPG
                  </p>
                </>
              )}
              <input
                id="char-upload" type="file" accept="image/*" hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm"
                      onClick={() => setCharFit(charFit === "cover" ? "contain" : "cover")}>
                <ImageIcon className="w-4 h-4 mr-1" />
                Fit: {charFit === "cover" ? "Cover" : "Contain"}
              </Button>
              <Button variant="outline" size="sm"
                      onClick={() => setCharacterUrl(null)} disabled={!characterUrl}>
                Hapus
              </Button>
            </div>
          </Section>

          <Section title="Jadwal Mingguan">
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {days.map((d, i) => (
                <div key={i} className="rounded-xl p-3 border border-border bg-card/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">{d.day}</span>
                  </div>
                  <Select value={d.type} onValueChange={(v) => updateDay(i, "type", v as DayItem["type"])}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {scheduleTypes.map((type) => (
                        <SelectItem key={type.key} value={type.key}>
                          <span className="inline-flex items-center gap-2">{type.icon}{type.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input value={d.time} onChange={(e) => updateDay(i, "time", e.target.value)}
                         placeholder="19:00 WIB" className="h-8" />
                  <Input value={d.title} onChange={(e) => updateDay(i, "title", e.target.value)}
                         placeholder="Aktivitas" className="h-8" />
                  <Textarea value={d.note} onChange={(e) => updateDay(i, "note", e.target.value)}
                            placeholder="Catatan (opsional)" rows={1} className="min-h-[32px]" />
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
            <p className="text-xs text-muted-foreground mt-2">
              Output di-render @2x untuk hasil ultra HD.
            </p>
          </Section>
        </aside>

        <main className="animate-fade-in">
          <div className="glass rounded-2xl p-4 sticky top-4">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-sm text-muted-foreground">Preview ({ratio})</span>
              <span className="text-xs text-muted-foreground">
                Output: {ratio === "16:9" ? "3840×2160" : "3840×2880"} (HD)
              </span>
            </div>
            <div
              ref={previewWrapRef}
              className="w-full overflow-hidden rounded-xl border border-border bg-black/30"
              style={{ height: canvasH * scale }}
            >
              <div
                style={{
                  width: 1920,
                  height: canvasH,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                <ScheduleCanvas
                  ref={canvasRef}
                  title={title}
                  subtitle={subtitle}
                  dateRange={dateRange}
                  days={days}
                  characterUrl={characterUrl}
                  charFit={charFit}
                  theme={theme}
                  ratio={ratio}
                  ornament={ornament}
                />
              </div>
            </div>
            <Button
              size="lg"
              onClick={downloadPng}
              disabled={busy}
              className="mt-4 h-12 w-full rounded-xl text-base font-black tracking-wide shadow-[0_0_30px_hsl(var(--primary)/0.35)]"
              style={{ background: "var(--gradient-accent)", color: "hsl(var(--primary-foreground))" }}
            >
              <Download className="w-5 h-5" />
              {busy ? "Rendering..." : "Download Schedule"}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="glass rounded-2xl p-5">
    <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-primary">
      {title}
    </h2>
    {children}
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    {children}
  </div>
);
