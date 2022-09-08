import type { Spec } from "@lib/tabletop/core/spec";
import type { GameProps } from "./types";

export default function DefaultGame<S extends Spec>({ frame }: GameProps<S>) {
  return <div>{JSON.stringify(frame.state)}</div>;
}
