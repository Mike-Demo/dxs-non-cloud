import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "./FormField";
import { useReviewMutation } from "@/lib/data/mutations";
import { reviewSchema, type ReviewInput } from "@/lib/data/schemas";

export const ReviewForm = ({ productId }: { productId: string }) => {
  const m = useReviewMutation(productId);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitSuccessful } } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { reviewerName: "", rating: 0, title: "", body: "" },
  });
  const rating = watch("rating");
  const onSubmit = handleSubmit(async (v) => {
    try { await m.mutateAsync(v); reset(undefined, { keepIsSubmitSuccessful: true }); toast.success("Review submitted for moderation"); } catch { toast.error("Could not submit review"); }
  });
  if (isSubmitSuccessful) return <p className="text-sm text-muted-foreground" role="status">Thanks — your review will appear after moderation.</p>;
  return (
    <form onSubmit={onSubmit} noValidate className="grid max-w-xl gap-3">
      <p className="font-display text-lg">Write a review</p>
      <fieldset>
        <legend className="mb-1 text-sm font-medium">Rating</legend>
        <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <Button key={n} type="button" size="sm" variant={rating >= n ? "default" : "outline"} aria-label={`${n} star${n > 1 ? "s" : ""}`} aria-pressed={rating === n} onClick={() => setValue("rating", n, { shouldValidate: true })}>★</Button>)}</div>
        {errors.rating && <p className="text-sm text-destructive">{errors.rating.message}</p>}
      </fieldset>
      <FormField id="rv-name" label="Name" error={errors.reviewerName?.message} {...register("reviewerName")} />
      <FormField id="rv-title" label="Title" error={errors.title?.message} {...register("title")} />
      <div className="space-y-1"><Label htmlFor="rv-body">Review</Label><Textarea id="rv-body" rows={3} aria-invalid={!!errors.body} {...register("body")} />{errors.body && <p className="text-sm text-destructive">{errors.body.message}</p>}</div>
      <Button type="submit" className="w-fit" disabled={m.isPending}>{m.isPending ? "Submitting…" : "Submit review"}</Button>
    </form>
  );
};
