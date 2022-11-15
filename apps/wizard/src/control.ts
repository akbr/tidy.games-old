import { initPreactApp } from "@lib/tabletop/initPreactApp";
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
  useApp,
  useGame,
} = bundle;

export const waitFor = gameMeter.waitFor;
