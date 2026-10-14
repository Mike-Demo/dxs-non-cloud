import { useLocation } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useFeedbackMutation } from "@/lib/data/mutations";
import { feedbackSchema, type FeedbackInput } from "@/lib/data/schemas";

export const FeedbackWidget = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const m = useFeedbackMutation();
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    values: { page: pathname, sentiment: "neutral", message: "" },
  });
  const sentiment = watch("sentiment");
  const onSubmit = handleSubmit(async (v) => {
    try { await m.mutateAsync(v); toast.success("Thanks for your feedback"); reset(); setOpen(false); } catch { toast.error("Could not send feedback"); }
  });
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="fixed bottom-4 right-4 z-40 shadow-lg" aria-label="Send feedback"><MessageSquare className="size-4" /> <span className="hidden sm:inline">Feedback</span></Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <form onSubmit={onSubmit} noValidate className="space-y-3">
          <p className="font-display text-lg">How is this page?</p>
          <div className="flex gap-1" role="group" aria-label="Sentiment">
            {(["positive", "neutral", "negative"] as const).map((s) => (
              <Button key={s} type="button" size="sm" variant={sentiment === s ? "default" : "outline"} aria-pressed={sentiment === s} onClick={() => setValue("sentiment", s)} className="capitalize">{s}</Button>
            ))}
          </div>
          <div className="space-y-1">
            <Label htmlFor="fb-msg">Message</Label>
            <Textarea id="fb-msg" rows={3} aria-invalid={!!errors.message} {...register("message")} />
            {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
          </div>
          <Button type="submit" size="sm" disabled={m.isPending}>{m.isPending ? "Sending…" : "Send"}</Button>
        </form>
      </PopoverContent>
    </Popover>
  );
};
