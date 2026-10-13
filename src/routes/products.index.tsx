import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/site/Cards";
import { EmptyState, PageHeader } from "@/components/site/States";
import { categoriesQuery, productsQuery } from "@/lib/data/queries";

const sorts = ["newest", "price-asc", "price-desc", "name"] as const;
const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  max: z.number().int().positive().optional().catch(undefined),
  sort: z.enum(sorts).optional().catch(undefined),
});

export const Route = createFileRoute("/products/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop — DXS" },
      { name: "description", content: "Desk objects with variants, stock levels and reviews — the commerce fixtures of the DXS testbed." },
      { property: "og:title", content: "Shop — DXS" },
      { property: "og:description", content: "Products with variants, stock and reviews." },
    ],
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(productsQuery({ search: deps.q, category: deps.category, maxPriceMinor: deps.max, sort: deps.sort })),
  component: Products,
});

function Products() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/products/" });
  const { data } = useSuspenseQuery(productsQuery({ search: s.q, category: s.category, maxPriceMinor: s.max, sort: s.sort }));
  const { data: cats = [] } = useQuery(categoriesQuery());
  const set = (patch: Partial<typeof s>) => void navigate({ search: { ...s, ...patch } });
  const commerceCats = cats.filter((c) => c.id === "cat-commerce" || c.parentId === "cat-commerce");

  return (
    <>
      <PageHeader eyebrow="Shop" title="Objects for the editorial desk" intro="Prices in USD. Checkout is simulated — no payment is collected." />
      <div className="container-page mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input aria-label="Search products" placeholder="Search…" defaultValue={s.q ?? ""} onChange={(e) => set({ q: e.target.value || undefined })} />
        <select aria-label="Category" className="h-9 rounded-md border bg-card px-3 text-sm" value={s.category ?? ""} onChange={(e) => set({ category: e.target.value || undefined })}>
          <option value="">All categories</option>
          {commerceCats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select aria-label="Maximum price" className="h-9 rounded-md border bg-card px-3 text-sm" value={s.max ?? ""} onChange={(e) => set({ max: e.target.value ? Number(e.target.value) : undefined })}>
          <option value="">Any price</option>
          <option value="2500">Under $25</option>
          <option value="5000">Under $50</option>
          <option value="10000">Under $100</option>
        </select>
        <select aria-label="Sort" className="h-9 rounded-md border bg-card px-3 text-sm" value={s.sort ?? "newest"} onChange={(e) => set({ sort: e.target.value as (typeof sorts)[number] })}>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name">Name</option>
        </select>
      </div>
      <div className="container-page mt-10">
        {data.length === 0 ? <EmptyState title="No products match" body="Try widening the filters." /> : <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">{data.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      </div>
    </>
  );
}
