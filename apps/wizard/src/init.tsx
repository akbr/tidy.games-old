import { setViews, serverActions, cartActions } from "./control";
import { Game } from "./views/Game";

serverActions.join();
serverActions.addBot();
serverActions.addBot();
serverActions.addBot();
serverActions.start({ seed: "test" });

cartActions.bid(0);

setViews(
  document.body,
  {
    Game,
  },
  { dev: true }
);
