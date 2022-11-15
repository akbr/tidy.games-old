import { initPreactApp } from "@lib/tabletop/initPreactApp";
import { wizardCart } from "./game/cart";

const bundle = initPreactApp(wizardCart);

export const {
  client,
  cart,
  gameMeter,
  serverActions,
  cartActions,
  dialogEmitter,
  setViews,
  setDialog,
  useApp,
  useGame,
} = bundle;

export const waitFor = gameMeter.waitFor;
