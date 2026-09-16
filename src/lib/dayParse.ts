/* Shared day-label parsing ("Senin 8" / "Monday 8" -> { abbr: "MON", num: "8" }).
   Single source of truth for all poster layouts. */

const DAY_ABBR: Record<string, string> = {
  minggu: "SUN", senin: "MON", selasa: "TUE", rabu: "WED", kamis: "THU", jumat: "FRI", sabtu: "SAT",
  sunday: "SUN", monday: "MON", tuesday: "TUE", wednesday: "WED", thursday: "THU", friday: "FRI", saturday: "SAT",
};

export const parseDay = (raw: string): { abbr: string; num: string } => {
  const m = raw.trim().match(/^(\S+)\s*(\d+)?/);
  const word = (m?.[1] || raw).toLowerCase();
  const abbr = DAY_ABBR[word] || (m?.[1] || raw).slice(0, 3).toUpperCase();
  const num = m?.[2] || "";
  return { abbr, num };
};
