import type { GameProps } from "./types";
import { getHandHeight } from "@lib/layouts/hand";

import { UiButtons } from "./UiButtons";
import { Hud } from "./Hud";
import { Seats } from "./Seats";
import { Hand } from "./Hand";
import { Trick } from "./Trick";
import { TableCenter } from "./TableCenter";

export const Game = (props: GameProps) => {
  const {
    state: [, game],
    player,
  } = props.frame;

  const numCards = game.hands[player].length || 1;
  const rect = document.body.getBoundingClientRect();
  const tableHeight = getHandHeight(numCards, rect);

  return (
    <div class="h-full flex justify-around">
      <div class="h-full w-full max-w-[800px]">
        <div class="relative h-full bg-[#006400] text-white overflow-hidden">
          <section
            id="table"
            class="relative w-full"
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
      </div>
    </div>
  );
};

/**
Sidebar stuff:

import { useRefreshOnResize } from "@lib/hooks";
import { ScoreTable } from "./ScoreTable";
useRefreshOnResize();
 {rect.width > 1300 && <ScoreTable {...props} />}
 */
