import { initTabletop } from "@shared/initTabletop";
import cart from "./game/cart";
import views from "./views";

import isDev from "@shared/isDev";

const serverOptions = { seed: "test113" };

const client = initTabletop(
  {
    cart,
    views,
    dev: isDev(),
    $el: document.body,
  },
  isDev() ? serverOptions : undefined
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
