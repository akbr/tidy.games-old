import { client, serverActions, setViews } from "./control";
import { Game } from "./views/Game";

setViews(document.body, { Game }, { dev: true });

const { join, addBot, start, leave } = serverActions;
join();
addBot();
addBot();
start({ seed: "test" });
