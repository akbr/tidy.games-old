import { setViews, serverActions, gameActions } from "./control";
import { Game } from "./views/Game";

const { join, addBot, start } = serverActions;
join();
addBot();
addBot();
addBot();
start({ seed: "test" });

setViews(
  document.body,
  {
    Game,
  },
  { dev: true }
);
