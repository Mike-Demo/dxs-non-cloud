import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { newsletterSchema, type NewsletterInput } from "@/lib/data/schemas";
import { useNewsletterMutation } from "@/lib/data/mutations";

export const NewsletterForm = ({ compact = false }: { compact?: boolean }) => {
  const m = useNewsletterMutation();
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "", consent: false as unknown as true },
  });
  const id = compact ? "nl-footer" : "nl-main";
  const onSubmit = handleSubmit(async (values) => {
    try {
      const r = await m.mutateAsync(values);
      toast.success(r.alreadySubscribed ? "You're already subscribed" : "Subscribed — thank you");
      reset();
    } catch {
      toast.error("Could not subscribe. Please try again.");
    }
  });
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <div className="flex gap-2">
        <Label htmlFor={`${id}-email`} className="sr-only">Email</Label>
        <Input id={`${id}-email`} type="email" placeholder="you@example.com" aria-invalid={!!errors.email} {...register("email")} />
        <Button type="submit" disabled={m.isPending}>{m.isPending ? "…" : "Subscribe"}</Button>
      </div>
      {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      <div className="flex items-start gap-2">
        <Checkbox id={`${id}-consent`} checked={watch("consent") === true} onCheckedChange={(c) => setValue("consent", (c === true) as true, { shouldValidate: true })} />
        <Label htmlFor={`${id}-consent`} className="text-xs font-normal leading-snug text-muted-foreground">I agree to receive the monthly newsletter.</Label>
      </div>
      {errors.consent && <p className="text-sm text-destructive">{errors.consent.message}</p>}
    </form>
  );
};
