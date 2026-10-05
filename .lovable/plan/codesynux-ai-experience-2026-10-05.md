# Codesynux AI Experience

## What you will get
One usable AI workspace reached from both **Artificial Intelligence Experience** and **Build / Develop**, while preserving the rest of your company homepage.

### 1. Chat and account history
- Build a white-first, Codesynux-branded interface inspired by your screenshots: collapsible sidebar, New chat, searchable past chats, account menu and compact composer.
- Each chat is its own continuous conversation, saved privately to the signed-in Codesynux account and restored across devices.
- Stream answers as they arrive, render readable text and code, support copy, Stop, retry of eligible errors, rename and delete chats.
- Add working appearance settings for light/dark/system, background choices and brightness without reducing text readability.

### 2. Research and development assistance
- Support life conversations, planning, software architecture, coding and troubleshooting in the same chat.
- Add internet research only through a verified search capability, with clickable sources and clear uncertainty; never invent citations.
- Present generated code clearly. Distinguish code suggestions from actual execution, deployment or maintenance.
- Require user approval before any connected action changes a project, sends data or incurs external costs. Deployment and maintenance need real project connections; no pretend success buttons.

### 3. Live conversations
- Add compact voice and video-call icons with a dedicated call view, Start/End, mute, captions and clear permission/error states.
- Implement real two-way AI voice, interruption and immediate Stop; add user camera preview with explicit permission and reliable cleanup.
- Verify whether camera frames can reach the AI before describing camera sharing as AI vision.
- Include an explicitly AI-labelled animated talking avatar, not a real person. Synchronize its speaking state with actual audio.
- Verify available voices and offer ten distinct choices if supported; do not fabricate voice names or promise unsupported choices.
- Keep call/background brightness controls separate from device brightness: a website cannot control a phone’s display brightness.

## Quality and boundaries
- Test chat creation, two separate saved histories, reloads, account isolation, failed requests and mobile/desktop layouts.
- Test live audio back-and-forth, interruption, startup cancellation and camera/microphone cleanup. Report anything that cannot be verified.
- Build on existing AI models; this does not train a new foundation model or establish that Codesynux is faster or more accurate than every competitor.
- AI answers can be wrong. Include safe handling of sensitive requests and avoid guaranteed medical, legal or financial advice.
- AI requests and live calls incur usage charges; connected deployment services may have their own costs.

## Technical implementation
- Use dedicated `/ai` and `/ai/$threadId` pages, route-derived chat IDs, AI Elements UI and AI SDK streaming.
- Use Lovable Cloud authentication, user-scoped thread/message tables with explicit grants and row-level access policies; persist complete AI SDK messages and history.
- Use server-only Lovable AI Gateway calls with the assigned `openai/gpt-6-astra` model and documented Responses protocol. Keep prompts, keys and tool execution off the client.
- Use the documented Live integration with client delegation for voice. Discover actual voice and camera capabilities before wiring unsupported features.
- Read required integration references and verify actual calls; stop and explain any service, access or credit blocker rather than substituting a fake experience.