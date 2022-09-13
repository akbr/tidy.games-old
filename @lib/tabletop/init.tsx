import { createServer, createClient, Spec, Cart } from ".";
import { createViews } from "./preact";
import { AppViews } from "./preact/App";
import { attachHashListener, attachLocalStorageMeta } from "./client/plugins/";

export function initTabletop<S extends Spec>(
  cart: Cart<S>,
  views: AppViews<S>,
  $el: HTMLElement
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

// ---

export const isDev = () => location.hostname === "localhost";
export const getWSURL = () =>
  location.origin.replace(/^http/, "ws") + location.pathname;
