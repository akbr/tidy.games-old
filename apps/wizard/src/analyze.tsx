import { getHistoryResults } from "@lib/tabletop/core/store";
import { wizardGame } from "./game/game";
import lz from "lz-string";

const json = lz.decompressFromEncodedURIComponent(
  window.location.hash.slice(1)
);

//@ts-ignore
const results = getHistoryResults(wizardGame, JSON.parse(json));

//@ts-ignore
document.body.textContent = JSON.stringify({ ...history, ...results });

/**
 * import { client, serverActions, setViews } from "./control";
import { Game } from "./views/Game";

setViews(document.body, { Game }, { dev: true });

const { join, addBot, start, leave } = serverActions;
join();
addBot();
addBot();
start({ seed: "test" });

 */
