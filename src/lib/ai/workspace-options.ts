import { iso6393 } from "iso-639-3";
import type { FileUIPart, UIMessage } from "ai";

export const MAX_ATTACHMENTS = 10;
export const MAX_ATTACHMENT_BYTES = 1024 * 1024;
export type WorkspaceMode = "code" | "chat" | "plan";
export const languages = [
  { code: "auto", name: "Automatic · follow my message" },
  { code: "hinglish", name: "Hinglish · Hindi in English letters" },
  ...iso6393
    .filter((l) => l.type === "living")
    .map((l) => ({ code: l.iso6391 || l.iso6393, name: l.name }))
    .sort((a, b) => a.name.localeCompare(b.name)),
];
export const visitQuotes = [
  "Your next great idea starts here.",
  "Small beginnings. Extraordinary possibilities.",
  "Give your imagination a place to grow.",
  "Let’s turn your curiosity into something real.",
  "A fresh thought can change everything.",
  "Dream freely. Create thoughtfully.",
  "Your ambition belongs here.",
  "Make room for your next breakthrough.",
  "Every meaningful creation starts with you.",
  "Together, let’s make progress matter.",
];
export const composerQuotes = [
  "What would you love to create?",
  "Bring your next idea to life…",
  "Let’s explore what’s possible…",
  "Share a thought. Start something great…",
  "What’s your next bold idea?",
  "Imagine it. Let’s shape it…",
  "Tell me where you want to go…",
  "A question today. A possibility tomorrow…",
  "Let’s make your next step count…",
  "Your ideas have a home here…",
];
export function validateAttachments(files: FileUIPart[]) {
  if (files.length > MAX_ATTACHMENTS) throw new Error("Attach up to 10 files per message.");
  for (const file of files) {
    const supported =
      /^image\/(png|jpeg|webp|gif)$/.test(file.mediaType) ||
      file.mediaType.startsWith("text/") ||
      ["application/json", "application/javascript"].includes(file.mediaType);
    if (!supported) throw new Error("Use PNG, JPEG, WebP, GIF, text or code files.");
    const prefix = `data:${file.mediaType};base64,`;
    if (!file.url.startsWith(prefix)) throw new Error("Attach files directly from your device.");
    const content = file.url.slice(prefix.length);
    if (!content || !/^[A-Za-z0-9+/]*={0,2}$/.test(content))
      throw new Error("This file is empty or invalid.");
    if (Math.floor((content.length * 3) / 4) > MAX_ATTACHMENT_BYTES)
      throw new Error("Each file must be 1 MB or smaller.");
  }
}
export function modelReadyMessages(messages: UIMessage[]): UIMessage[] {
  return messages.map((message) => ({
    ...message,
    parts: message.parts.map((part) => {
      if (part.type !== "file" || part.mediaType.startsWith("image/")) return part;
      const base64 = part.url.split(",")[1] ?? "";
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      return {
        type: "text" as const,
        text: `Attached file: ${part.filename ?? "document"}\n<untrusted-file>\n${new TextDecoder().decode(bytes)}\n</untrusted-file>`,
      };
    }),
  }));
}
