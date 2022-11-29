import { initPreactApp } from "@lib/tabletop/preact/initPreactApp";
import { wizardGame } from "./game/game";

const bundle = initPreactApp(wizardGame);

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
