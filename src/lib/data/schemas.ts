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

const slugSchema = z.string().trim().min(1, "Slug is required").max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");
const optionalUrl = z.union([z.literal(""), z.string().trim().url("Enter a valid URL")]);

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: emailSchema,
  bio: z.string().trim().max(500, "Bio must be 500 characters or fewer"),
  website: optionalUrl,
  avatarDataUrl: z.string().nullable(),
});

export const MAX_AVATAR_BYTES = 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  locale: z.enum(["en", "es", "ja"]),
  emailNotifications: z.boolean(),
  productUpdates: z.boolean(),
  digestFrequency: z.enum(["daily", "weekly", "never"]),
});

export const ticketSchema = z.object({
  subject: z.string().trim().min(5, "Subject must be at least 5 characters").max(150),
  category: z.enum(["billing", "technical", "content", "other"]),
  priority: z.enum(["low", "normal", "high"]),
  message: z.string().trim().min(10, "Describe the issue in at least 10 characters").max(2000),
});

export const surveySchema = z.object({
  satisfaction: z.number().int().min(1, "Choose a rating").max(5),
  mostUsed: z.enum(["blog", "shop", "events", "resources"]),
  comments: z.string().trim().max(1000),
});

export const feedbackSchema = z.object({
  page: z.string().min(1),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  message: z.string().trim().min(3, "Tell us a little more").max(1000),
});

export const reviewSchema = z.object({
  reviewerName: z.string().trim().min(1, "Name is required").max(80),
  rating: z.number().int().min(1, "Choose a rating").max(5),
  title: z.string().trim().min(3, "Title is required").max(120),
  body: z.string().trim().min(10, "Review must be at least 10 characters").max(2000),
});

export const commonContentSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    slug: slugSchema,
    status: z.enum(["published", "draft", "scheduled", "archived"]),
    scheduledAt: z.string().nullable(),
    seoTitle: z.string().trim().max(70, "SEO title must be 70 characters or fewer"),
    seoDescription: z.string().trim().max(160, "SEO description must be 160 characters or fewer"),
  })
  .refine((v) => v.status !== "scheduled" || (v.scheduledAt !== null && !Number.isNaN(Date.parse(v.scheduledAt))), {
    message: "Pick a date and time to schedule",
    path: ["scheduledAt"],
  });

export const postFieldsSchema = z.object({
  excerpt: z.string().trim().min(1, "Excerpt is required").max(300),
  authorId: z.string().min(1, "Choose an author"),
  categoryIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  heroId: z.string().nullable(),
  relatedPostIds: z.array(z.string()),
  locale: z.enum(["en", "es", "ja"]),
});

export const mediaMetaSchema = z.object({
  alt: z.string().trim().min(1, "Alt text is required").max(250),
  caption: z.string().trim().max(250),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type TicketInput = z.infer<typeof ticketSchema>;
export type SurveyInput = z.infer<typeof surveySchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CommonContentInput = z.infer<typeof commonContentSchema>;
export type PostFieldsInput = z.infer<typeof postFieldsSchema>;
export type MediaMetaInput = z.infer<typeof mediaMetaSchema>;
