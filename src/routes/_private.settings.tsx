import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { settingsQuery } from "@/lib/data/queries";
import { useSettingsMutation } from "@/lib/data/mutations";
import { settingsSchema, type SettingsInput } from "@/lib/data/schemas";

export const Route = createFileRoute("/_private/settings")({
  head: () => ({
    meta: [
      { title: "Settings — DXS" },
      { name: "description", content: "Theme, language and notification preferences." },
      { property: "og:title", content: "Settings — DXS" },
      { property: "og:description", content: "Preferences." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery()),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: s } = useSuspenseQuery(settingsQuery());
  const m = useSettingsMutation();
  const { register, handleSubmit, setValue, watch, formState: { isDirty } } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    values: { theme: s.theme, locale: s.locale, emailNotifications: s.emailNotifications, productUpdates: s.productUpdates, digestFrequency: s.digestFrequency },
  });
  const onSubmit = handleSubmit(async (v) => {
    try { await m.mutateAsync(v); toast.success("Settings saved"); } catch { toast.error("Could not save settings"); }
  });

  return (
    <div className="max-w-2xl">
      <p className="eyebrow">Workspace</p>
      <h1 className="text-4xl">Settings</h1>
      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-8">
        <fieldset>
          <legend className="font-display text-xl">Theme</legend>
          <RadioGroup className="mt-3" value={watch("theme")} onValueChange={(v) => setValue("theme", v as SettingsInput["theme"], { shouldDirty: true })}>
            {(["light", "dark", "system"] as const).map((t) => <div key={t} className="flex items-center gap-2"><RadioGroupItem id={`th-${t}`} value={t} /><Label htmlFor={`th-${t}`} className="capitalize">{t}</Label></div>)}
          </RadioGroup>
        </fieldset>
        <div className="space-y-1">
          <Label htmlFor="locale" className="font-display text-xl">Language</Label>
          <select id="locale" className="h-9 w-full max-w-xs rounded-md border bg-card px-3 text-sm" {...register("locale")}><option value="en">English</option><option value="es">Español</option><option value="ja">日本語</option></select>
        </div>
        <fieldset className="space-y-4">
          <legend className="font-display text-xl">Notifications</legend>
          <div className="flex items-center justify-between gap-4"><Label htmlFor="en">Email notifications</Label><Switch id="en" checked={watch("emailNotifications")} onCheckedChange={(c) => setValue("emailNotifications", c, { shouldDirty: true })} /></div>
          <div className="flex items-center justify-between gap-4"><Label htmlFor="pu">Product updates</Label><Switch id="pu" checked={watch("productUpdates")} onCheckedChange={(c) => setValue("productUpdates", c, { shouldDirty: true })} /></div>
          <div className="space-y-1"><Label htmlFor="dg">Digest frequency</Label><select id="dg" className="h-9 w-full max-w-xs rounded-md border bg-card px-3 text-sm" {...register("digestFrequency")}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="never">Never</option></select></div>
        </fieldset>
        <Button type="submit" disabled={m.isPending || !isDirty}>{m.isPending ? "Saving…" : "Save settings"}</Button>
      </form>
    </div>
  );
}
