import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const PageHeader = ({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) => (
  <header className="container-page rule-top mt-10 pt-6">
    <p className="eyebrow">{eyebrow}</p>
    <h1 className="mt-2 max-w-3xl text-4xl leading-tight md:text-5xl">{title}</h1>
    {intro && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{intro}</p>}
  </header>
);

export const NotFoundPanel = ({ what, backTo, backLabel }: { what: string; backTo: string; backLabel: string }) => (
  <div className="container-page py-24 text-center">
    <p className="eyebrow">404</p>
    <h1 className="mt-2 text-4xl">{what} not found</h1>
    <p className="mt-3 text-muted-foreground">It may be unpublished, scheduled, or the link is wrong.</p>
    <Button asChild className="mt-6"><a href={backTo}>{backLabel}</a></Button>
  </div>
);

export const EmptyState = ({ title, body }: { title: string; body: string }) => (
  <div className="rounded-md border border-dashed p-10 text-center">
    <p className="font-display text-xl">{title}</p>
    <p className="mt-1 text-sm text-muted-foreground">{body}</p>
  </div>
);

export const PageSkeleton = () => (
  <div className="container-page space-y-4 py-16" aria-busy="true" aria-label="Loading">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-10 w-2/3" />
    <Skeleton className="h-64 w-full" />
  </div>
);

export const HomeLink = () => <Link to="/" className="underline">Home</Link>;
