import { render } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import { ScheduleCanvas, type DayItem, type LayoutKey, type ThemeKey } from "@/components/ScheduleCanvas";
import { CELESTIAL_PALETTES, CAT_PALETTES, ANIMAL_V2_PALETTES } from "@/lib/palettes";

const THEMES: ThemeKey[] = [
  "cute", "aesthetic", "gothic", "sakura", "cyber", "mint", "royalred", "magic", "mono",
];
const LAYOUTS: LayoutKey[] = ["grid", "bubbles", "royal", "celestial", "cat", "animal", "scrapbook"]; // animal = legacy alias untuk cat; scrapbook = reference-based template

const days: DayItem[] = [
  "Senin 8", "Selasa 9", "Rabu 10", "Kamis 11", "Jumat 12", "Sabtu 13", "Minggu 14",
].map((day) => ({
  day,
  slots: [{ time: "19:00 WIB", title: "Just Chatting", note: "", type: "solo", platforms: ["twitch"] }],
}));

type CanvasProps = ComponentProps<typeof ScheduleCanvas>;

const baseProps: CanvasProps = {
  title: "Test Schedule",
  subtitle: "sub",
  dateRange: "8 - 14 September 2026",
  days,
  characterUrl: null,
  charFit: "cover",
  theme: "cute",
  ratio: "16:9",
  ornaments: [],
  layout: "grid",
};

const renderCanvas = (over: Partial<CanvasProps> = {}) =>
  render(<ScheduleCanvas {...baseProps} {...over} />);

describe("ScheduleCanvas", () => {
  it.each(LAYOUTS)('layout "%s" render tanpa crash', (layout) => {
    const { container } = renderCanvas({ layout });
    expect(container.querySelector(".schedule-canvas")).toBeTruthy();
  });

  it.each(THEMES)('layout celestial render untuk tema "%s"', (theme) => {
    const { container } = renderCanvas({ layout: "celestial", theme });
    expect(container.querySelector(`.schedule-canvas.theme-${theme}`)).toBeTruthy();
  });

  it("setiap tema punya palet celestial (termasuk mono — tidak ada fallback diam-diam)", () => {
    THEMES.forEach((t) => {
      const p = CELESTIAL_PALETTES[t];
      expect(p, `CELESTIAL_PALETTES.${t}`).toBeTruthy();
      expect(p.bubble).toMatch(/^#/);
      expect(p.text).toMatch(/^#/);
    });
  });

  it("setiap tema punya palet cat (alias animal)", () => {
    THEMES.forEach((t) => {
      expect(CAT_PALETTES[t], `CAT_PALETTES.${t}`).toBeTruthy();
      expect(ANIMAL_V2_PALETTES[t], `ANIMAL_V2_PALETTES.${t}`).toBeTruthy();
      expect(CAT_PALETTES[t]).toEqual(ANIMAL_V2_PALETTES[t]);
    });
  });

  it('layout celestial + tema mono memakai palet mono (grayscale), bukan fallback magic', () => {
    const { container } = renderCanvas({ layout: "celestial", theme: "mono" });
    expect(container.innerHTML).toContain(CELESTIAL_PALETTES.mono.bubbleBorder);
    expect(container.innerHTML).not.toContain(CELESTIAL_PALETTES.magic.bubbleBorder);
  });

  it("cat v3: paw badge berisi tanggal; tanggal di samping nama hari dihapus (cat & legacy animal)", () => {
    for (const layout of ["cat", "animal"] as const) {
      const { container, unmount } = renderCanvas({ layout });
      const text = container.textContent ?? "";
      expect(text).toContain("14");
      expect(text).not.toContain("07");
      expect(text).not.toMatch(/·\d/);
      unmount();
    }
  });

  it('cat v3: eyebrow "Vol. 01" dihapus, tanggal tampil di atas judul (cat & animal)', () => {
    for (const layout of ["cat", "animal"] as const) {
      const { container, unmount } = renderCanvas({ layout });
      const text = container.textContent ?? "";
      expect(text).not.toContain("Weekly Broadcast");
      expect(text).toContain("8 - 14 September 2026");
      unmount();
    }
  });

  it("cat: handle Instagram/X/TikTok tampil di footer; kosong = tidak tampil (cat & animal)", () => {
    for (const layout of ["cat", "animal"] as const) {
      const { container, unmount } = renderCanvas({
        layout,
        youtubeHandle: "", twitchHandle: "",
        instagramHandle: "@igku", xHandle: "@xku", tiktokHandle: "@ttku",
      });
      const text = container.textContent ?? "";
      expect(text).toContain("@igku");
      expect(text).toContain("@xku");
      expect(text).toContain("@ttku");
      unmount();
    }
  });

  it('cat: "jadwal kedua" (slot ke-2) ikut dirender di baris hari (cat & animal)', () => {
    for (const layout of ["cat", "animal"] as const) {
      const daysWith2 = days.map((d, i) =>
        i === 0 ? { ...d, slots: [...d.slots, { time: "22:00 WIB", title: "Stream Kedua", note: "", type: "solo" as const, platforms: ["youtube" as const] }] } : d
      );
      const { container, unmount } = renderCanvas({ layout, days: daysWith2 as any });
      const text = container.textContent ?? "";
      expect(text).toContain("Just Chatting");
      expect(text).toContain("Stream Kedua");
      expect(text).toContain("22:00 WIB");
      unmount();
    }
  });
});
