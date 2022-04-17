import { initClient } from "@shared/initClient";
import isDev from "@shared/isDev";
import cart from "./game/cart";
import views from "./views";

const serverOptions = { seed: "test113" };

const client = initClient(
  {
    cart,
    debug: isDev(),
    views,
  },
  {
    $el: document.body,
    serverOptions: isDev() ? serverOptions : undefined,
  }
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
