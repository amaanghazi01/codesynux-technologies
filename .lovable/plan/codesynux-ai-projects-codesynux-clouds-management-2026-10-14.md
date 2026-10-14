# Codesynux AI projects + Codesynux Clouds management

The request covers three connected areas. They will be built in this order, each checked on phone and laptop.

## 1. Codesynux AI page (original page)
- Remove the project-name area from the top of the AI page.
- Show the "Codesynux AI" title at the bottom of the page, next to the motivational line.
- Add a "Create new project" icon. Settings stay exactly as they are.
- Voice call and face-to-face buttons stay in the chat box. The face-to-face view gets a new animated male AI avatar, clearly labelled as AI, with short tips on how to use it.

## 2. Project workspace (opens from "Create new project")
- A full-screen workspace like Lovable. Chat is on the left, using the same chat box as the original page. A live preview is on the right. On phones they become two tabs.
- Top bar:
  - Close (X) button to go back to the original AI page
  - Small project icon and the project name
  - Preview icon, with phone, tablet and laptop sizes
  - Voice and video call icons
  - Deploy button
- The AI suggests a project name from the user's first message. The user can rename it.
- The AI writes the website code (HTML, CSS and JavaScript). The preview updates automatically after each reply.
- Projects are saved to the user's account, so they stay after closing the page.

## 3. Codesynux Clouds
- The Clouds page stays the same down to "A home for your next project". After that comes a new line: "Ready for deployment with Codesynux Clouds".
- The "Start" button becomes "Deploy new project".
- The old content below it is replaced by a management area for each deployed site:
  - Live status
  - Official link
  - Redeploy
  - Take down
  - "Open in project" (goes to the AI project workspace)
  - Deployment history
- One-click deploy from the AI project workspace. Each project gets an automatic web address based on its name.
- Every site is served over a secure connection (HTTPS), with automatic certificates, worldwide delivery from servers near each visitor, and no downtime when you redeploy. Lovable Cloud hosting already provides these. The page will explain them honestly.
- A Clouds settings window, styled like the AI settings, with a Connectors section:
  - GitHub: import a repository's website into a project, and push changes back. This needs the user to connect their GitHub account.
  - Vercel, Netlify and Cloudflare are shown as "Coming soon" until accounts are connected.
- Changes sync automatically: saving in the AI project updates the project, the live site (when auto-deploy is on) and GitHub (when connected).

## Honest limits
- Sites live at addresses like `codesynux.../s/my-site`. Addresses like `my-site.codesynux.com` need your own domain connected first.
- This hosts one-page websites only. Software and apps that need their own server would need a hosting company.
- AI replies and project code still use workspace credits, which are currently empty. Add credits before testing the AI.

## Technical details
- New `ai_projects` table (owner, name, html, messages, site_id, github repo, auto_deploy) with row-level security that limits each user to their own rows.
- New route `/ai/project/$id`. Code mode returns a fenced html block, which is parsed into the preview iframe (sandboxed srcdoc).
- Deploy reuses the `hosted_sites` table. Slugs come from the project name.
- GitHub uses the per-user App User Connector with the `repo` scope. Read and write go through the Contents API.
- Clouds management reuses DeployPanel data in a new management view.
