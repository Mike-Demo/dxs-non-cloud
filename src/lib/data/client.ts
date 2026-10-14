import { createMockRepository, memoryStore, type KeyValueStore } from "./mock";
import type { Repository } from "./repository";

/**
 * Mode selection. Connected (Lovable Cloud) mode is not wired yet, so mock mode is always active.
 * `VITE_DATA_MODE=mock` will remain an explicit override once the cloud adapter exists.
 */
export const dataMode = (): Repository["mode"] => "mock";

const browserStore = (): KeyValueStore => {
  if (typeof window === "undefined") return memoryStore();
  return {
    get: (k) => window.localStorage.getItem(k),
    set: (k, v) => window.localStorage.setItem(k, v),
    remove: (k) => window.localStorage.removeItem(k),
  };
};

let instance: Repository | null = null;

export const getRepository = (): Repository => {
  if (typeof window === "undefined") return createMockRepository({ store: memoryStore(), clock: () => new Date() });
  instance ??= createMockRepository({ store: browserStore(), clock: () => new Date() });
  return instance;
};
