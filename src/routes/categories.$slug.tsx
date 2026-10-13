import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PostCard, ProductCard } from "@/components/site/Cards";
import { NotFoundPanel, PageHeader } from "@/components/site/States";
import { categoryQuery } from "@/lib/data/queries";
import { orNotFound } from "@/lib/data/route-helpers";

export const Route = createFileRoute("/categories/$slug")({
  loader: ({ context, params }) => orNotFound(context.queryClient.ensureQueryData(categoryQuery(params.slug))),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.category.name} — DXS` },
          { name: "description", content: loaderData.category.description },
          { property: "og:title", content: loaderData.category.name },
          { property: "og:description", content: loaderData.category.description },
        ]
      : [{ title: "Category unavailable — DXS" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => <NotFoundPanel what="Category" backTo="/blog" backLabel="Back to field notes" />,
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(categoryQuery(slug));
  return (
    <>
      <PageHeader eyebrow="Category" title={data.category.name} intro={data.category.description} />
      {data.posts.length > 0 && (
        <section className="container-page mt-12"><h2 className="mb-6 text-2xl">Articles</h2><div className="grid gap-10 md:grid-cols-3">{data.posts.map((p) => <PostCard key={p.id} post={p} />)}</div></section>
      )}
      {data.products.length > 0 && (
        <section className="container-page mt-12"><h2 className="mb-6 text-2xl">Products</h2><div className="grid grid-cols-2 gap-6 md:grid-cols-3">{data.products.map((p) => <ProductCard key={p.id} product={p} />)}</div></section>
      )}
      {data.resources.length > 0 && (
        <section className="container-page mt-12"><h2 className="mb-4 text-2xl">Resources</h2>
          <ul className="space-y-2">{data.resources.map((r) => <li key={r.id}><Link to="/resources/$slug" params={{ slug: r.slug }} className="text-primary">{r.title}</Link></li>)}</ul>
        </section>
      )}
      {data.posts.length + data.products.length + data.resources.length === 0 && <p className="container-page mt-12 text-muted-foreground">Nothing in this category yet.</p>}
    </>
  );
}
