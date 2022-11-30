import { initPreactApp } from "@lib/tabletop/preact/initPreactApp";
import { wizardGame } from "./game/game";

export const isDev = () =>
  location.hostname === "localhost" && location.port === "3000";

const bundle = initPreactApp(wizardGame, { dev: isDev() });

export const {
  client,
  game,
  gameMeter,
  serverActions,
  gameActions,
  dialogEmitter,
  setViews,
  setDialog,
  useTitle,
  useLobby,
  useGame,
  createGameSelector,
} = bundle;

export const waitFor = gameMeter.waitFor;

export default bundle;
