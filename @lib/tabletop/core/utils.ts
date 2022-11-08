import type { Spec } from "./spec";

export function applyPatches<S extends Spec>({
  prev,
  patches,
}: {
  prev: S["game"];
  patches: Partial<S["game"]>[];
}) {
  const games: S["game"][] = [];
  patches.forEach((patch, idx) => {
    const prior = games[idx - 1] || prev;
    games.push({ ...prior, ...patch });
  });
  return games;
}
