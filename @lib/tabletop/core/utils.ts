import type { Spec } from "./spec";

export function expandStates<S extends Spec>({
  prev,
  patches,
}: {
  prev: S["states"];
  patches: Partial<S["states"]>[];
}) {
  const states: S["states"][] = [];
  patches.forEach((patch, idx) => {
    const prior = states[idx - 1] || prev;
    states.push({ ...prior, ...patch });
  });
  return states;
}
