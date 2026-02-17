import { useCallback, useRef } from "react";

export const useNotificationSound = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback(() => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain); gain.connect(ctx.destination);
      oscillator.frequency.value = 800; oscillator.type = "sine"; gain.gain.value = 0.15;
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch {}
  }, []);

  const playAttention = useCallback(() => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      [0, 0.15, 0.3].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 1000; osc.type = "square"; gain.gain.value = 0.2;
        osc.start(ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.1);
        osc.stop(ctx.currentTime + delay + 0.1);
      });
    } catch {}
  }, []);

  return { playBeep, playAttention };
};
