import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getRepository } from "@/lib/data/client";
import { NAV_ITEMS } from "./SiteHeader";
import { NewsletterForm } from "./NewsletterForm";

export const SiteFooter = () => {
  const qc = useQueryClient();
  const repo = getRepository();
  const reset = async (): Promise<void> => {
    await repo.reset();
    await qc.invalidateQueries();
    toast.success("Data restored to the fixture baseline");
  };
  return (
    <footer className="mt-24 border-t bg-paper">
      <div className="container-page grid gap-10 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl">DXS</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">A content testbed for verifying CMS and SaaS migrations end to end.</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-2 text-sm">
          {NAV_ITEMS.map((n) => <Link key={n.to} to={n.to} className="text-muted-foreground hover:text-foreground">{n.label}</Link>)}
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
          <Link to="/admin" className="text-muted-foreground hover:text-foreground">Admin</Link>
          <Link to="/design-system" className="text-muted-foreground hover:text-foreground">Design system</Link>
        </nav>
        <div>
          <p className="eyebrow mb-3">Newsletter</p>
          <NewsletterForm compact />
        </div>
      </div>
      <div className="container-page flex flex-wrap items-center justify-between gap-3 border-t py-4 text-xs text-muted-foreground">
        <span>Data mode: <strong className="font-mono">{repo.mode}</strong> · edits are saved in this browser</span>
        <Button variant="outline" size="sm" onClick={() => void reset()}>Reset data</Button>
      </div>
      <div className="container-page flex flex-wrap items-center justify-between gap-3 border-t py-4 text-xs text-muted-foreground">
        <span>
          MIT licensed. Built by{" "}
          <a href="https://mikedemo.dev" target="_blank" rel="noreferrer" className="underline hover:text-foreground">
            Mike "Demo" Demopoulos
          </a>
          .
        </span>
        <nav aria-label="Social and license" className="flex flex-wrap gap-4">
          <a href="https://github.com/Mike-Demo" target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a>
          <a href="https://x.com/Mike_Demo" target="_blank" rel="noreferrer" className="hover:text-foreground">X</a>
          <a href="https://facebook.com/mikedemo42" target="_blank" rel="noreferrer" className="hover:text-foreground">Facebook</a>
          <a href="https://bsky.app/profile/mikedemo.bsky.social" target="_blank" rel="noreferrer" className="hover:text-foreground">Bluesky</a>
          <Link to="/licenses" className="hover:text-foreground">License</Link>
        </nav>
      </div>
    </footer>
  );
};
