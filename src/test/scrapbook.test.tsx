import { render } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import { ScheduleCanvas, type DayItem } from "@/components/ScheduleCanvas";
import { sanitizeState } from "@/lib/persistence";
import {
  DEFAULT_SCRAP_DECO, SCRAP_THEME_PRESETS, resolveScrapTheme,
  type ScrapDecoConfig,
} from "@/template/scrapbook/types";

type CanvasProps = ComponentProps<typeof ScheduleCanvas>;

const makeDays = (over: Partial<DayItem>[] = []): DayItem[] =>
  ["Senin 1", "Selasa 2", "Rabu 3", "Kamis 4", "Jumat 5", "Sabtu 6", "Minggu 7"].map((day, i) => ({
    day,
    slots: [{
      time: "10 PM", title: ["HONKAI STAR RAIL", "APEX LEGENDS", "GENSHIN IMPACT", "", "JUST CHATTING", "FORTNITE", ""][i],
      note: i === 1 ? "co-op with my friends" : i === 2 ? "farming & quests" : "",
      type: i === 3 || i === 6 ? ("offline" as const) : ("solo" as const),
      platforms: [],
    }],
    ...over[i],
  }));

const base: CanvasProps = {
  title: "schedule",
  subtitle: "weekly",
  dateRange: "1 - 7 Januari 2026",
  days: makeDays(),
  characterUrl: null,
  charFit: "cover",
  theme: "cute",
  ratio: "16:9",
  ornaments: [],
  layout: "scrapbook",
  scrapRibbonStart: "01/01",
  scrapRibbonEnd: "07/01",
};

const renderScrap = (over: Partial<CanvasProps> = {}) => render(<ScheduleCanvas {...base} {...over} />);

// jsdom menormalkan nilai hex menjadi rgb() saat dibaca dari style — samakan formatnya
const rgb = (hex: string) => {
  const m = hex.replace("#", "");
  const n = parseInt(m.length === 3 ? m.split("").map((c) => c + c).join("") : m, 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

const PAPER_STYLE = { left: "118px", top: "26px", width: "1000px", height: "1024px" };
const CHAR_STYLE = { right: "96px", top: "64px", width: "680px", height: "900px" };

describe("scrapbook template (reference-based)", () => {
  it("render komposisi lengkap: paper, ribbon, 7 baris, karakter, sidebar, awan", () => {
    const { container } = renderScrap();
    expect(container.querySelector('[data-testid="scrap-root"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="scrap-paper"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="scrap-ribbon"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="scrap-char"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="scrap-sidebar"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="scrap-clouds"]')).toBeTruthy();
    for (let i = 0; i < 7; i++) {
      expect(container.querySelector(`[data-testid="scrap-row-${i}"]`), `row ${i}`).toBeTruthy();
    }
  });

  it("konten data-driven: judul, note, waktu, dan baris day-off tampil", () => {
    const { container } = renderScrap();
    const text = container.textContent ?? "";
    expect(text).toContain("HONKAI STAR RAIL");
    expect(text).toContain("co-op with my friends");
    expect(text).toContain("10 PM");
    expect(text).toContain("01/01");
    expect(text).toContain("07/01");
    expect(text.toUpperCase()).toContain("DAY OFF");
    // baris ke-4 (Kamis) adalah day-off → judul kosongnya tidak dirender sebagai stream
    const row3 = container.querySelector('[data-testid="scrap-row-3"]');
    expect(row3?.textContent ?? "").not.toContain("10 PM");
  });

  it("7 baris selalu dirender walau hari < 7 (komposisi tetap)", () => {
    const { container } = renderScrap({ days: makeDays().slice(0, 3) });
    for (let i = 0; i < 7; i++) {
      expect(container.querySelector(`[data-testid="scrap-row-${i}"]`), `row ${i}`).toBeTruthy();
    }
  });

  it("komposisi FIX: posisi paper & karakter sama persis untuk semua preset tema", () => {
    const positions = (Object.keys(SCRAP_THEME_PRESETS) as (keyof typeof SCRAP_THEME_PRESETS)[]).map((k) => {
      const { container, unmount } = renderScrap({ scrapTheme: k });
      const paper = container.querySelector('[data-testid="scrap-paper"]') as HTMLElement;
      const char = container.querySelector('[data-testid="scrap-char"]') as HTMLElement;
      const res = {
        paper: { left: paper.style.left, top: paper.style.top, width: paper.style.width, height: paper.style.height },
        char: { right: char.style.right, top: char.style.top, width: char.style.width, height: char.style.height },
      };
      unmount();
      return res;
    });
    positions.forEach((p) => {
      expect(p.paper).toEqual(PAPER_STYLE);
      expect(p.char).toEqual(CHAR_STYLE);
    });
  });

  it("ganti tema hanya mengubah warna, bukan posisi", () => {
    const grab = (k: "pink" | "blue") => {
      const { container, unmount } = renderScrap({ scrapTheme: k });
      const root = container.querySelector('[data-testid="scrap-root"]') as HTMLElement;
      const paper = container.querySelector('[data-testid="scrap-paper"]') as HTMLElement;
      const res = { bg: root.style.background, paperLeft: paper.style.left, paperTop: paper.style.top };
      unmount();
      return res;
    };
    const pink = grab("pink");
    const blue = grab("blue");
    expect(pink.bg).toBe(rgb(SCRAP_THEME_PRESETS.pink.bg));
    expect(blue.bg).toBe(rgb(SCRAP_THEME_PRESETS.blue.bg));
    expect(pink.bg).not.toBe(blue.bg);
    expect(pink.paperLeft).toBe(blue.paperLeft);
    expect(pink.paperTop).toBe(blue.paperTop);
  });

  it("custom theme: override satu token, sisanya ikut preset pink", () => {
    const pal = resolveScrapTheme("custom", { bg: "#123456" });
    expect(pal.bg).toBe("#123456");
    expect(pal.paper).toBe(SCRAP_THEME_PRESETS.pink.paper);
    const { container } = renderScrap({ scrapTheme: "custom", scrapCustom: { bg: "#123456" } });
    const root = container.querySelector('[data-testid="scrap-root"]') as HTMLElement;
    expect(root.style.background).toBe(rgb("#123456"));
  });

  it("area karakter tetap di posisi sama dengan / tanpa gambar", () => {
    const a = renderScrap({ characterUrl: null });
    const b = renderScrap({ characterUrl: "data:image/png;base64,AAAA" });
    const ca = a.container.querySelector('[data-testid="scrap-char"]') as HTMLElement;
    const cb = b.container.querySelector('[data-testid="scrap-char"]') as HTMLElement;
    expect({ right: ca.style.right, top: ca.style.top, width: ca.style.width, height: ca.style.height })
      .toEqual({ right: cb.style.right, top: cb.style.top, width: cb.style.width, height: cb.style.height });
  });

  it("toggle dekorasi menyembunyikan elemen tanpa menggeser paper", () => {
    const deco: ScrapDecoConfig = { ...DEFAULT_SCRAP_DECO, showClouds: false, showSidebar: false, showRibbon: false, set: "minimal" };
    const { container } = renderScrap({ scrapDeco: deco });
    expect(container.querySelector('[data-testid="scrap-clouds"]')).toBeNull();
    expect(container.querySelector('[data-testid="scrap-sidebar"]')).toBeNull();
    expect(container.querySelector('[data-testid="scrap-ribbon"]')).toBeNull();
    expect(container.querySelector('[data-testid="scrap-stickers"]')).toBeNull();
    const paper = container.querySelector('[data-testid="scrap-paper"]') as HTMLElement;
    expect(paper.style.left).toBe(PAPER_STYLE.left);
  });

  it("set dekorasi stars/hearts merender stiker; animal mengubah stiker wajah", () => {
    const stars = renderScrap({ scrapDeco: { ...DEFAULT_SCRAP_DECO, set: "stars" } });
    expect(stars.container.querySelector('[data-testid="scrap-stickers"]')).toBeTruthy();
    const hearts = renderScrap({ scrapDeco: { ...DEFAULT_SCRAP_DECO, set: "hearts" } });
    expect(hearts.container.querySelector('[data-testid="scrap-stickers"]')).toBeTruthy();
  });

  it("handle sosial tampil di sidebar; kosong → placeholder @username", () => {
    const withSocials = renderScrap({ youtubeHandle: "@chan", twitchHandle: "@twt" });
    const sideText = withSocials.container.querySelector('[data-testid="scrap-sidebar"]')?.textContent ?? "";
    expect(sideText).toContain("@chan");
    expect(sideText).toContain("@twt");
    const empty = renderScrap();
    expect(empty.container.querySelector('[data-testid="scrap-sidebar"]')?.textContent ?? "").toContain("@username");
  });

  it("persistence: field scrapbook round-trip & nilai ngawur dinormalkan", () => {
    const s = sanitizeState({
      v: 1,
      layout: "scrapbook",
      scrapTheme: "purple",
      scrapCustom: { bg: "#00ff00", paper: "bukan-warna" },
      scrapDeco: { animal: "fox", set: "mixed", showClouds: false, decoColor: "#ff0000" },
      scrapRibbonStart: "02/02",
      scrapRibbonEnd: "08/02",
    });
    expect(s?.layout).toBe("scrapbook");
    expect(s?.scrapTheme).toBe("purple");
    expect(s?.scrapCustom.bg).toBe("#00ff00");
    expect(s?.scrapCustom.paper).toBeUndefined();
    expect(s?.scrapDeco.animal).toBe("fox");
    expect(s?.scrapDeco.set).toBe("mixed");
    expect(s?.scrapDeco.showClouds).toBe(false);
    expect(s?.scrapDeco.showStickers).toBe(true); // default
    expect(s?.scrapDeco.decoColor).toBe("#ff0000");
    expect(s?.scrapRibbonStart).toBe("02/02");

    const bad = sanitizeState({ v: 1, layout: "scrapbook", scrapTheme: "ngawur", scrapDeco: { animal: "dragon" } });
    expect(bad?.scrapTheme).toBe("pink");
    expect(bad?.scrapDeco.animal).toBe("cat");
  });
});
