import { deep } from "./deep";

export function shallowPatchWithDeep<T extends Object>(
  prev: Record<string, any>,
  next: T
): T {
  const merged = {} as T;
  for (const k in prev) {
    const key = k as keyof T;
    if (deep(prev[k], next[key])) {
      merged[key] = prev[k];
    } else {
      merged[key] = next[key];
    }
  }
  return merged;
}
