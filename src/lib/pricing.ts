// Set this to the official launch moment (ISO string) to activate the live launch offers.
export const LAUNCH_AT: string | null = null;

export type Region = "india" | "middle-east" | "international";
export const regions: Record<Region, { label: string; amount: number; currency: "INR" | "USD" }> = {
  india: { label: "India", amount: 100, currency: "INR" },
  "middle-east": { label: "Middle East", amount: 5, currency: "USD" },
  international: { label: "USA & all other countries", amount: 6, currency: "USD" },
};

const middleEastZones = ["Dubai", "Riyadh", "Qatar", "Kuwait", "Bahrain", "Muscat", "Baghdad", "Tehran", "Amman", "Beirut", "Jerusalem", "Damascus", "Aden", "Gaza", "Hebron"];
export function detectRegion(): Region {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  if (zone === "Asia/Kolkata" || zone === "Asia/Calcutta") return "india";
  if (middleEastZones.some(z => zone.endsWith(z))) return "middle-east";
  return "international";
}

export function formatPrice(amount: number, currency: "INR" | "USD") {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", { style: "currency", currency, maximumFractionDigits: amount % 1 ? 2 : 0 }).format(amount);
}

const H = 3_600_000;
export type Phase = { label: string; discount: number; start: number; end: number };
export function launchSchedule(launch: Date): Phase[] {
  const t = launch.getTime();
  const nextDay = new Date(launch); nextDay.setHours(24, 0, 0, 0);
  const d1 = nextDay.getTime(), d2 = d1 + 24 * H, d3 = d2 + 24 * H;
  return [
    { label: "First 3 hours — free forever + Founding Member badge", discount: 100, start: t, end: t + 3 * H },
    { label: "Next 2 hours", discount: 95, start: t + 3 * H, end: t + 5 * H },
    { label: "Next 1 hour", discount: 90, start: t + 5 * H, end: t + 6 * H },
    { label: "Rest of launch day", discount: 80, start: t + 6 * H, end: Math.max(d1, t + 6 * H) },
    { label: "Day 2", discount: 20, start: d1, end: d2 },
    { label: "Day 3", discount: 10, start: d2, end: d3 },
    { label: "After that — standard price", discount: 0, start: d3, end: Infinity },
  ];
}
export const scheduleOutline = [
  ["First 3 hours", 100, "Free forever + Founding Member badge"],
  ["Next 2 hours", 95, ""], ["Next 1 hour", 90, ""], ["Rest of launch day", 80, ""],
  ["Day 2", 20, ""], ["Day 3", 10, ""], ["After that", 0, "Standard price"],
] as const;

export function currentPhase(now = Date.now()): Phase | null {
  if (!LAUNCH_AT) return null;
  return launchSchedule(new Date(LAUNCH_AT)).find(p => now >= p.start && now < p.end) ?? null;
}
