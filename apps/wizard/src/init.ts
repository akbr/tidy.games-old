import { initTabletop } from "@shared/initTabletop";
import { wizardCart } from "./game/cart";
import Game from "./views/Game";

const { server, client, dev } = initTabletop(wizardCart, document.body, {
  Game,
});
