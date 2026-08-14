import { useEffect, type RefObject } from "react";

/**
 * Scales the root font-size (all board text is sized in rem) so the board
 * fills as much of the viewport as possible. It's a fixed point — once
 * fitted, re-running leaves it unchanged, so it's safe to call on every
 * render.
 */
export function useAutoFit(innerRef: RefObject<HTMLElement | null>, deps: unknown[]) {
  useEffect(() => {
    const fit = () => {
      const inner = innerRef.current;
      if (!inner) return;
      const w = inner.scrollWidth;
      const h = inner.scrollHeight;
      if (!w || !h) return;
      const cur =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const factor = Math.min(
        (window.innerWidth * 0.97) / w,
        (window.innerHeight * 0.97) / h,
      );
      let next = cur * factor;
      next = Math.max(3, Math.min(600, next));
      if (Math.abs(next - cur) > 0.4) {
        document.documentElement.style.fontSize = `${next}px`;
      }
    };
    fit();
    window.addEventListener("resize", fit);
    document.addEventListener("fullscreenchange", () => setTimeout(fit, 60));
    return () => {
      window.removeEventListener("resize", fit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(
    () => () => {
      document.documentElement.style.fontSize = "";
    },
    [],
  );
}
