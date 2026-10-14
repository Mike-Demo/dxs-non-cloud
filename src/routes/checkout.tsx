import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/site/FormField";
import { EmptyState, PageHeader } from "@/components/site/States";
import { checkoutSchema, type CheckoutInput } from "@/lib/data/schemas";
import { useCheckoutMutation } from "@/lib/data/mutations";
import type { Order } from "@/lib/data/models";
import { formatMoney } from "@/lib/data/pricing";
import { useCart } from "@/lib/stores";
import { TotalsTable, useCartView } from "@/components/site/CartSummary";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — DXS" },
      { name: "description", content: "Simulated checkout: no payment details are collected." },
      { property: "og:title", content: "Checkout — DXS" },
      { property: "og:description", content: "Simulated checkout." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { lines, rows, totals } = useCartView();
  const clear = useCart((s) => s.clear);
  const m = useCheckoutMutation();
  const [order, setOrder] = useState<Order | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { name: "", email: "", line1: "", city: "", postalCode: "", country: "" },
  });

  const onSubmit = handleSubmit(async (input) => {
    try {
      const r = await m.mutateAsync({ lines, input });
      if (r.ok) {
        setOrder(r.order);
        clear();
        return;
      }
      const name = rows.find((x) => x.variantId === r.variantId)?.variant.productName ?? "an item";
      toast.error(r.reason === "insufficient_stock" ? `Not enough stock for ${name}. Update your cart.` : "Your cart has an item that is no longer available.");
    } catch {
      toast.error("Checkout failed. Please check the form and try again.");
    }
  });

  if (order) {
    return (
      <div className="container-page max-w-xl py-16">
        <p className="eyebrow">Order {order.id}</p>
        <h1 className="mt-2 text-4xl">Thank you, {order.name}</h1>
        <p className="mt-3 text-muted-foreground">This was a simulated order — nothing was charged. A summary is below.</p>
        <ul className="mt-6 divide-y border-y text-sm">{order.items.map((i) => <li key={i.variantId} className="flex justify-between py-2"><span>{i.quantity} × {i.productName}</span><span>{formatMoney(i.unitPriceMinor * i.quantity)}</span></li>)}</ul>
        <p className="mt-4 text-right font-display text-xl">Total {formatMoney(order.totalMinor)}</p>
        <Button asChild className="mt-6"><Link to="/products">Continue shopping</Link></Button>
      </div>
    );
  }

  if (rows.length === 0) return <div className="container-page py-16"><EmptyState title="Nothing to check out" body="Your cart is empty." /></div>;

  return (
    <>
      <PageHeader eyebrow="Checkout" title="Shipping details" intro="Payment is simulated. Do not enter card details anywhere." />
      <div className="container-page mt-8 grid gap-10 md:grid-cols-[1fr_20rem]">
        <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
          <FormField id="name" label="Full name" error={errors.name?.message} {...register("name")} />
          <FormField id="email" label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <FormField id="line1" label="Street address" className="sm:col-span-2" error={errors.line1?.message} {...register("line1")} />
          <FormField id="city" label="City" error={errors.city?.message} {...register("city")} />
          <FormField id="postalCode" label="Postal code" error={errors.postalCode?.message} {...register("postalCode")} />
          <FormField id="country" label="Country" error={errors.country?.message} {...register("country")} />
          <div className="sm:col-span-2"><Button type="submit" size="lg" disabled={m.isPending}>{m.isPending ? "Placing order…" : `Place simulated order · ${formatMoney(totals.totalMinor)}`}</Button></div>
        </form>
        <aside className="h-fit rounded-md border bg-card p-5">
          <ul className="mb-4 space-y-1 text-sm">{rows.map((r) => <li key={r.variantId} className="flex justify-between"><span>{r.quantity} × {r.variant.productName}</span><span>{formatMoney(r.variant.priceMinor * r.quantity)}</span></li>)}</ul>
          <TotalsTable totals={totals} />
        </aside>
      </div>
    </>
  );
}
