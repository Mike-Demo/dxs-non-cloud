import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/site/FormField";
import { PageHeader } from "@/components/site/States";
import { useContactMutation } from "@/lib/data/mutations";
import { contactSchema, type ContactInput } from "@/lib/data/schemas";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — DXS" },
      { name: "description", content: "Get in touch with the DXS team about sales, support or press." },
      { property: "og:title", content: "Contact — DXS" },
      { property: "og:description", content: "Get in touch with the DXS team." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const m = useContactMutation();
  const { register, handleSubmit, reset, formState: { errors, isSubmitSuccessful } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", topic: "sales", message: "" },
  });
  const onSubmit = handleSubmit(async (v) => {
    try {
      await m.mutateAsync(v);
      toast.success("Message sent — we'll reply soon");
      reset(undefined, { keepIsSubmitSuccessful: true });
    } catch {
      toast.error("Could not send your message");
    }
  });

  return (
    <>
      <PageHeader eyebrow="Contact" title="Talk to us" />
      <div className="container-page mt-10 grid gap-10 md:grid-cols-[1fr_20rem]">
        <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
          <FormField id="c-name" label="Name" error={errors.name?.message} {...register("name")} />
          <FormField id="c-email" label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="c-topic">Topic</Label>
            <select id="c-topic" className="h-9 w-full rounded-md border bg-card px-3 text-sm" {...register("topic")}>
              <option value="sales">Sales</option><option value="support">Support</option><option value="press">Press</option><option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="c-msg">Message</Label>
            <Textarea id="c-msg" rows={6} aria-invalid={!!errors.message} {...register("message")} />
            {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
          </div>
          <div className="sm:col-span-2 flex items-center gap-4">
            <Button type="submit" disabled={m.isPending}>{m.isPending ? "Sending…" : "Send message"}</Button>
            {isSubmitSuccessful && <span className="text-sm text-success" role="status">Sent.</span>}
          </div>
        </form>
        <aside className="space-y-4">
          <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-md border border-dashed bg-paper text-center">
            <MapPin className="size-6 text-primary" />
            <p className="mt-2 font-display">Harbour Hall, Lisbon</p>
            <p className="text-xs text-muted-foreground">Map placeholder — no external map service</p>
          </div>
          <p className="text-sm text-muted-foreground">Support hours: Mon–Fri, 09:00–17:00 UTC (sample details).</p>
        </aside>
      </div>
    </>
  );
}
