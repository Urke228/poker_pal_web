import { useEffect, useRef } from "react";

/** Web Audio beep for the final 5 seconds of a level (the last one is distinct). */
export function useBeep(remainingMs: number, isRunning: boolean) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  useEffect(() => {
    const ensureAudio = () => {
      const AC = window.AudioContext ?? (window as any).webkitAudioContext;
      if (!AC) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AC();
      if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    };
    // Browsers block audio until a user gesture; unlock on the first interaction.
    const events: Array<keyof DocumentEventMap> = ["click", "keydown", "touchstart"];
    events.forEach((ev) => document.addEventListener(ev, ensureAudio));
    return () => events.forEach((ev) => document.removeEventListener(ev, ensureAudio));
  }, []);

  useEffect(() => {
    if (!isRunning || remainingMs <= 0) {
      lastBeepSecondRef.current = null;
      return;
    }
    const sec = Math.ceil(remainingMs / 1000);
    if (sec <= 5 && sec !== lastBeepSecondRef.current) {
      lastBeepSecondRef.current = sec;
      beep(audioCtxRef.current, sec === 1);
    } else if (sec > 5) {
      lastBeepSecondRef.current = null;
    }
  }, [remainingMs, isRunning]);
}

function beep(ctx: AudioContext | null, isFinal: boolean) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  osc.type = "sine";
  osc.frequency.value = isFinal ? 1320 : 880;
  const dur = isFinal ? 0.7 : 0.18;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.35, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.start(now);
  osc.stop(now + dur + 0.03);
}
