import { createServer, createClient, Spec, Cart } from "@lib/tabletop";
import { createViews } from "@lib/tabletop/preact";
import { AppViews } from "@lib/tabletop/preact/App";
import { isDev, getWSURL } from "@shared/browser";
import {
  attachHashListener,
  attachLocalStorageMeta,
} from "@lib/tabletop/client/plugins/";

export function initTabletop<S extends Spec>(
  cart: Cart<S>,
  $el: HTMLElement,
  views: AppViews<S>
) {
  const dev = isDev();

  const server = dev ? createServer(cart) : getWSURL();
  const client = createClient(server, cart);

  attachHashListener(client);
  attachLocalStorageMeta(client);

  createViews(client, $el, views, { dev });

  return { dev, server, client };
}

export default initTabletop;
