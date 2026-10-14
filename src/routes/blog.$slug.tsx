import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { PostCard, useAsset } from "@/components/site/Cards";
import { RichText } from "@/components/site/RichText";
import { NotFoundPanel } from "@/components/site/States";
import { authorsQuery, categoriesQuery, postQuery, postsByIdsQuery, tagsQuery } from "@/lib/data/queries";
import { orNotFound } from "@/lib/data/route-helpers";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ context, params }) => orNotFound(context.queryClient.ensureQueryData(postQuery(params.slug))),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.seoTitle ?? loaderData.title} — DXS` },
          { name: "description", content: loaderData.seoDescription ?? loaderData.excerpt },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.excerpt },
          { property: "og:type", content: "article" },
        ]
      : [{ title: "Article unavailable — DXS" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => <NotFoundPanel what="Article" backTo="/blog" backLabel="Back to field notes" />,
  component: Post,
});

function Post() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(postQuery(slug));
  const { data: authors = [] } = useQuery(authorsQuery());
  const { data: cats = [] } = useQuery(categoriesQuery());
  const { data: tags = [] } = useQuery(tagsQuery());
  const { data: related = [] } = useQuery(postsByIdsQuery(post.relatedPostIds));
  const hero = useAsset(post.heroId);
  const author = authors.find((a) => a.id === post.authorId);

  return (
    <article lang={post.locale}>
      <header className="container-page mt-10 max-w-3xl">
        <nav aria-label="Breadcrumb" className="eyebrow"><Link to="/blog">Field notes</Link> / {cats.find((c) => post.categoryIds.includes(c.id))?.name}</nav>
        <h1 className="mt-3 text-4xl leading-tight md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
        <p className="mt-4 text-sm">
          {author && <>By <Link to="/authors/$slug" params={{ slug: author.slug }} className="text-primary">{author.name}</Link> · </>}
          {post.publishedAt && format(new Date(post.publishedAt), "d MMMM yyyy")}
        </p>
      </header>
      {hero && <img src={hero.path} alt={hero.alt} className="container-page mt-8 aspect-[21/9] rounded-md object-cover" />}
      <div className="container-page mt-10 max-w-3xl">
        <RichText doc={post.body} />
        <div className="mt-10 flex flex-wrap gap-2">
          {cats.filter((c) => post.categoryIds.includes(c.id)).map((c) => <Link key={c.id} to="/categories/$slug" params={{ slug: c.slug }}><Badge>{c.name}</Badge></Link>)}
          {tags.filter((t) => post.tagIds.includes(t.id)).map((t) => <Badge key={t.id} variant="outline">#{t.name}</Badge>)}
        </div>
      </div>
      {related.length > 0 && (
        <section className="container-page rule-top mt-16 pt-5">
          <h2 className="mb-6 text-2xl">Related</h2>
          <div className="grid gap-8 md:grid-cols-3">{related.map((p) => <PostCard key={p.id} post={p} />)}</div>
        </section>
      )}
    </article>
  );
}
