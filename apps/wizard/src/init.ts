import { createServer } from "@lib/tabletop/roomServer";
import { initTabletop } from "@shared/initPrimaryClient";

import cart from "./game/cart";
import views from "./views";

import { isDev, getWSURL } from "@shared/browser";

const server = isDev() ? createServer(cart, { seed: "test123" }) : getWSURL();

const client = initTabletop(
  {
    cart,
    views,
    dev: isDev(),
    $el: document.body,
  },
  server
);

isDev() &&
  (() => {
    console.log("Hello, world!");
    return;
    const { server, game } = client.controls;
    server.join({ id: "test" });
    server.addBot();
    server.addBot();
    server.addBot();
    server.start({ numRounds: 3, canadian: true });

    client.controls.meter.setIdx((_, l) => l - 1);
  })();
