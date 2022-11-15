import { useEmitter } from "@lib/emitter";
import type { Spec } from "@lib/tabletop/core/spec";
import type { AppProps } from "../types";

export default function DefaultGame<S extends Spec>({ client }: AppProps<S>) {
  const board = useEmitter(client.gameEmitter, (x) => x.board);

  return <div>{JSON.stringify(board)}</div>;
}
