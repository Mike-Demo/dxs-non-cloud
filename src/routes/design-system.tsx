import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FormField } from "@/components/site/FormField";
import { PageHeader } from "@/components/site/States";

export const Route = createFileRoute("/design-system")({
  head: () => ({
    meta: [
      { title: "Design system — DXS" },
      { name: "description", content: "Interactive catalog of DXS typography, colors, controls, states and overlays." },
      { property: "og:title", content: "Design system — DXS" },
      { property: "og:description", content: "Interactive UI catalog." },
    ],
  }),
  component: DesignSystem,
});

const swatches = ["background", "foreground", "paper", "ink", "primary", "secondary", "muted", "accent", "destructive", "success", "warning", "border"] as const;
const swatchClass: Record<(typeof swatches)[number], string> = {
  background: "bg-background", foreground: "bg-foreground", paper: "bg-paper", ink: "bg-ink", primary: "bg-primary", secondary: "bg-secondary",
  muted: "bg-muted", accent: "bg-accent", destructive: "bg-destructive", success: "bg-success", warning: "bg-warning", border: "bg-border",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="container-page rule-top mt-14 pt-5"><h2 className="mb-6 text-2xl">{title}</h2>{children}</section>
);

function DesignSystem() {
  const [sw, setSw] = useState(true);
  return (
    <>
      <PageHeader eyebrow="Design system" title="Paper, ink and vermilion" intro="Every primitive used on the site, in its states. Change the theme in Settings to view dark mode." />
      <Section title="Typography">
        <div className="space-y-3">
          <p className="font-display text-6xl">Display 6xl</p>
          <h1 className="text-5xl">Heading one</h1><h2 className="text-3xl">Heading two</h2><h3 className="text-xl">Heading three</h3>
          <p className="max-w-prose">Body text uses the system sans stack so the site renders identically offline. Unicode check: Ελληνικά · 日本語 · العربية · emoji ✅</p>
          <p className="eyebrow">Eyebrow label</p><code className="font-mono text-sm">monospace code</code>
        </div>
      </Section>
      <Section title="Colour tokens">
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">{swatches.map((s) => <li key={s}><div className={`h-16 rounded-md border ${swatchClass[s]}`} /><p className="mt-1 font-mono text-xs">{s}</p></li>)}</ul>
      </Section>
      <Section title="Buttons & badges">
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button><Button variant="secondary">Secondary</Button><Button variant="outline">Outline</Button><Button variant="ghost">Ghost</Button><Button variant="destructive">Destructive</Button><Button variant="link">Link</Button><Button disabled>Disabled</Button><Button size="sm">Small</Button><Button size="lg">Large</Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2"><Badge>Published</Badge><Badge variant="secondary">Draft</Badge><Badge variant="outline">Archived</Badge><Badge variant="destructive">Error</Badge></div>
      </Section>
      <Section title="Form controls & validation">
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <FormField id="ds-ok" label="Valid input" defaultValue="hello@example.com" />
          <FormField id="ds-err" label="Invalid input" defaultValue="not-an-email" error="Enter a valid email address" />
          <div className="space-y-1"><Label htmlFor="ds-sel">Select</Label><select id="ds-sel" className="h-9 w-full rounded-md border bg-card px-2 text-sm"><option>One</option><option>Two</option></select></div>
          <FormField id="ds-dis" label="Disabled" disabled defaultValue="Read only" />
          <div className="flex items-center gap-2"><Checkbox id="ds-cb" defaultChecked /><Label htmlFor="ds-cb">Checkbox</Label></div>
          <div className="flex items-center gap-2"><Switch id="ds-sw" checked={sw} onCheckedChange={setSw} /><Label htmlFor="ds-sw">Switch {sw ? "on" : "off"}</Label></div>
          <RadioGroup defaultValue="a" className="sm:col-span-2"><div className="flex items-center gap-2"><RadioGroupItem id="ds-ra" value="a" /><Label htmlFor="ds-ra">Radio A</Label></div><div className="flex items-center gap-2"><RadioGroupItem id="ds-rb" value="b" /><Label htmlFor="ds-rb">Radio B</Label></div></RadioGroup>
          <Input placeholder="Plain input" aria-label="Plain input" />
        </div>
      </Section>
      <Section title="Cards, tables, tabs, accordion">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card><CardHeader><CardTitle className="font-display">Card title</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Card body content.</CardContent></Card>
          <Table><TableHeader><TableRow><TableHead>Model</TableHead><TableHead>Records</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>BlogPost</TableCell><TableCell>14</TableCell></TableRow><TableRow><TableCell>Product</TableCell><TableCell>6</TableCell></TableRow></TableBody></Table>
          <Tabs defaultValue="one"><TabsList><TabsTrigger value="one">One</TabsTrigger><TabsTrigger value="two">Two</TabsTrigger></TabsList><TabsContent value="one" className="text-sm">First panel</TabsContent><TabsContent value="two" className="text-sm">Second panel</TabsContent></Tabs>
          <Accordion type="single" collapsible><AccordionItem value="a"><AccordionTrigger>Accordion item</AccordionTrigger><AccordionContent>Hidden content.</AccordionContent></AccordionItem></Accordion>
        </div>
      </Section>
      <Section title="Loading & empty states">
        <div className="grid gap-3 sm:grid-cols-3"><Skeleton className="h-24" /><Skeleton className="h-24" /><div className="flex h-24 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">Empty state</div></div>
      </Section>
      <Section title="Overlays & feedback">
        <TooltipProvider>
          <div className="flex flex-wrap gap-2">
            <Dialog><DialogTrigger asChild><Button variant="outline">Dialog</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Dialog</DialogTitle></DialogHeader><p className="text-sm">Focus is trapped here; Esc closes.</p></DialogContent></Dialog>
            <Sheet><SheetTrigger asChild><Button variant="outline">Drawer</Button></SheetTrigger><SheetContent><SheetTitle>Drawer</SheetTitle><p className="mt-4 text-sm">Side panel content.</p></SheetContent></Sheet>
            <Popover><PopoverTrigger asChild><Button variant="outline">Popover</Button></PopoverTrigger><PopoverContent className="text-sm">Popover content</PopoverContent></Popover>
            <Tooltip><TooltipTrigger asChild><Button variant="outline">Tooltip</Button></TooltipTrigger><TooltipContent>Tooltip text</TooltipContent></Tooltip>
            <Button variant="outline" onClick={() => toast.success("Success toast")}>Toast</Button>
            <Button variant="outline" onClick={() => toast.error("Error toast")}>Error toast</Button>
          </div>
        </TooltipProvider>
      </Section>
    </>
  );
}
