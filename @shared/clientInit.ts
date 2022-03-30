import "@shared/base.css";

import { h, render } from "preact";
import { setup } from "@twind/preact";
import { GameDefinition, Spec } from "@lib/tabletop/types";
import { createServer, ServerOptions } from "@lib/tabletop/server";
import { createClient } from "@lib/tabletop/client";
import { createClientView, ClientViewProps } from "@lib/tabletop/views";

export function init<S extends Spec>(
  def: GameDefinition<S>,
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
    ? createServer(def, options)
    : location.origin.replace(/^http/, "ws");

  const debug = isDev;
  const history = clientProps.debug;
  const client = createClient(server, def, debug);
  const View = createClientView({ ...clientProps, debug });

  client.subscribe((x) => render(h(View, { viewProps: x }, null), $el));
  client.update();

  return client;
}