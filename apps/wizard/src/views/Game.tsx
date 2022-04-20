import type { GameProps } from "./types";
import { getHandHeight } from "@shared/components/PositionHand/handLayout";
import { useRefreshOnResize } from "@lib/hooks";

import { UiButtons } from "./UiButtons";
import { Hud } from "./Hud";
import { Seats } from "./Seats/Seats";
import { Hand } from "./Hand";
import { Trick } from "./Trick";
import { TableCenter } from "./TableCenter";

export const GameView = (props: GameProps) => {
  const { frame } = props;
  const [, game] = frame.state;

  const numCards = game.hands[frame.player].length || 1;
  const tableHeight = getHandHeight(
    numCards,
    document.body.getBoundingClientRect(),
    35,
    60
  );

  return (
    <div class="relative w-full text-white overflow-hidden">
      <section
        id="table"
        class="relative"
        style={{ height: `calc(100% - ${tableHeight}px)` }}
      >
        <Hand {...props} />
        <Seats {...props} />
        <Hud {...props} />
        <Trick {...props} />
        <TableCenter {...props} />
      </section>
      <UiButtons {...props} />
    </div>
  );
};

export const Game = (props: GameProps) => {
  useRefreshOnResize();

  const { width } = document.body.getBoundingClientRect();

  return (
    <div class="h-full flex justify-center">
      <GameView {...props} />
    </div>
  );
};

/**
 * 
 * 
      {width > 1000 && (
        <div class="p-3 overflow-y-auto">
          <ScoreTable {...props} />
        </div>
      )}
 */
