import { z } from "zod";

export const emailSchema = z.string().trim().email("Enter a valid email address").max(255);

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: emailSchema,
  topic: z.enum(["sales", "support", "press", "other"]),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

export const newsletterSchema = z.object({
  email: emailSchema,
  consent: z.literal(true, { errorMap: () => ({ message: "Consent is required" }) }),
});

export const registrationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: emailSchema,
  attendance: z.enum(["in-person", "online"]),
});

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export const RESUME_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export const applicationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: emailSchema,
  portfolioUrl: z.union([z.literal(""), z.string().trim().url("Enter a valid URL")]),
  coverLetter: z.string().trim().min(50, "Cover letter must be at least 50 characters").max(5000),
  resumeFileName: z.string().min(1, "Attach a résumé (PDF or Word, up to 5 MB)"),
  consent: z.literal(true, { errorMap: () => ({ message: "Consent is required" }) }),
});

export const checkoutSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: emailSchema,
  line1: z.string().trim().min(3, "Street address is required").max(200),
  city: z.string().trim().min(1, "City is required").max(100),
  postalCode: z.string().trim().min(3, "Postal code is required").max(20),
  country: z.string().trim().min(2, "Country is required").max(56),
});

export const cartLineSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(99, "Maximum 99 per item"),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CartLine = z.infer<typeof cartLineSchema>;
