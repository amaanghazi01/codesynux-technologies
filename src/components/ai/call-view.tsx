import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Mic, MicOff, PhoneOff, Phone, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLiveVoice, type LiveEvent } from "@/hooks/use-live-voice";
import { supabase } from "@/integrations/supabase/client";
import { AIAvatar } from "./ai-avatar";

export const VOICES = ["marin", "gleam", "meridian", "quartz", "ripple", "vesper", "willow", "stone", "delta", "cinder"] as const;

type Caption = { role: "user" | "assistant"; text: string };

export function CallView({ mode, voice, onVoice, onClose }: {
  mode: "voice" | "video";
  voice: string;
  onVoice: (v: string) => void;
  onClose: () => void;
}) {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const cameraStream = useRef<MediaStream | null>(null);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

  const onEvent = useCallback((event: LiveEvent) => {
    if (event.type !== "app.caption") return;
    const role = event.role === "user" ? "user" : "assistant";
    const text = String(event.text ?? "");
    setCaptions((prev) => {
      const last = prev.at(-1);
      if (last && last.role === role) return [...prev.slice(0, -1), { role, text: last.text + text }];
      return [...prev.slice(-5), { role, text }];
    });
  }, []);
  const call = useLiveVoice({ onEvent });
  const live = call.status === "connecting" || call.status === "connected";

  useEffect(() => setAudioEl(call.audioRef.current), [call.audioRef]);

  const stopCamera = useCallback(() => {
    cameraStream.current?.getTracks().forEach((t) => t.stop());
    cameraStream.current = null;
    if (cameraRef.current) cameraRef.current.srcObject = null;
    setCameraOn(false);
  }, []);
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      cameraStream.current = stream;
      if (cameraRef.current) cameraRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      setCameraError("Camera permission was not granted.");
    }
  }, []);
  useEffect(() => () => stopCamera(), [stopCamera]);

  const begin = async () => {
    setCaptions([]);
    const { data } = await supabase.auth.getSession();
    call.start({ voice, token: data.session?.access_token ?? "" });
    if (mode === "video" && !cameraOn) void startCamera();
  };
  const end = () => {
    call.stop();
    stopCamera();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background text-foreground" role="dialog" aria-label={mode === "video" ? "Face-to-face call" : "Voice call"}>
      <audio ref={call.audioRef} autoPlay className="hidden" />
      <header className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-sm font-semibold">Codesynux AI</p>
          <p className="text-xs text-muted-foreground">
            {call.status === "connecting" ? "Connecting…" : call.status === "connected" ? "Live" : call.status === "stopping" ? "Ending…" : mode === "video" ? "Face to face" : "Voice call"}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { end(); onClose(); }}>Close</Button>
      </header>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-5">
        <AIAvatar audio={audioEl} active={call.status === "connected"} />

        <div className={`absolute right-4 top-2 w-28 overflow-hidden rounded-2xl bg-muted shadow-lg sm:w-44 ${cameraOn ? "" : "hidden"}`}>
          <video ref={cameraRef} autoPlay playsInline muted className="aspect-[3/4] w-full -scale-x-100 object-cover" />
          <span className="absolute bottom-1 left-1 rounded bg-background/80 px-1.5 text-[10px]">You · preview only</span>
        </div>

        <div className="min-h-24 w-full max-w-xl space-y-1 text-center" aria-live="polite">
          {captions.map((c, i) => (
            <p key={i} className={c.role === "user" ? "text-sm text-muted-foreground" : "text-base"}>{c.text}</p>
          ))}
        </div>

        {call.error && <p className="max-w-md text-center text-sm text-destructive">{call.error}</p>}
        {cameraError && <p className="text-center text-sm text-destructive">{cameraError}</p>}
        {call.playbackBlocked && (
          <Button variant="outline" size="sm" onClick={call.resumePlayback}><Volume2 /> Tap to hear the AI</Button>
        )}
        {!live && call.status !== "stopping" && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Voice
            <select className="rounded-full border border-border bg-background px-3 py-1.5 text-foreground capitalize" value={voice} onChange={(e) => onVoice(e.target.value)}>
              {VOICES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
        )}
      </div>

      <footer className="flex items-center justify-center gap-4 pb-10 pt-4">
        <Button variant="secondary" size="icon" className="size-14 rounded-full" aria-label={cameraOn ? "Turn camera off" : "Turn camera on"} onClick={() => (cameraOn ? stopCamera() : startCamera())}>
          {cameraOn ? <Camera /> : <CameraOff />}
        </Button>
        {live ? (
          <>
            <Button variant="secondary" size="icon" className="size-14 rounded-full" aria-label={call.muted ? "Unmute" : "Mute"} onClick={() => call.setMuted(!call.muted)}>
              {call.muted ? <MicOff /> : <Mic />}
            </Button>
            <Button variant="destructive" size="icon" className="size-14 rounded-full" aria-label="End call" onClick={end}><PhoneOff /></Button>
          </>
        ) : (
          <Button size="lg" className="h-14 rounded-full px-8" onClick={begin} disabled={call.status === "stopping"}>
            <Phone /> {call.status === "closed" ? "Call again" : "Start call"}
          </Button>
        )}
      </footer>
      <p className="pb-4 text-center text-[11px] text-muted-foreground">The AI hears your voice; your camera is a private preview the AI cannot see.</p>
    </div>
  );
}
