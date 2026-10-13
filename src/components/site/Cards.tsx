import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BlogPost, Event } from "@/lib/data/models";
import type { ProductWithVariants } from "@/lib/data/repository";
import { mediaQuery } from "@/lib/data/queries";
import { formatMoney } from "@/lib/data/pricing";
import { useWishlist } from "@/lib/stores";

export const useAsset = (id: string | null) => {
  const { data = [] } = useQuery(mediaQuery());
  return id ? data.find((m) => m.id === id) : undefined;
};

export const PostCard = ({ post }: { post: BlogPost }) => {
  const hero = useAsset(post.heroId);
  return (
    <article className="group flex flex-col">
      {hero ? (
        <img src={hero.path} alt={hero.alt} loading="lazy" width={hero.width ?? undefined} height={hero.height ?? undefined} className="aspect-[16/10] w-full rounded-md object-cover" />
      ) : (
        <div className="flex aspect-[16/10] w-full items-end rounded-md bg-accent p-4"><span className="eyebrow">No hero image</span></div>
      )}
      <p className="eyebrow mt-4">{post.publishedAt ? format(new Date(post.publishedAt), "d MMM yyyy") : "Unpublished"} · {post.locale}</p>
      <h3 className="mt-1 text-xl leading-snug">
        <Link to="/blog/$slug" params={{ slug: post.slug }} className="group-hover:text-primary">{post.title}</Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
    </article>
  );
};

export const ProductCard = ({ product }: { product: ProductWithVariants }) => {
  const img = useAsset(product.galleryIds[0] ?? null);
  const saved = useWishlist((s) => s.productIds.includes(product.id));
  const toggle = useWishlist((s) => s.toggle);
  return (
    <article className="group relative flex flex-col">
      {img && <img src={img.path} alt={img.alt} loading="lazy" className="aspect-square w-full rounded-md bg-paper object-cover" />}
      <Button variant="secondary" size="icon" className="absolute right-2 top-2" aria-pressed={saved} aria-label={saved ? "Remove from wishlist" : "Save to wishlist"} onClick={() => toggle(product.id)}>
        <Heart className={saved ? "size-4 fill-primary text-primary" : "size-4"} />
      </Button>
      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="text-lg"><Link to="/products/$slug" params={{ slug: product.slug }} className="group-hover:text-primary">{product.name}</Link></h3>
        <span className="text-sm">{formatMoney(product.fromPriceMinor)}</span>
      </div>
      {!product.inStock && <Badge variant="outline" className="mt-1 w-fit">Out of stock</Badge>}
    </article>
  );
};

export const EventCard = ({ event }: { event: Event }) => (
  <article className="flex gap-4 border-t py-5">
    <div className="w-16 shrink-0 text-center">
      <p className="eyebrow">{format(new Date(event.startAt), "MMM")}</p>
      <p className="font-display text-3xl">{format(new Date(event.startAt), "d")}</p>
    </div>
    <div>
      <h3 className="text-xl"><Link to="/events/$slug" params={{ slug: event.slug }} className="hover:text-primary">{event.title}</Link></h3>
      <p className="text-sm text-muted-foreground">{event.venue ?? "Online"} · {format(new Date(event.startAt), "yyyy, HH:mm")} UTC</p>
    </div>
  </article>
);
