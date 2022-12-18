import { bundle } from "../bundle";
import { getHandHeight } from "@shared/domEffects/positionHand";

export const TABLE_MAX_WIDTH = 700;
export const BADGE_PADDING = 12;
export const BADGE_DIMENSIONS = [70, 86];

const {
  client,
  client: { useGame },
  view: { useGameDimensions, getGameDimensions },
} = bundle;

export const getTableDimensions = (
  dimensions?: ReturnType<typeof getGameDimensions>
) => {
  const { width, height } = dimensions || getGameDimensions();

  const state = client.emitter.get();
  if (state.mode !== "game") return { x: 0, y: 0, width: 0, height: 0 };

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

export const useTableDimensions = () => {
  const dimensions = useGameDimensions();
  useGame((s) => [s.board.hands[s.playerIndex].length, s.ctx.numPlayers]);

  return {
    ...getTableDimensions(dimensions),
    resizeSymbol: dimensions.resizeSymbol,
  };
};
