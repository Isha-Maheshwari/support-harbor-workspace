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

- Data comes from the in-memory mock service in src/lib/mock-api.ts (seeded, simulated latency/failures) accessed via TanStack Query hooks in src/lib/queries.ts; why: no backend credentials, swap the api object for a real backend later.
- App shell (sidebar + mock-service controls) wraps <Outlet /> in __root.tsx; why: one shared layout for every page.
