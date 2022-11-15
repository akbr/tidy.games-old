import { createUseEmitter } from "@lib/emitter";
import { createServer, createClient, Spec, Cart } from ".";
import { createViewManager } from "./preact";

export function initPreactApp<S extends Spec>(
  cart: Cart<S>,
  { dev } = { dev: location.hostname === "localhost" }
) {
  const server = dev
    ? createServer(cart)
    : location.origin.replace(/^http/, "ws") + location.pathname;

  const client = createClient(server, cart);

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
