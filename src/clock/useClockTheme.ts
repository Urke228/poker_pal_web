import { useEffect, useState } from "react";

const THEMES = ["felt", "midnight", "charcoal", "light"] as const;
export type ClockTheme = (typeof THEMES)[number];

export function useClockTheme() {
  const [theme, setTheme] = useState<ClockTheme>(() => {
    const saved = localStorage.getItem("clockTheme");
    return (THEMES as readonly string[]).includes(saved ?? "")
      ? (saved as ClockTheme)
      : "felt";
  });

  useEffect(() => {
    localStorage.setItem("clockTheme", theme);
  }, [theme]);

  const cycleTheme = () =>
    setTheme((t) => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length]);

  return { theme, cycleTheme };
}

export function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}
