import { h, render } from "preact";

import { Spec } from "@lib/tabletop/";
import { createServer, ServerOptions } from "@lib/tabletop/roomServer";
import { createClient } from "@lib/tabletop/client";
import attachHashListener from "@lib/tabletop/client/attachments/hashListener";
import attachLocalStorageMemory from "@lib/tabletop/client/attachments/localStorageMeta";

import { ClientViewProps } from "./components/Tabletop";

import { createAppView } from "./components/Tabletop/App";

import { isDev } from "./isDev";

type InitClientProps = {
  $el: HTMLElement;
  serverOptions?: ServerOptions;
};

export function initClient<S extends Spec>(
  props: ClientViewProps<S>,
  { serverOptions, $el }: InitClientProps
) {
  const serverOrURL = isDev()
    ? createServer(props.cart, serverOptions)
    : location.origin.replace(/^http/, "ws");

  const client = createClient(serverOrURL, props.cart, props.debug);
  attachLocalStorageMemory(client);

  const View = createAppView(props);

  client.subscribe((clientState) =>
    render(h(View, { clientState }, null), $el)
  );
  client.update();

  // This must come after initial forced upate (to allow for initial /#game access)
  attachHashListener(client);

  return client;
}
