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
  const tableHeight = getHandHeight(
    numCards,
    document.body.getBoundingClientRect()
  );

  return (
    <div class="h-full bg-[#006400] text-white overflow-hidden">
      <section
        id="table"
        class="relative"
        style={{ height: `calc(100% - ${tableHeight}px)` }}
      >
        <Hand {...props} />
        <Seats {...props} />
        <Trick {...props} />
        <TableCenter {...props} />
      </section>
      <Hud {...props} />
      <UiButtons {...props} />
    </div>
  );
};
