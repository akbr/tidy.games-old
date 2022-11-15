import { createUseEmitter } from "@lib/emitter";
import { createServer, createClient, Spec, Game } from ".";
import { createViewManager } from "./preact";

export function initPreactApp<S extends Spec>(
  game: Game<S>,
  { dev } = { dev: location.hostname === "localhost" }
) {
  const server = dev
    ? createServer(game)
    : location.origin.replace(/^http/, "ws") + location.pathname;

  const client = createClient(server, game);

  client.gameMeter.toggleHistory(dev);

  // attachListeners(client);

  const viewManager = createViewManager(client);

  const useApp = createUseEmitter(client.appEmitter);
  const useGame = createUseEmitter(client.gameEmitter);

  return {
    client,
    ...client,
    ...viewManager,
    useApp,
    useGame,
  };
}

export default initPreactApp;
