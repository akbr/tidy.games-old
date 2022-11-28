import type { Spec } from "./spec";

export function applyPatches<S extends Spec>(
  prev: S["board"],
  patches: Partial<S["board"]>[]
) {
  const boards: S["board"][] = [];
  patches.forEach((patch, idx) => {
    const prior = boards[idx - 1] || prev;
    boards.push({ ...prior, ...patch });
  });
  return boards;
}
