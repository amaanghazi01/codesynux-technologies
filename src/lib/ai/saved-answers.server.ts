// Instant, credit-free replies for common short questions about Codesynux.
type Saved = { patterns: RegExp[]; answer: string };

const SAVED: Saved[] = [
  {
    patterns: [/\b(get|buy|upgrade|become|join)\b.*\bpro\b/, /\bpro\b.*\b(price|cost|plan|kaise|kese)\b/, /\bhow much\b.*\b(pro|cost|price)\b/, /\bpricing\b/],
    answer: "**Getting Codesynux Pro**\n\n1. Open **Pricing** from the header.\n2. Pick your region: **₹100** in India, **$5** in the Middle East, **$6** everywhere else. It's a one-time payment.\n3. Choose a payment method and finish checkout.\n\nPro gives you unlimited AI access, the Console with team projects, and API keys. Launch-day offers can reduce the price further.",
  },
  {
    patterns: [/\bwhat is codesynux\b/, /\babout codesynux\b/, /\bwho are you\b/, /\bwhat can you do\b/],
    answer: "I'm **Codesynux AI**. I can help you chat, research, plan and write code across web, mobile, AI, cybersecurity and cloud. You can also use voice, face-to-face calls, Codesynux Studio for live code previews, and the Console to manage projects from research to maintenance.",
  },
  {
    patterns: [/\b(free|daily)\b.*\bpoints?\b/, /\bpoints?\b.*\b(refresh|reset|limit|left)\b/, /\bhow many points\b/],
    answer: "Free accounts get **100 points a day**, and each chat message uses 1. Points reset at **midnight India time** (12:00 AM IST). Pro and owner accounts have unlimited use. Saved answers like this one are free.",
  },
  {
    patterns: [/\b(open|use|access)\b.*\bconsole\b/, /\bwhat is (the )?console\b/, /\bconsole\b.*\b(phase|phases|locked)\b/],
    answer: "**The Console** is for Pro users. Start a project there and move it through six phases:\n\n1. **Research** – goals, users, competitors\n2. **Planning** – features, architecture, timeline\n3. **Coding** – build with Codesynux AI and Studio\n4. **Testing** – fix bugs before launch\n5. **Deployment** – publish and link your live preview\n6. **Maintenance** – track bug fixes, upgrades and new features\n\nAdd teammates by email and share the project link.",
  },
  {
    patterns: [/\bhow (do i|to|can i)\b.*\bdeploy\b/, /\bdeployment\b.*\b(steps|how)\b/],
    answer: "**Deploying your project**\n\n1. Finish testing and fix any open bugs.\n2. Publish on a hosting service (for example Vercel, Netlify or Cloudflare Pages). Static HTML from Studio can be uploaded as-is.\n3. Copy the live **https://** link into your Console project's **Live preview**.\n4. Move the project to the **Deployment** phase, then **Maintenance** to track fixes and upgrades.\n\nAsk me for step-by-step instructions for your hosting provider.",
  },
  {
    patterns: [/\bapi keys?\b/],
    answer: "**API keys** (Pro): open **API keys** from the menu, create a key and copy it right away. It's shown only once. Send requests to `/api/public/v1/chat` with `Authorization: Bearer csx_...`. Each key allows up to 30 requests a minute, and you can revoke keys anytime.",
  },
  {
    patterns: [/\b(code )?studio\b/, /\bcode editor\b/],
    answer: "**Codesynux Studio** is the built-in code editor. Write HTML, CSS and JavaScript and see a live preview side by side at phone, tablet or laptop size. Your work saves in this browser, and you can download it as `index.html`.",
  },
  {
    patterns: [/\b(leaderboard|streak|referral|refer)\b/],
    answer: "**Leaderboard:** check in every day to earn 10 points and build your streak. Share your referral link: you get 100 points and your friend gets 50 when they sign up. The top 10 players are featured with special rewards.",
  },
];

export function findSavedAnswer(text: string): string | null {
  const q = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  if (!q || q.split(' ').length > 12) return null; // detailed requests go to the AI
  return SAVED.find(s => s.patterns.some(p => p.test(q)))?.answer ?? null;
}
