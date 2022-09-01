import { createServer, createClient } from "@lib/tabletop";
import { createViews } from "@lib/tabletop/preact";
import { wizardCart } from "./game/cart";
import Game from "./views/Game";

import { isDev, getWSURL } from "@shared/browser";

const server = isDev() ? createServer(wizardCart) : getWSURL();
const client = createClient(server, wizardCart);

createViews(client, document.body, { Game }, { dev: true });

if (isDev()) {
  const { actions } = client;
  actions.server.join();
  actions.server.addBot();
  actions.server.addBot();
  actions.server.start();
}
