import { initTabletop } from "@shared/initTabletop";
import { condottiereCart } from "./game/cart";
import Game from "./views/Game";
import AppContainer from "./views/AppContainer";

const { server, client, dev } = initTabletop(condottiereCart, document.body, {
  AppContainer,
  Game,
});
