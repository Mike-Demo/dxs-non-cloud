import type { PrivateRepository } from "./private-ops";
import type {
  Author,
  BlogPost,
  Category,
  CustomerStory,
  Event,
  FAQ,
  Job,
  MediaAsset,
  Order,
  Page,
  Product,
  ProductReview,
  ProductVariant,
  Resource,
  Tag,
  TeamMember,
  Testimonial,
} from "./models";
import type { ApplicationInput, CartLine, CheckoutInput, ContactInput, NewsletterInput, RegistrationInput } from "./schemas";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface PostQuery {
  search?: string | undefined;
  category?: string | undefined;
  tag?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export interface ProductQuery {
  search?: string | undefined;
  category?: string | undefined;
  maxPriceMinor?: number | undefined;
  sort?: "newest" | "price-asc" | "price-desc" | "name" | undefined;
}

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
  fromPriceMinor: number;
  inStock: boolean;
}

export type CheckoutResult =
  | { ok: true; order: Order }
  | { ok: false; reason: "insufficient_stock" | "unknown_variant" | "empty_cart"; variantId?: string };

export class NotFoundError extends Error {
  constructor(what: string) {
    super(`${what} not found`);
    this.name = "NotFoundError";
  }
}

/** Typed operations shared by the mock and connected adapters. UI code depends only on this. */
export interface Repository extends PrivateRepository {
  mode: "mock" | "cloud";
  getPage(slug: string): Promise<Page>;
  listPosts(q: PostQuery): Promise<Paginated<BlogPost>>;
  getPost(slug: string): Promise<BlogPost>;
  listPostsByIds(ids: string[]): Promise<BlogPost[]>;
  getAuthor(slug: string): Promise<{ author: Author; posts: BlogPost[] }>;
  listAuthors(): Promise<Author[]>;
  getCategory(slug: string): Promise<{ category: Category; posts: BlogPost[]; products: ProductWithVariants[]; resources: Resource[] }>;
  listCategories(): Promise<Category[]>;
  listTags(): Promise<Tag[]>;
  listMedia(): Promise<MediaAsset[]>;
  listProducts(q: ProductQuery): Promise<ProductWithVariants[]>;
  getProduct(slug: string): Promise<{ product: ProductWithVariants; reviews: ProductReview[] }>;
  listProductsByIds(ids: string[]): Promise<ProductWithVariants[]>;
  listVariants(ids: string[]): Promise<(ProductVariant & { productName: string; productSlug: string })[]>;
  listEvents(when: "upcoming" | "past" | "all"): Promise<Event[]>;
  getEvent(slug: string): Promise<Event>;
  listResources(type?: Resource["type"]): Promise<Resource[]>;
  getResource(slug: string): Promise<Resource>;
  listTeam(): Promise<TeamMember[]>;
  listTestimonials(ids?: string[]): Promise<Testimonial[]>;
  listStories(): Promise<CustomerStory[]>;
  listFaqs(): Promise<FAQ[]>;
  listJobs(): Promise<Job[]>;
  submitContact(input: ContactInput): Promise<{ id: string }>;
  subscribeNewsletter(input: NewsletterInput): Promise<{ id: string; alreadySubscribed: boolean }>;
  registerForEvent(eventId: string, input: RegistrationInput): Promise<{ id: string }>;
  applyToJob(jobId: string, input: ApplicationInput): Promise<{ id: string }>;
  checkout(lines: CartLine[], input: CheckoutInput): Promise<CheckoutResult>;
  reset(): Promise<void>;
}
