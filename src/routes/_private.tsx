import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Library, Settings, UserRound } from "lucide-react";

export const Route = createFileRoute("/_private")({
  component: PrivateLayout,
});

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin", label: "Content admin", icon: Library },
  { to: "/profile", label: "Profile", icon: UserRound },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function PrivateLayout() {
  return (
    <div className="container-page mt-6 grid gap-6 md:grid-cols-[13rem_1fr]">
      <aside className="md:sticky md:top-20 md:h-fit">
        <p className="eyebrow mb-2">Signed in as demo editor</p>
        <nav aria-label="Workspace" className="flex gap-1 overflow-x-auto md:flex-col">
          {items.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted" activeProps={{ className: "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm bg-accent text-accent-foreground font-medium" }}>
              <Icon className="size-4" /> {label}
            </Link>
          ))}
        </nav>
        <p className="mt-4 hidden text-xs text-muted-foreground md:block">Mock mode uses a demo identity. This is not real authentication.</p>
      </aside>
      <div className="min-w-0 pb-10">
        <Outlet />
      </div>
    </div>
  );
}
