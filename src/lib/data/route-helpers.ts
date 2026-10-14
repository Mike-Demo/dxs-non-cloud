import { notFound } from "@tanstack/react-router";
import { NotFoundError } from "./repository";

/** Converts repository NotFoundError into a router notFound() so routes render their not-found view. */
export const orNotFound = async <T,>(p: Promise<T>): Promise<T> => {
  try {
    return await p;
  } catch (e) {
    if (e instanceof NotFoundError) throw notFound();
    throw e;
  }
};
