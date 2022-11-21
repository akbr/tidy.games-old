import { ComponentChildren, h } from "preact";
import { useLayoutEffect, useRef } from "preact/hooks";

import { style } from "@lib/style";
import { useRefreshOnResize } from "@lib/hooks";
import { getNearestDimensions } from "@lib/dom";

import { getHandHeight } from "@shared/domEffects/positionHand";

import { UiButtons } from "./UiButtons";
import { Hud } from "./Hud";
import { Seats } from "./Seats/Seats";
import { Hand } from "./Hand";
import { Trick } from "./Trick";
import { TableCenter } from "./TableCenter";

import { useGame } from "~src/control";

export const Game = () => {
  return (
    <>
      <Outer>
        <Table>
          <Seats />
          <TableCenter />
          <Trick />
        </Table>
      </Outer>
      <Hand />
      <Hud />
      <UiButtons />
    </>
  );
};

function Outer({ children }: { children: ComponentChildren }) {
  return (
    <div class="relative h-full w-full text-white overflow-hidden flex justify-center">
      {children}
    </div>
  );
}

function Table({ children }: { children: ComponentChildren }) {
  const refreshSymbol = useRefreshOnResize();
  const ref = useRef<HTMLElement>(null);

  const [playerIndex, hands] = useGame((s) => [s.playerIndex, s.board.hands]);

  const numCards = hands[playerIndex]?.length || 1;

  useLayoutEffect(() => {
    const [width] = getNearestDimensions(ref.current!);
    const tableHeight = getHandHeight(numCards, width, 35, 60);
    style(ref.current!, { height: `calc(100% - ${tableHeight}px)` });
  }, [refreshSymbol]);

  return (
    <section ref={ref} id="table" class="relative w-[700px] min-w-[400px]">
      {children}
    </section>
  );
}

export default Game;
