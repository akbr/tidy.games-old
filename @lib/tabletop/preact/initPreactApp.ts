import { createUseEmitter, Selector } from "@lib/emitter";
import { createServer, createClient, Spec, Game } from "..";
import { createViewManager } from "./createViewManager";
import { useClientTitle, useClientLobby, useClientGame } from "./createHooks";
import { attachHashListener } from "../client/plugins";
import { ClientState } from "../client";

export function initPreactApp<S extends Spec>(
  game: Game<S>,
  { dev } = {
    dev: location.hostname === "localhost" && location.port === "3000",
  }
) {
  const server = dev
    ? createServer(game)
    : location.origin.replace(/^http/, "ws") + location.pathname;

  const client = createClient(server, game);

  client.gameMeter.toggleHistory(dev);

  attachHashListener(client);

  const viewManager = createViewManager(client);

  const useClient = createUseEmitter(client.emitter);
  const useTitle = useClientTitle(client);
  const useLobby = useClientLobby(client);
  const useGame = useClientGame(client);

  return {
    client,
    ...client,
    ...viewManager,
    useClient,
    useTitle,
    useLobby,
    useGame,
    createGameSelector: <U>(
      selector: Selector<Extract<ClientState<S>, { mode: "game" }>, U>
    ) => selector,
    waitFor: client.gameMeter.waitFor,
  };
}

export default initPreactApp;
