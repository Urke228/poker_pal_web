import { useEffect, useState } from "react";

/**
 * Returns the current time in ms, refreshed on a Web Worker-driven tick.
 *
 * A plain `setInterval` is throttled or fully frozen by browsers in
 * inactive/backgrounded tabs, so a countdown driven by it stalls until the
 * tab regains focus. A Web Worker's timers aren't subject to that throttling,
 * so we tick from there and also refresh immediately on `visibilitychange`
 * for an instant catch-up the moment the tab becomes visible again.
 */
export function useNow(): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = () => setNow(Date.now());
    let worker: Worker | null = null;
    try {
      const blob = new Blob(
        ["setInterval(function () { postMessage(0); }, 400);"],
        { type: "application/javascript" },
      );
      worker = new Worker(URL.createObjectURL(blob));
      worker.onmessage = tick;
    } catch {
      // Fallback if Web Workers are unavailable.
    }
    const interval = setInterval(tick, worker ? 1000 : 400);
    const onVisible = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      worker?.terminate();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return now;
}
