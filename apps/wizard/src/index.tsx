import "@shared/base.css";

import { initClient } from "@shared/initClient";
import isDev from "@shared/isDev";
import cart from "./game/cart";
import views from "./views";

const serverOptions = { seed: "test113" };

const client = initClient({
  cart,
  views,
  $el: document.getElementById("app")!,
  serverOptions: isDev() ? serverOptions : undefined,
  //debug: false,
});

isDev() &&
  (() => {
    console.log("Hello from development");
  })();
