import { initTabletop } from "@shared/initPrimaryClient";
import { createServer } from "@lib/tabletop/roomServer";
import cart from "./game/cart";
import views from "./views";

import isDev from "@shared/isDev";
import createClient from "@lib/tabletop/client";

const server = createServer(cart, { seed: "test" });

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
    const client1 = createClient(server, cart);

    const c0 = client.controls;
    const c1 = client1.controls;

    //@ts-ignore
    window.c0 = c0;
    //@ts-ignore
    window.c1 = c1;

    c0.server.join({ id: "test" });
    c1.server.join({ id: "test" });
    c0.server.start();
    c0.game.choose("anc");
    /**
     * 
     * 
    c0.game.play(1);
    c1.game.play(1);
    c0.game.play("s");
    c0.game.retreat(1);
    c1.game.play(false);
    c1.game.discard(false);
    c0.game.discard(false);
     */
  })();
