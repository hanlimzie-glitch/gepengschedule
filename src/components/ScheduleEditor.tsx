import { useRef, useState, useCallback } from "react";
import html2canvas from "html2canvas";
import domtoimage from "dom-to-image-more";
import { Upload, Download, Sparkles, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ScheduleCanvas, type DayItem, type ThemeKey } from "./ScheduleCanvas";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DAYS_ID = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const initialDays: DayItem[] = DAYS_ID.map((d) => ({
  day: d, time: "19:00 WIB", title: "Just Chatting", note: "",
}));

const themes: { key: ThemeKey; label: string; swatch: string }[] = [
  { key: "pink", label: "Pink Pastel", swatch: "linear-gradient(135deg,#ffb3d9,#d896ff)" },
  { key: "purple", label: "Purple Neon", swatch: "linear-gradient(135deg,#b14dff,#4dc3ff)" },
  { key: "blue", label: "Blue Cyber", swatch: "linear-gradient(135deg,#33d6ff,#7a7aff)" },
  { key: "cute", label: "Cute", swatch: "linear-gradient(135deg,#ffc299,#ff99c2)" },
];

export const ScheduleEditor = () => {
  const [title, setTitle] = useState("Huan Weekly Schedule");
  const [subtitle, setSubtitle] = useState("Powered by Lovable ♡");
  const [dateRange, setDateRange] = useState("5 - 11 Mei 2026");
  const [days, setDays] = useState<DayItem[]>(initialDays);
  const [characterUrl, setCharacterUrl] = useState<string | null>(null);
  const [charFit, setCharFit] = useState<"cover" | "contain">("cover");
  const [theme, setTheme] = useState<ThemeKey>("pink");
  const [ratio, setRatio] = useState<"16:9" | "4:3">("16:9");
  const [exporter, setExporter] = useState<"html2canvas" | "dom-to-image">("html2canvas");
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const updateDay = (i: number, key: keyof DayItem, val: string) => {
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

  const downloadPng = async () => {
    if (!canvasRef.current) return;
    setBusy(true);
    try {
      let dataUrl: string;
      if (exporter === "html2canvas") {
        const canvas = await html2canvas(canvasRef.current, {
          backgroundColor: null, scale: 1, useCORS: true, logging: false,
        });
        dataUrl = canvas.toDataURL("image/png");
      } else {
        dataUrl = await domtoimage.toPng(canvasRef.current, {
          quality: 1,
          width: canvasRef.current.offsetWidth,
          height: canvasRef.current.offsetHeight,
        });
      }
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${title.replace(/\s+/g, "_")}_${ratio.replace(":", "x")}.png`;
      a.click();
      toast.success("Schedule berhasil di-download! ✨");
    } catch (err) {
      console.error(err);
      toast.error("Gagal export. Coba metode export lain.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
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
        <Button
          size="lg"
          onClick={downloadPng}
          disabled={busy}
          className="text-base font-bold h-12 px-6 rounded-xl shadow-[0_0_30px_hsl(320_90%_70%/0.4)]"
          style={{ background: "var(--gradient-accent)", color: "hsl(var(--background))" }}
        >
          <Download className="mr-2 w-5 h-5" />
          {busy ? "Rendering..." : "Download Schedule"}
        </Button>
      </header>

      <div className="max-w-[1800px] mx-auto grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        {/* Sidebar editor */}
        <aside className="space-y-5 animate-fade-in">
          {/* Title */}
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

          {/* Theme */}
          <Section title="Tema">
            <div className="grid grid-cols-2 gap-3">
              {themes.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTheme(t.key)}
                  className={cn(
                    "rounded-xl p-3 border-2 text-left transition-all hover:scale-[1.02]",
                    theme === t.key ? "border-primary shadow-glow" : "border-border"
                  )}
                  style={{ background: "hsl(var(--card))" }}
                >
                  <div className="h-10 rounded-lg mb-2" style={{ background: t.swatch }} />
                  <div className="text-sm font-semibold">{t.label}</div>
                </button>
              ))}
            </div>
          </Section>

          {/* Character */}
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

          {/* Days */}
          <Section title="Jadwal Mingguan">
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {days.map((d, i) => (
                <div key={i} className="rounded-xl p-3 border border-border bg-card/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">{d.day}</span>
                  </div>
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

          {/* Export */}
          <Section title="Export">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rasio">
                <Select value={ratio} onValueChange={(v) => setRatio(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (1920×1080)</SelectItem>
                    <SelectItem value="4:3">4:3 (1920×1440)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Library">
                <Select value={exporter} onValueChange={(v) => setExporter(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="html2canvas">html2canvas</SelectItem>
                    <SelectItem value="dom-to-image">dom-to-image</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Section>
        </aside>

        {/* Preview */}
        <main className="animate-fade-in">
          <div className="glass rounded-2xl p-4 sticky top-4">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-sm text-muted-foreground">Preview ({ratio})</span>
              <span className="text-xs text-muted-foreground">
                Output: {ratio === "16:9" ? "1920×1080" : "1920×1440"}
              </span>
            </div>
            <div className="w-full overflow-hidden rounded-xl border border-border bg-black/30">
              <div
                className="origin-top-left"
                style={{
                  transform: "scale(var(--scale))",
                  width: 1920,
                  height: ratio === "16:9" ? 1080 : 1440,
                  // computed via CSS clamp via JS below
                }}
                ref={(el) => {
                  if (!el) return;
                  const parent = el.parentElement!;
                  const update = () => {
                    const s = parent.clientWidth / 1920;
                    el.style.setProperty("--scale", String(s));
                    parent.style.height = `${(ratio === "16:9" ? 1080 : 1440) * s}px`;
                  };
                  update();
                  // observe resize
                  const ro = new ResizeObserver(update);
                  ro.observe(parent);
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
                />
              </div>
            </div>
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
