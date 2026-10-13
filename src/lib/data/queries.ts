import { queryOptions } from "@tanstack/react-query";
import { getRepository } from "./client";
import type { Resource } from "./models";
import type { PostQuery, ProductQuery } from "./repository";

const repo = () => getRepository();

export const qk = { all: ["dxs"] as const };

export const pageQuery = (slug: string) => queryOptions({ queryKey: ["dxs", "page", slug], queryFn: () => repo().getPage(slug) });
export const postsQuery = (q: PostQuery) => queryOptions({ queryKey: ["dxs", "posts", q], queryFn: () => repo().listPosts(q) });
export const postQuery = (slug: string) => queryOptions({ queryKey: ["dxs", "post", slug], queryFn: () => repo().getPost(slug) });
export const postsByIdsQuery = (ids: string[]) => queryOptions({ queryKey: ["dxs", "posts-by-ids", ids], queryFn: () => repo().listPostsByIds(ids) });
export const authorQuery = (slug: string) => queryOptions({ queryKey: ["dxs", "author", slug], queryFn: () => repo().getAuthor(slug) });
export const authorsQuery = () => queryOptions({ queryKey: ["dxs", "authors"], queryFn: () => repo().listAuthors() });
export const categoryQuery = (slug: string) => queryOptions({ queryKey: ["dxs", "category", slug], queryFn: () => repo().getCategory(slug) });
export const categoriesQuery = () => queryOptions({ queryKey: ["dxs", "categories"], queryFn: () => repo().listCategories() });
export const tagsQuery = () => queryOptions({ queryKey: ["dxs", "tags"], queryFn: () => repo().listTags() });
export const mediaQuery = () => queryOptions({ queryKey: ["dxs", "media"], queryFn: () => repo().listMedia() });
export const productsQuery = (q: ProductQuery) => queryOptions({ queryKey: ["dxs", "products", q], queryFn: () => repo().listProducts(q) });
export const productQuery = (slug: string) => queryOptions({ queryKey: ["dxs", "product", slug], queryFn: () => repo().getProduct(slug) });
export const productsByIdsQuery = (ids: string[]) => queryOptions({ queryKey: ["dxs", "products-by-ids", ids], queryFn: () => repo().listProductsByIds(ids) });
export const variantsQuery = (ids: string[]) => queryOptions({ queryKey: ["dxs", "variants", ids], queryFn: () => repo().listVariants(ids) });
export const eventsQuery = (when: "upcoming" | "past" | "all") => queryOptions({ queryKey: ["dxs", "events", when], queryFn: () => repo().listEvents(when) });
export const eventQuery = (slug: string) => queryOptions({ queryKey: ["dxs", "event", slug], queryFn: () => repo().getEvent(slug) });
export const resourcesQuery = (type?: Resource["type"]) => queryOptions({ queryKey: ["dxs", "resources", type ?? "all"], queryFn: () => repo().listResources(type) });
export const resourceQuery = (slug: string) => queryOptions({ queryKey: ["dxs", "resource", slug], queryFn: () => repo().getResource(slug) });
export const teamQuery = () => queryOptions({ queryKey: ["dxs", "team"], queryFn: () => repo().listTeam() });
export const testimonialsQuery = (ids?: string[]) => queryOptions({ queryKey: ["dxs", "testimonials", ids ?? "all"], queryFn: () => repo().listTestimonials(ids) });
export const storiesQuery = () => queryOptions({ queryKey: ["dxs", "stories"], queryFn: () => repo().listStories() });
export const faqsQuery = () => queryOptions({ queryKey: ["dxs", "faqs"], queryFn: () => repo().listFaqs() });
export const jobsQuery = () => queryOptions({ queryKey: ["dxs", "jobs"], queryFn: () => repo().listJobs() });
