import { h, render } from "preact";
import { setup } from "@twind/preact";

import { Spec, Cart } from "@lib/tabletop/";
import { createServer, ServerOptions } from "@lib/tabletop/roomServer";
import { createClient } from "@lib/tabletop/client";
import attachHashListener from "@lib/tabletop/client/attachments/hashListener";
import attachLocalStorageMemory from "@lib/tabletop/client/attachments/localStorageMeta";
import { createClientView, ClientViewProps } from "@lib/tabletop/views";
import { isDev } from "./isDev";

type InitClientProps<S extends Spec> = {
  cart: Cart<S>;
  $el: HTMLElement;
  views: ClientViewProps<S>;
  serverOptions?: ServerOptions;
  debug?: boolean;
};

export function initClient<S extends Spec>(props: InitClientProps<S>) {
  setup({
    preflight: false,
    props: { className: true },
  });

  const serverOrURL = isDev()
    ? createServer(props.cart, props.serverOptions)
    : location.origin.replace(/^http/, "ws");

  const debugFlag = !!props.debug;

  const client = createClient(serverOrURL, props.cart, debugFlag);
  attachLocalStorageMemory(client);

  const View = createClientView(props.cart, props.views, debugFlag);

  client.subscribe((viewProps) =>
    render(h(View, { viewProps }, null), props.$el)
  );
  client.update();

  // This must come after initial forced upate (to allow for initial /#game access)
  attachHashListener(client);

  return client;
}
