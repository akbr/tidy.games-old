import type { Spec } from "@lib/tabletop/core/spec";
import type { GameProps } from "./types";

export default function DefaultGame<S extends Spec>({ state }: GameProps<S>) {
  return <div>{JSON.stringify(state)}</div>;
}
