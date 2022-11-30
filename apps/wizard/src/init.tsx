import { client, serverActions, setViews, isDev } from "./control";
import { Game } from "./views/Game";
import { Options } from "./views/Options";

setViews(document.body, { Game, Options }, { dev: isDev() });

if (isDev()) {
  const { join, addBot, start, leave } = serverActions;
  join({ id: "DEVV" });
  addBot();
  addBot();
  start();
  client.gameMeter.setIdx(7);
}
