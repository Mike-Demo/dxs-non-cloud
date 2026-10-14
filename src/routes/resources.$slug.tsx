import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAsset } from "@/components/site/Cards";
import { RichText } from "@/components/site/RichText";
import { NotFoundPanel } from "@/components/site/States";
import { resourceQuery } from "@/lib/data/queries";
import { orNotFound } from "@/lib/data/route-helpers";

export const Route = createFileRoute("/resources/$slug")({
  loader: ({ context, params }) => orNotFound(context.queryClient.ensureQueryData(resourceQuery(params.slug))),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — DXS Resources` },
          { name: "description", content: loaderData.summary },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.summary },
        ]
      : [{ title: "Resource unavailable — DXS" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => <NotFoundPanel what="Resource" backTo="/resources" backLabel="Back to resources" />,
  component: ResourcePage,
});

function ResourcePage() {
  const { slug } = Route.useParams();
  const { data: r } = useSuspenseQuery(resourceQuery(slug));
  const media = useAsset(r.mediaId);
  return (
    <article className="container-page mt-10 max-w-3xl">
      <nav aria-label="Breadcrumb" className="eyebrow"><Link to="/resources">Resources</Link> / {r.type}</nav>
      <h1 className="mt-2 text-4xl md:text-5xl">{r.title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{r.summary}</p>
      {media && <img src={media.path} alt={media.alt} className="mt-8 aspect-video w-full rounded-md object-cover" />}
      {r.filePath && (
        <Button asChild className="mt-6"><a href={r.filePath} download><Download className="size-4" /> Download file</a></Button>
      )}
      <div className="mt-10"><RichText doc={r.body} /></div>
    </article>
  );
}
