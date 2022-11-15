import { getHandHeight } from "@shared/domEffects/positionHand";
import { useGame } from "@src/control";

import { UiButtons } from "./UiButtons";
import { Hud } from "./Hud";
import { Seats } from "./Seats/Seats";
import { Hand } from "./Hand";
import { Trick } from "./Trick";
import { TableCenter } from "./TableCenter";
import { useRefreshOnResize } from "@lib/hooks";
import { ComponentChildren, h } from "preact";

export const Game = () => {
  return (
    <Outer>
      <Table>
        <Seats />
        <TableCenter />
        <Trick />
      </Table>
      <Hud />
      <UiButtons />
    </Outer>
  );
};

function Outer({ children }: { children: ComponentChildren }) {
  return (
    <div class="h-full flex justify-center">
      <div class="relative w-full text-white overflow-hidden">{children}</div>
    </div>
  );
}

function Table({ children }: { children: ComponentChildren }) {
  useRefreshOnResize();

  const [playerIndex, hands] = useGame((s) => [s.playerIndex, s.board.hands]);

  const numCards = hands[playerIndex]?.length || 1;

  const tableHeight = getHandHeight(
    numCards,
    document.body.getBoundingClientRect().width,
    35,
    60
  );

  return (
    <section
      id="table"
      class="relative "
      style={{ height: `calc(100% - ${tableHeight}px)` }}
    >
      {children}
    </section>
  );
}

export default Game;
