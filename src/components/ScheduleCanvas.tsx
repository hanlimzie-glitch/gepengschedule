import { forwardRef } from "react";
import { Sparkles, Star, Heart } from "lucide-react";

export type DayItem = {
  day: string;
  time: string;
  title: string;
  note: string;
};

export type ThemeKey = "pink" | "purple" | "blue" | "cute";

export type ScheduleProps = {
  title: string;
  subtitle: string;
  dateRange: string;
  days: DayItem[];
  characterUrl: string | null;
  charFit: "cover" | "contain";
  theme: ThemeKey;
  ratio: "16:9" | "4:3";
};

const themeIcon: Record<ThemeKey, JSX.Element> = {
  pink: <Heart className="w-5 h-5" fill="currentColor" />,
  purple: <Sparkles className="w-5 h-5" />,
  blue: <Star className="w-5 h-5" fill="currentColor" />,
  cute: <Heart className="w-5 h-5" fill="currentColor" />,
};

const ornamentClass: Record<ThemeKey, string> = {
  pink: "ornament-dots",
  purple: "ornament-stars",
  blue: "ornament-grid",
  cute: "ornament-dots",
};

export const ScheduleCanvas = forwardRef<HTMLDivElement, ScheduleProps>(
  ({ title, subtitle, dateRange, days, characterUrl, charFit, theme, ratio }, ref) => {
    const w = 1920;
    const h = ratio === "16:9" ? 1080 : 1440;

    return (
      <div
        ref={ref}
        className={`schedule-canvas theme-${theme} relative overflow-hidden`}
        style={{
          width: w,
          height: h,
          background: "var(--gradient-theme)",
          color: "hsl(var(--t-text))",
          fontFamily: "'Poppins', 'Inter', sans-serif",
        }}
      >
        {/* Ornament background */}
        <div className={`absolute inset-0 ${ornamentClass[theme]} opacity-60`} />
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
          style={{ background: "var(--gradient-accent)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
          style={{ background: "hsl(var(--t-2))" }}
        />

        {/* Content */}
        <div className="relative h-full flex flex-col p-16">
          {/* Header */}
          <header className="flex items-end justify-between mb-10">
            <div>
              <div
                className="flex items-center gap-3 mb-3 text-2xl"
                style={{ color: "hsl(var(--t-1))" }}
              >
                {themeIcon[theme]}
                <span className="uppercase tracking-[0.4em] font-semibold">
                  Weekly Schedule
                </span>
                {themeIcon[theme]}
              </div>
              <h1
                className="text-8xl font-black leading-none glow-text"
                style={{ color: "hsl(var(--t-text))" }}
              >
                {title || "VTuber Schedule"}
              </h1>
              {subtitle && (
                <p className="mt-4 text-3xl font-light" style={{ color: "hsl(var(--t-muted))" }}>
                  {subtitle}
                </p>
              )}
            </div>
            <div
              className="text-right px-8 py-4 rounded-2xl"
              style={{
                background: "hsl(var(--t-card) / 0.7)",
                border: "2px solid hsl(var(--t-border) / 0.6)",
              }}
            >
              <div className="text-xl uppercase tracking-widest" style={{ color: "hsl(var(--t-1))" }}>
                Date
              </div>
              <div className="text-4xl font-bold mt-1">{dateRange}</div>
            </div>
          </header>

          {/* Body: schedule grid + character */}
          <div className="flex-1 flex gap-10 min-h-0">
            {/* Schedule grid */}
            <div className="flex-1 grid grid-cols-2 grid-rows-4 gap-5">
              {days.map((d, i) => (
                <div
                  key={i}
                  className={`relative rounded-2xl p-6 flex gap-5 ${
                    i === days.length - 1 ? "col-span-2" : ""
                  }`}
                  style={{
                    background: "hsl(var(--t-card) / 0.75)",
                    border: "2px solid hsl(var(--t-border) / 0.5)",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <div
                    className="flex flex-col items-center justify-center px-5 rounded-xl min-w-[140px]"
                    style={{ background: "var(--gradient-accent)", color: "hsl(var(--t-bg-to))" }}
                  >
                    <div className="text-sm uppercase tracking-widest font-bold opacity-80">
                      Day
                    </div>
                    <div className="text-4xl font-black">{d.day}</div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div
                      className="text-xl font-bold mb-1"
                      style={{ color: "hsl(var(--t-1))" }}
                    >
                      {d.time || "—"}
                    </div>
                    <div className="text-2xl font-bold leading-tight" style={{ color: "hsl(var(--t-text))" }}>
                      {d.title || "Free"}
                    </div>
                    {d.note && (
                      <div className="text-lg mt-1" style={{ color: "hsl(var(--t-muted))" }}>
                        {d.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Character frame (4:3) */}
            <div
              className="relative rounded-3xl overflow-hidden flex-shrink-0"
              style={{
                width: ratio === "16:9" ? 600 : 700,
                aspectRatio: "4 / 3",
                background: "hsl(var(--t-card))",
                border: "4px solid hsl(var(--t-border))",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              {characterUrl ? (
                <img
                  src={characterUrl}
                  alt="VTuber character"
                  crossOrigin="anonymous"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: charFit,
                    objectPosition: "center",
                  }}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-3xl"
                  style={{ color: "hsl(var(--t-muted))" }}
                >
                  Upload your character ✨
                </div>
              )}
              {/* Frame corners */}
              <div className="absolute top-3 left-3 w-12 h-12 border-t-4 border-l-4 rounded-tl-2xl"
                style={{ borderColor: "hsl(var(--t-1))" }} />
              <div className="absolute top-3 right-3 w-12 h-12 border-t-4 border-r-4 rounded-tr-2xl"
                style={{ borderColor: "hsl(var(--t-1))" }} />
              <div className="absolute bottom-3 left-3 w-12 h-12 border-b-4 border-l-4 rounded-bl-2xl"
                style={{ borderColor: "hsl(var(--t-1))" }} />
              <div className="absolute bottom-3 right-3 w-12 h-12 border-b-4 border-r-4 rounded-br-2xl"
                style={{ borderColor: "hsl(var(--t-1))" }} />
            </div>
          </div>

          {/* Footer */}
          <footer
            className="mt-8 flex items-center justify-between text-xl"
            style={{ color: "hsl(var(--t-muted))" }}
          >
            <span className="tracking-widest uppercase">Stay tuned ♡</span>
            <span className="tracking-widest uppercase">All times local</span>
          </footer>
        </div>
      </div>
    );
  }
);
ScheduleCanvas.displayName = "ScheduleCanvas";
