import { useRefreshOnResize } from "@lib/hooks";
import { initPreactApp } from "@lib/tabletop/preact/initPreactApp";
import { useState } from "preact/hooks";
import { wizardGame } from "./game/game";
import { getHandHeight } from "@shared/domEffects/positionHand";
import viewInputs from "./views";

export const isDev = () =>
  location.hostname === "localhost" && location.port === "3000";

const bundle = initPreactApp(wizardGame, document.body, {
  dev: isDev(),
});

export const {
  client,
  game,
  gameMeter,
  serverActions,
  gameActions,
  dom,
  dialogEmitter,
  setDialog,
  useTitle,
  useLobby,
  useGame,
  createGameSelector,
  render,
} = bundle;

export const waitFor = gameMeter.waitFor;

export default bundle;

export const TABLE_MAX_WIDTH = 700;

export const getDimensions = () => {
  const { width, height, x, y } = dom.$game.getBoundingClientRect();
  return { width, height, x, y };
};

export const getTableDimensions = (
  dimensions?: ReturnType<typeof getDimensions>
) => {
  const { width, height } = dimensions || getDimensions();

  const state = client.emitter.get();
  if (state.mode !== "game") return { x: 0, y: 0, width: 0, height: 0 };

  const numPlayers = state.ctx.numPlayers;
  const numCards = state.board.hands[state.playerIndex].length || 1;

  const tableW = Math.min(TABLE_MAX_WIDTH, width);
  const widthDiff = width - tableW;
  const handHeight = getHandHeight(numCards, tableW);

  return {
    x: widthDiff / 2,
    y: 0,
    width: tableW,
    height: height - handHeight,
  };
};

export const useDimensions = () => {
  const resizeSymbol = useRefreshOnResize();
  return { ...getDimensions(), resizeSymbol };
};

export const useTableDimensions = () => {
  const dimensions = useDimensions();
  useGame((s) => [s.board.hands[s.playerIndex].length, s.ctx.numPlayers]);

  return {
    ...getTableDimensions(dimensions),
    resizeSymbol: dimensions.resizeSymbol,
  };
};
