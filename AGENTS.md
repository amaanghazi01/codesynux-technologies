<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the public homepage sections as anchor destinations until the company supplies actual product and contact content; this avoids inventing product promises.
- Use Lovable Cloud authentication for account access and keep orders/saves as honest empty states until their data workflows are defined; this avoids fake records.
- AI workspace has one conversation per account with account-scoped AI SDK messages and no thread sidebar; this preserves the explicit single-conversation choice.
- Streaming chat uses AI Elements and server-only Gateway Responses helpers; this keeps message transport compatible and secrets private.
- Live calls use the documented persistent relay and hook, with a Vite adapter and server-entry dispatch; this preserves heartbeat and Stop cleanup.
- Console access is granted only through owner/pro rows in user_roles, checked by security-definer functions in RLS; this keeps paid/owner access server-enforced.
