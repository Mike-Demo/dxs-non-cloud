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

## Architecture rules
- UI reads/writes data only through `src/lib/data/queries.ts` / `mutations.ts`, which call the `Repository` interface from `src/lib/data/client.ts`; never import fixtures or a DB client in UI — keeps mock and connected adapters swappable.
- Publication visibility uses `src/lib/data/publication.ts` in every adapter — one public predicate.
- Router uses `defaultSsr: false` because mock-mode data lives in browser storage; revisit when connected mode lands.
- Cart/wishlist are Zustand persisted stores with `skipHydration`, rehydrated in the root component — avoids hydration mismatches.
- Fixtures use the fixed `FIXTURE_REFERENCE_TIME`; tests pass an explicit clock to the mock adapter.
