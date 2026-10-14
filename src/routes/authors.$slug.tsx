import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PostCard, useAsset } from "@/components/site/Cards";
import { EmptyState, NotFoundPanel } from "@/components/site/States";
import { authorQuery } from "@/lib/data/queries";
import { orNotFound } from "@/lib/data/route-helpers";

export const Route = createFileRoute("/authors/$slug")({
  loader: ({ context, params }) => orNotFound(context.queryClient.ensureQueryData(authorQuery(params.slug))),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.author.name} — DXS` },
          { name: "description", content: loaderData.author.bio },
          { property: "og:title", content: loaderData.author.name },
          { property: "og:description", content: loaderData.author.bio },
        ]
      : [{ title: "Author unavailable — DXS" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => <NotFoundPanel what="Author" backTo="/blog" backLabel="Back to field notes" />,
  component: AuthorPage,
});

function AuthorPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(authorQuery(slug));
  const avatar = useAsset(data.author.avatarId);
  return (
    <>
      <header className="container-page rule-top mt-10 flex flex-col gap-6 pt-6 md:flex-row md:items-center">
        {avatar && <img src={avatar.path} alt={avatar.alt} className="size-28 rounded-full object-cover" />}
        <div>
          <p className="eyebrow">Author</p>
          <h1 className="text-4xl">{data.author.name}</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">{data.author.bio}</p>
          <div className="mt-2 flex gap-3 text-sm">{data.author.social.map((s) => <a key={s.url} href={s.url} rel="noopener noreferrer" className="text-primary">{s.label}</a>)}</div>
        </div>
      </header>
      <section className="container-page mt-12">
        {data.posts.length === 0 ? <EmptyState title="No published posts" body="This author has nothing public yet." /> : <div className="grid gap-10 md:grid-cols-3">{data.posts.map((p) => <PostCard key={p.id} post={p} />)}</div>}
      </section>
    </>
  );
}
