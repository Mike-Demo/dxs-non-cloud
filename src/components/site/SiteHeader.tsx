import { Link } from "@tanstack/react-router";
import { Heart, Menu, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart, useWishlist } from "@/lib/stores";

export const NAV_ITEMS = [
  { to: "/blog", label: "Field notes" },
  { to: "/products", label: "Shop" },
  { to: "/events", label: "Events" },
  { to: "/resources", label: "Resources" },
  { to: "/about", label: "About" },
  { to: "/careers", label: "Careers" },
  { to: "/contact", label: "Contact" },
] as const;

const useMounted = (): boolean => {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
};

export const SiteHeader = () => {
  const mounted = useMounted();
  const cartCount = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const wishCount = useWishlist((s) => s.productIds.length);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold">DXS</span>
          <span className="eyebrow hidden sm:inline">Experience showcase</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-5 lg:flex">
          {NAV_ITEMS.map((n) => (
            <Link key={n.to} to={n.to} className="text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "text-sm text-foreground font-medium" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label={`Wishlist${mounted ? `, ${wishCount} items` : ""}`}>
            <Link to="/wishlist" className="relative">
              <Heart className="size-5" />
              {mounted && wishCount > 0 && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{wishCount}</span>}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label={`Cart${mounted ? `, ${cartCount} items` : ""}`}>
            <Link to="/cart" className="relative">
              <ShoppingBag className="size-5" />
              {mounted && cartCount > 0 && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{cartCount}</span>}
            </Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu"><Menu className="size-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="font-display">Menu</SheetTitle>
              <nav aria-label="Mobile" className="mt-6 flex flex-col gap-1">
                {NAV_ITEMS.map((n) => (
                  <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded px-2 py-2 text-lg hover:bg-muted">{n.label}</Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
