import { forwardRef, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

/** Labelled input with an accessible field-level error message. */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({ id, label, error, className, ...rest }, ref) => (
  <div className={cn("space-y-1", className)}>
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} ref={ref} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...rest} />
    {error && <p id={`${id}-error`} className="text-sm text-destructive">{error}</p>}
  </div>
));
FormField.displayName = "FormField";
