import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Heart, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductCard } from "@/components/site/Cards";
import { RichText } from "@/components/site/RichText";
import { NotFoundPanel } from "@/components/site/States";
import { mediaQuery, productQuery, productsByIdsQuery } from "@/lib/data/queries";
import { formatMoney } from "@/lib/data/pricing";
import { orNotFound } from "@/lib/data/route-helpers";
import { useCart, useWishlist } from "@/lib/stores";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ context, params }) => orNotFound(context.queryClient.ensureQueryData(productQuery(params.slug))),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — DXS Shop` },
          { name: "description", content: `${loaderData.product.name} from ${formatMoney(loaderData.product.fromPriceMinor)}.` },
          { property: "og:title", content: loaderData.product.name },
          { property: "og:description", content: `From ${formatMoney(loaderData.product.fromPriceMinor)}` },
        ]
      : [{ title: "Product unavailable — DXS" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => <NotFoundPanel what="Product" backTo="/products" backLabel="Back to the shop" />,
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const { product, reviews } = data;
  const { data: media = [] } = useQuery(mediaQuery());
  const { data: related = [] } = useQuery(productsByIdsQuery(product.relatedProductIds));
  const [variantId, setVariantId] = useState(product.variants.find((v) => v.stock > 0)?.id ?? product.variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const add = useCart((s) => s.add);
  const inCart = useCart((s) => s.lines.find((l) => l.variantId === variantId)?.quantity ?? 0);
  const saved = useWishlist((s) => s.productIds.includes(product.id));
  const toggle = useWishlist((s) => s.toggle);
  const variant = product.variants.find((v) => v.id === variantId);
  const gallery = product.galleryIds.map((id) => media.find((m) => m.id === id)).filter((m) => m !== undefined);
  const available = variant ? variant.stock - inCart : 0;
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

  const onAdd = (): void => {
    if (!variant || qty < 1 || qty > available) {
      toast.error(available <= 0 ? "This option is out of stock" : `Only ${available} available`);
      return;
    }
    add(variant.id, qty);
    toast.success(`Added ${qty} × ${product.name} to cart`);
  };

  return (
    <>
      <div className="container-page mt-10 grid gap-10 md:grid-cols-2">
        <div>
          {gallery[imgIdx] && <img src={gallery[imgIdx].path} alt={gallery[imgIdx].alt} className="aspect-square w-full rounded-md object-cover" />}
          <div className="mt-3 flex gap-2">
            {gallery.map((g, i) => (
              <button key={g.id} onClick={() => setImgIdx(i)} aria-label={`Show image ${i + 1}`} aria-pressed={i === imgIdx} className={i === imgIdx ? "rounded ring-2 ring-primary" : "rounded opacity-70"}>
                <img src={g.path} alt="" className="size-16 rounded object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow">{product.availability}</p>
          <h1 className="mt-2 text-4xl">{product.name}</h1>
          {avg !== null && <p className="mt-2 flex items-center gap-1 text-sm"><Star className="size-4 fill-primary text-primary" /> {avg.toFixed(1)} · {reviews.length} reviews</p>}
          <p className="mt-4 font-display text-3xl">{variant ? formatMoney(variant.priceMinor) : "—"}</p>
          <fieldset className="mt-6">
            <legend className="eyebrow mb-2">Option</legend>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <Button key={v.id} type="button" variant={v.id === variantId ? "default" : "outline"} onClick={() => { setVariantId(v.id); setQty(1); }} aria-pressed={v.id === variantId}>
                  {Object.values(v.options).join(" / ")} {v.stock === 0 && "(sold out)"}
                </Button>
              ))}
            </div>
          </fieldset>
          <p className="mt-3 text-sm text-muted-foreground">{variant?.sku} · {variant && variant.stock > 0 ? `${variant.stock} in stock` : "Out of stock"}</p>
          <div className="mt-6 flex items-end gap-3">
            <div>
              <Label htmlFor="qty">Quantity</Label>
              <Input id="qty" type="number" min={1} max={99} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="mt-1 w-24" />
            </div>
            <Button size="lg" onClick={onAdd} disabled={!variant || variant.stock === 0}>Add to cart</Button>
            <Button size="lg" variant="outline" aria-pressed={saved} onClick={() => toggle(product.id)} aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}>
              <Heart className={saved ? "fill-primary text-primary" : ""} />
            </Button>
          </div>
          <div className="mt-8"><RichText doc={product.description} /></div>
        </div>
      </div>
      <section className="container-page rule-top mt-16 pt-5">
        <h2 className="text-2xl">Reviews</h2>
        {reviews.length === 0 ? <p className="mt-3 text-muted-foreground">No reviews yet.</p> : (
          <ul className="mt-4 grid gap-6 md:grid-cols-2">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-md border bg-card p-4">
                <p className="text-sm text-primary" aria-label={`${r.rating} out of 5`}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                <p className="mt-1 font-display text-lg">{r.title}</p>
                <p className="text-sm text-muted-foreground">{r.body} — {r.reviewerName}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      {related.length > 0 && (
        <section className="container-page mt-16"><h2 className="mb-6 text-2xl">You may also like</h2><div className="grid grid-cols-2 gap-6 md:grid-cols-3">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div></section>
      )}
    </>
  );
}
