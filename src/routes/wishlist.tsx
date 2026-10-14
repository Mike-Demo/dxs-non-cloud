import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/Cards";
import { EmptyState, PageHeader } from "@/components/site/States";
import { productsByIdsQuery } from "@/lib/data/queries";
import { useCart, useWishlist } from "@/lib/stores";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — DXS" },
      { name: "description", content: "Products you saved for later, kept in this browser." },
      { property: "og:title", content: "Wishlist — DXS" },
      { property: "og:description", content: "Saved products." },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const ids = useWishlist((s) => s.productIds);
  const remove = useWishlist((s) => s.remove);
  const add = useCart((s) => s.add);
  const { data = [], isLoading } = useQuery(productsByIdsQuery(ids));

  return (
    <>
      <PageHeader eyebrow="Wishlist" title="Saved for later" />
      <div className="container-page mt-8">
        {!isLoading && data.length === 0 ? (
          <EmptyState title="Nothing saved yet" body="Tap the heart on any product to keep it here." />
        ) : (
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
            {data.map((p) => {
              const v = p.variants.find((x) => x.stock > 0);
              return (
                <div key={p.id}>
                  <ProductCard product={p} />
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" disabled={!v} onClick={() => { if (v) { add(v.id, 1); toast.success(`${p.name} added to cart`); } }}>{v ? "Add to cart" : "Sold out"}</Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>Remove</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
