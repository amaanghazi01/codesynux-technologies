import { useEffect, useRef, useState } from "react";

/** Animated AI character whose mouth follows the actual AI voice level from the call audio. */
export function AIAvatar({ audio, active }: { audio: HTMLAudioElement | null; active: boolean }) {
  const [level, setLevel] = useState(0);
  const [blink, setBlink] = useState(false);
  const frame = useRef<number>(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 140);
    }, 3800);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!active || !audio) return;
    let context: AudioContext | undefined;
    let analyser: AnalyserNode | undefined;
    let source: MediaStreamAudioSourceNode | undefined;
    let stream: MediaStream | null = null;
    const data = new Uint8Array(256);
    const tick = () => {
      const current = audio.srcObject instanceof MediaStream ? audio.srcObject : null;
      if (current && current !== stream && current.getAudioTracks().length) {
        stream = current;
        try {
          context ??= new AudioContext();
          source?.disconnect();
          analyser = context.createAnalyser();
          analyser.fftSize = 512;
          source = context.createMediaStreamSource(current);
          source.connect(analyser);
        } catch {
          analyser = undefined;
        }
      }
      if (analyser) {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const v of data) sum += ((v - 128) / 128) ** 2;
        setLevel((prev) => prev * 0.6 + Math.min(1, Math.sqrt(sum / data.length) * 6) * 0.4);
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame.current);
      source?.disconnect();
      void context?.close();
      setLevel(0);
    };
  }, [active, audio]);

  const speaking = level > 0.08;
  const mouth = 3 + level * 22;
  return (
    <div className="relative flex flex-col items-center gap-3">
      <div
        className="relative grid size-56 place-items-center rounded-full bg-gradient-to-b from-primary/20 to-accent transition-shadow sm:size-72"
        style={{ boxShadow: speaking ? `0 0 ${30 + level * 60}px hsl(var(--primary, 210 90% 55%) / 0.35)` : undefined }}
      >
        <svg viewBox="0 0 200 200" className="size-44 sm:size-56" aria-hidden="true">
          <defs>
            <linearGradient id="face" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0.75" />
            </linearGradient>
          </defs>
          <g className="text-foreground">
            <rect x="35" y="30" width="130" height="145" rx="62" fill="url(#face)" />
          </g>
          <g className="text-background" fill="currentColor">
            <ellipse cx="75" cy="92" rx="11" ry={blink ? 1.5 : 12} />
            <ellipse cx="125" cy="92" rx="11" ry={blink ? 1.5 : 12} />
            <rect x={100 - (16 + level * 8)} y={135 - mouth / 2} width={32 + level * 16} height={mouth} rx={mouth / 2 + 2} />
          </g>
        </svg>
        <span className="absolute -bottom-1 rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground shadow">
          AI character
        </span>
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {!active ? "Ready" : speaking ? "Speaking…" : "Listening…"}
      </p>
    </div>
  );
}
