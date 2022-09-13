import { initTabletop } from "@lib/tabletop/init";
import { wizardCart } from "./game/cart";
import Game from "./views/Game";
import { OptionsView } from "./views/Options";

const { server, client, dev } = initTabletop(
  wizardCart,
  {
    Game,
    OptionsView,
  },
  document.body
);
