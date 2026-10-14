import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/site/States";
import { resourcesQuery } from "@/lib/data/queries";

const types = ["guide", "whitepaper", "video", "download"] as const;
const searchSchema = z.object({ type: z.enum(types).optional().catch(undefined) });

export const Route = createFileRoute("/resources/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Resources — DXS" },
      { name: "description", content: "Guides, whitepapers, videos and downloads for migration teams." },
      { property: "og:title", content: "Resources — DXS" },
      { property: "og:description", content: "Guides, whitepapers, videos and downloads." },
    ],
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(resourcesQuery(deps.type)),
  component: Resources,
});

function Resources() {
  const { type } = Route.useSearch();
  const navigate = useNavigate({ from: "/resources/" });
  const { data } = useSuspenseQuery(resourcesQuery(type));
  return (
    <>
      <PageHeader eyebrow="Resources" title="Guides, papers and downloads" />
      <div className="container-page mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter by type">
        <Button size="sm" variant={!type ? "default" : "outline"} onClick={() => void navigate({ search: {} })}>All</Button>
        {types.map((t) => <Button key={t} size="sm" variant={type === t ? "default" : "outline"} onClick={() => void navigate({ search: { type: t } })} className="capitalize">{t}</Button>)}
      </div>
      <div className="container-page mt-8">
        {data.length === 0 ? <EmptyState title="No resources" body="Try another type." /> : (
          <ul className="divide-y border-y">
            {data.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-5">
                <div>
                  <Link to="/resources/$slug" params={{ slug: r.slug }} className="font-display text-xl hover:text-primary">{r.title}</Link>
                  <p className="text-sm text-muted-foreground">{r.summary}</p>
                </div>
                <div className="flex gap-2"><Badge variant="outline" className="capitalize">{r.type}</Badge>{r.access === "email-gated" && <Badge variant="secondary">Email required</Badge>}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
