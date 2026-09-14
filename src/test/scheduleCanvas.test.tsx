import { render } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import { ScheduleCanvas, type DayItem, type LayoutKey, type ThemeKey } from "@/components/ScheduleCanvas";
import { CELESTIAL_PALETTES, ANIMAL_V2_PALETTES } from "@/lib/palettes";

const THEMES: ThemeKey[] = [
  "cute", "aesthetic", "gothic", "sakura", "cyber", "mint", "royalred", "magic", "mono",
];
const LAYOUTS: LayoutKey[] = ["grid", "bubbles", "royal", "celestial", "animal"];

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

  it("setiap tema punya palet animal", () => {
    THEMES.forEach((t) => {
      expect(ANIMAL_V2_PALETTES[t], `ANIMAL_V2_PALETTES.${t}`).toBeTruthy();
    });
  });

  it('layout celestial + tema mono memakai palet mono (grayscale), bukan fallback magic', () => {
    const { container } = renderCanvas({ layout: "celestial", theme: "mono" });
    // Frame oval celestial memakai bubbleBorder palet mono (#b5b5b5), bukan ungu magic
    expect(container.innerHTML).toContain(CELESTIAL_PALETTES.mono.bubbleBorder);
    expect(container.innerHTML).not.toContain(CELESTIAL_PALETTES.magic.bubbleBorder);
  });
});
