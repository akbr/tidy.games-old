import { client, serverActions, setViews } from "./control";
import { Game } from "./views/Game";
import { Options } from "./views/Options";

setViews(document.body, { Game, Options }, { dev: true });

/**
 * const { join, addBot, start, leave } = serverActions;
join();
addBot();

 */
