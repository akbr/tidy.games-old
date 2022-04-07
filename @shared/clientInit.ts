import "@shared/base.css";

import { h, render } from "preact";
import { setup } from "@twind/preact";
import { Spec, Cart } from "@lib/tabletop/";
import { createServer, ServerOptions } from "@lib/tabletop/roomServer";
import { createClient } from "@lib/tabletop/client";
import { createClientView, ClientViewProps } from "@lib/tabletop/client/views";

export function init<S extends Spec>(
  cart: Cart<S>,
  $el: HTMLElement,
  clientProps: ClientViewProps<S>,
  options?: ServerOptions
) {
  setup({
    preflight: false,
    props: { className: true },
  });

  const isDev = location.port === "3000";
  const server = isDev
    ? createServer(cart, options)
    : location.origin.replace(/^http/, "ws");

  const debug = isDev;
  const client = createClient(server, cart, debug);
  const View = createClientView(cart, clientProps, debug);

  client.subscribe((x) => render(h(View, { viewProps: x }, null), $el));
  client.update();

  return client;
}
