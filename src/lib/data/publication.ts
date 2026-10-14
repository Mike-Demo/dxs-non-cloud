import type { Publishable } from "./models";

/** Public predicate shared by every adapter: published and publishedAt <= now. */
export const isPubliclyVisible = (record: Publishable, now: Date): boolean =>
  record.status === "published" && record.publishedAt !== null && new Date(record.publishedAt).getTime() <= now.getTime();

/** Promote scheduled records whose scheduledAt is due. Returns a new record when promoted. */
export const promoteIfDue = <T extends Publishable>(record: T, now: Date): T => {
  if (record.status !== "scheduled" || record.scheduledAt === null) return record;
  if (new Date(record.scheduledAt).getTime() > now.getTime()) return record;
  return { ...record, status: "published", publishedAt: record.scheduledAt };
};

export const isUpcoming = (startAt: string, now: Date): boolean => new Date(startAt).getTime() > now.getTime();
