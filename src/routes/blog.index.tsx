import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/site/Cards";
import { EmptyState, PageHeader } from "@/components/site/States";
import { categoriesQuery, postsQuery, tagsQuery } from "@/lib/data/queries";

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  tag: z.string().optional().catch(undefined),
  page: z.number().int().min(1).optional().catch(undefined),
});

export const Route = createFileRoute("/blog/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Field notes — DXS" },
      { name: "description", content: "Searchable articles on content modeling, rich text and CMS migration verification." },
      { property: "og:title", content: "Field notes — DXS" },
      { property: "og:description", content: "Articles on CMS migration verification." },
    ],
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(postsQuery({ search: deps.q, category: deps.category, tag: deps.tag, page: deps.page })),
  component: Blog,
});

function Blog() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/blog/" });
  const { data } = useSuspenseQuery(postsQuery({ search: s.q, category: s.category, tag: s.tag, page: s.page }));
  const { data: cats = [] } = useQuery(categoriesQuery());
  const { data: tags = [] } = useQuery(tagsQuery());
  const set = (patch: Partial<typeof s>) => void navigate({ search: { ...s, page: undefined, ...patch } });

  return (
    <>
      <PageHeader eyebrow="Field notes" title="Notes from real migrations" intro={`${data.total} published articles. Drafts, scheduled and archived entries stay hidden.`} />
      <div className="container-page mt-8 flex flex-col gap-3 md:flex-row">
        <Input aria-label="Search articles" placeholder="Search articles…" defaultValue={s.q ?? ""} onChange={(e) => set({ q: e.target.value || undefined })} className="md:max-w-xs" />
        <select aria-label="Category" className="h-9 rounded-md border bg-card px-3 text-sm" value={s.category ?? ""} onChange={(e) => set({ category: e.target.value || undefined })}>
          <option value="">All categories</option>
          {cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select aria-label="Tag" className="h-9 rounded-md border bg-card px-3 text-sm" value={s.tag ?? ""} onChange={(e) => set({ tag: e.target.value || undefined })}>
          <option value="">All tags</option>
          {tags.map((t) => <option key={t.id} value={t.slug}>{t.name}</option>)}
        </select>
      </div>
      <div className="container-page mt-10">
        {data.items.length === 0 ? (
          <EmptyState title="No articles match" body="Try a different search or clear the filters." />
        ) : (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">{data.items.map((p) => <PostCard key={p.id} post={p} />)}</div>
        )}
        <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-3">
          <Button variant="outline" disabled={data.page <= 1} onClick={() => void navigate({ search: { ...s, page: data.page - 1 } })}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {data.page} of {data.pageCount}</span>
          <Button variant="outline" disabled={data.page >= data.pageCount} onClick={() => void navigate({ search: { ...s, page: data.page + 1 } })}>Next</Button>
        </nav>
      </div>
    </>
  );
}
