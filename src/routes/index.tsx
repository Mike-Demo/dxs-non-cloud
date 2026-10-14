import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { EventCard, PostCard, ProductCard, useAsset } from "@/components/site/Cards";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import type { ContentBlock } from "@/lib/data/models";
import { pageQuery, postsByIdsQuery, productsByIdsQuery, eventsQuery, testimonialsQuery } from "@/lib/data/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DXS — A content testbed for CMS migrations" },
      { name: "description", content: "Deterministic posts, products, events and rich text to verify Contentful, Sanity, WordPress and Hygraph migrations." },
      { property: "og:title", content: "DXS — A content testbed for CMS migrations" },
      { property: "og:description", content: "Deterministic content to verify CMS migrations end to end." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(pageQuery("home")),
  component: Home,
});

const Hero = ({ b }: { b: Extract<ContentBlock, { type: "hero" }> }) => {
  const img = useAsset(b.mediaId);
  return (
    <section className="container-page grid items-end gap-8 pt-10 md:grid-cols-[1.1fr_1fr] md:pt-16">
      <div>
        <p className="eyebrow">Digital Experience Showcase · Issue 01</p>
        <h1 className="mt-3 text-5xl leading-[1.05] md:text-7xl">{b.heading}</h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">{b.subheading}</p>
        <Button asChild size="lg" className="mt-8"><a href={b.ctaHref}>{b.ctaLabel}</a></Button>
      </div>
      {img && <img src={img.path} alt={img.alt} width={img.width ?? undefined} height={img.height ?? undefined} className="aspect-[4/3] w-full rounded-md object-cover" />}
    </section>
  );
};

const RefList = ({ b }: { b: Extract<ContentBlock, { type: "referenceList" }> }) => {
  const posts = useQuery({ ...postsByIdsQuery(b.refIds), enabled: b.refType === "post" });
  const products = useQuery({ ...productsByIdsQuery(b.refIds), enabled: b.refType === "product" });
  const events = useQuery({ ...eventsQuery("upcoming"), enabled: b.refType === "event" });
  const href = b.refType === "post" ? "/blog" : b.refType === "product" ? "/products" : "/events";
  return (
    <section className="container-page rule-top mt-20 pt-5">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="text-3xl">{b.heading}</h2>
        <a href={href} className="text-sm text-primary">View all →</a>
      </div>
      {b.refType === "post" && <div className="grid gap-8 md:grid-cols-3">{posts.data?.map((p) => <PostCard key={p.id} post={p} />)}</div>}
      {b.refType === "product" && <div className="grid grid-cols-2 gap-6 md:grid-cols-3">{products.data?.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      {b.refType === "event" && <div>{events.data?.filter((e) => b.refIds.includes(e.id)).map((e) => <EventCard key={e.id} event={e} />)}</div>}
    </section>
  );
};

const Testimonials = ({ b }: { b: Extract<ContentBlock, { type: "testimonials" }> }) => {
  const { data = [] } = useQuery(testimonialsQuery(b.testimonialIds));
  return (
    <section className="mt-20 bg-ink py-16 text-paper">
      <div className="container-page">
        <p className="eyebrow text-paper/70">{b.heading}</p>
        <div className="mt-6 grid gap-10 md:grid-cols-2">
          {data.map((t) => (
            <figure key={t.id}>
              <blockquote className="font-display text-2xl leading-snug">“{t.quote}”</blockquote>
              <figcaption className="mt-3 text-sm text-paper/70">{t.attribution}, {t.company}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

const Block = ({ b }: { b: ContentBlock }) => {
  switch (b.type) {
    case "hero":
      return <Hero b={b} />;
    case "stats":
      return (
        <section className="container-page mt-16 grid grid-cols-3 gap-4 border-y py-6">
          {b.items.map((s) => (
            <div key={s.label}><p className="font-display text-4xl text-primary">{s.value}</p><p className="eyebrow mt-1">{s.label}</p></div>
          ))}
        </section>
      );
    case "referenceList":
      return <RefList b={b} />;
    case "testimonials":
      return <Testimonials b={b} />;
    case "newsletter":
      return (
        <section className="container-page mt-20 grid gap-6 md:grid-cols-2">
          <h2 className="text-4xl">{b.heading}</h2>
          <NewsletterForm />
        </section>
      );
    case "cta":
      return (
        <section className="container-page mt-20">
          <h2 className="text-3xl">{b.heading}</h2>
          <p className="mt-2 text-muted-foreground">{b.body}</p>
          <Link to="/contact" className="mt-4 inline-block text-primary">{b.ctaLabel}</Link>
        </section>
      );
    case "featureGrid":
      return (
        <section className="container-page mt-20 grid gap-6 md:grid-cols-3">
          {b.items.map((i) => <div key={i.title}><h3 className="text-xl">{i.title}</h3><p className="text-sm text-muted-foreground">{i.body}</p></div>)}
        </section>
      );
  }
};

function Home() {
  const { data: page } = useSuspenseQuery(pageQuery("home"));
  return <>{page.blocks.map((b) => <Block key={b.id} b={b} />)}</>;
}
