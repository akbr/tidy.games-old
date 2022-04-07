import type { Spec, Cart } from "@lib/tabletop";
import { createServer } from "@lib/tabletop/roomServer";
import { createNodeServer } from "@lib/tabletop/nodeServer";

export function startServer<S extends Spec>(cart: Cart<S>) {
  createNodeServer(createServer(cart));
}
