import { style } from "../stylus";
import { memoizedCreate } from "./createCard";
import { getHandPositions, Y_PEEK } from "./handUpdate.calc";
import { Dimensions } from "./layout";
import shallow from "zustand/shallow";

export type HandUpdaterProps = {
  hand: string[];
  reset?: boolean;
  cardDimensions?: Dimensions;
  appDimensions?: Dimensions;
};

export const handUpdate = (
  $root: HTMLElement,
  {
    hand,
    appDimensions = { w: window.innerWidth, h: window.innerHeight },
    cardDimensions = { w: 80, h: 112 },
  }: HandUpdaterProps,
  prev?: HandUpdaterProps
) => {
  if (prev && shallow(hand, prev.hand) && appDimensions === prev.appDimensions)
    return;

  $root.innerHTML = "";

  let positions = getHandPositions(hand, appDimensions, cardDimensions);
  let cardEls = hand.map((id) => memoizedCreate(id));

  if (!prev) {
    style(cardEls, (idx) => ({
      x: positions[idx].x,
      y: positions[idx].y + (Y_PEEK + 10),
      r: 0,
    }));
  }

  cardEls.forEach((el, idx) => {
    $root.appendChild(el);
    style(el, { ...positions[idx], r: 0 }, { duration: 250 });
  });
};
