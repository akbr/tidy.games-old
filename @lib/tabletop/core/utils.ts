import type { Spec } from "./spec";
import type { StatePatch } from "./chart";

export function expandStates<S extends Spec>({
  prev,
  patches,
}: {
  prev: S["states"];
  patches: StatePatch<S>[];
}) {
  const states: S["states"][] = [];
  patches.forEach((patch, idx) => {
    const prior = states[idx - 1] || prev;
    states.push({ ...prior, ...patch });
  });
  return states;
}
