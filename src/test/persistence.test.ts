import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearState,
  loadState,
  sanitizeState,
  saveState,
  STORAGE_KEY,
  type PersistedState,
} from "@/lib/persistence";

const sampleState = (): PersistedState => ({
  v: 1,
  savedAt: 1726400000000,
  title: "Test Schedule",
  subtitle: "sub",
  dateRange: "14 - 20 September 2026",
  dateFrom: new Date(2026, 8, 14).toISOString(),
  dateTo: new Date(2026, 8, 20).toISOString(),
  artBy: "Art by @me",
  youtubeHandle: "@yt",
  twitchHandle: "@tw",
  days: [
    {
      day: "Senin 14",
      slots: [
        { time: "19:00 WIB", title: "Genshin", note: "", type: "solo", platforms: ["twitch"] },
      ],
    },
  ],
  characterUrl: "data:image/png;base64,AAAA",
  charFit: "contain",
  charScale: 1.5,
  charOffsetX: 10,
  charOffsetY: -5,
  theme: "magic",
  ornaments: [
    { icon: "star", count: 40, size: 32, spacing: 160, offsetX: 0, offsetY: 0, rotation: 0, opacity: 0.35, color: "" },
  ],
  layout: "celestial",
  ratio: "4:3",
  texture: { url: null, blend: "overlay", opacity: 0.5, size: 100, repeat: true, scope: "all", offsetX: 0, offsetY: 0, rotation: 0 },
});

describe("persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("round-trips penuh: save → load menghasilkan state yang sama", () => {
    expect(saveState(sampleState())).toBe("saved");
    expect(loadState()).toEqual(sampleState());
  });

  it("load mengembalikan null bila belum ada data", () => {
    expect(loadState()).toBeNull();
  });

  it("load mengembalikan null pada JSON rusak (tidak melempar error)", () => {
    localStorage.setItem(STORAGE_KEY, "{ini bukan json");
    expect(loadState()).toBeNull();
  });

  it("sanitize menolak versi yang tidak dikenal", () => {
    expect(sanitizeState({ v: 2, title: "x" })).toBeNull();
    expect(sanitizeState(null)).toBeNull();
    expect(sanitizeState("string")).toBeNull();
  });

  it("sanitize menormalkan field yang tidak valid ke nilai aman", () => {
    const s = sanitizeState({
      v: 1,
      title: 42,
      theme: "tema-ngawur",
      layout: null,
      charScale: 999,
      charOffsetX: -9999,
      days: "bukan-array",
      ornaments: [{ icon: "____", count: 99999 }],
    });
    expect(s).not.toBeNull();
    expect(s?.title).toBe("");
    expect(s?.theme).toBe("cute");
    expect(s?.layout).toBe("bubbles");
    expect(s?.charScale).toBe(3); // di-clamp ke maksimum editor
    expect(s?.charOffsetX).toBe(-100); // di-clamp ke minimum editor
    expect(s?.days).toEqual([]);
    expect(s?.ornaments[0].icon).toBe("star");
    expect(s?.ornaments[0].count).toBe(200);
  });

  it("sanitize memfilter platform & tipe slot yang tidak dikenal", () => {
    const s = sanitizeState({
      v: 1,
      days: [
        {
          day: "Senin 14",
          slots: [
            { time: "19:00", title: "X", note: "", type: "podcast", platforms: ["twitch", "myspace", null] },
          ],
        },
      ],
    });
    expect(s?.days[0].slots[0].type).toBe("solo");
    expect(s?.days[0].slots[0].platforms).toEqual(["twitch"]);
  });

  it("fallback 'stripped' saat kuota penuh: pengaturan tersimpan tanpa gambar", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new DOMException("quota exceeded", "QuotaExceededError");
    });
    expect(saveState(sampleState())).toBe("stripped");

    const loaded = loadState();
    expect(loaded?.title).toBe("Test Schedule");
    expect(loaded?.characterUrl).toBeNull(); // gambar dilepas demi muat
  });

  it("mengembalikan 'error' bila penyimpanan gagal total", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota exceeded", "QuotaExceededError");
    });
    expect(saveState(sampleState())).toBe("error");
  });

  it("clearState menghapus data tersimpan", () => {
    saveState(sampleState());
    expect(loadState()).not.toBeNull();
    clearState();
    expect(loadState()).toBeNull();
  });
});
