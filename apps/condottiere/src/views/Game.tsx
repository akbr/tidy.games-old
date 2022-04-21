import type { GameProps } from "./types";
import { getHandHeight } from "@shared/components/PositionHand/handLayout";

import { xPeek, yPeek } from "./uiVars";

import UiButtons from "./UiButtons";
import Hand from "./Hand";
import Seats from "./Seats";
import CenterDisplay from "./CenterDisplay";

export const Game = (props: GameProps) => {
  const { frame, controls } = props;
  const { player } = frame;
  const [, game] = frame.state;

  const numCards = game.hands[frame.player].length || 1;
  const handMargin = 4;
  const tableHeight = getHandHeight(
    numCards,
    document.body.getBoundingClientRect(),
    xPeek,
    yPeek + handMargin
  );

  return (
    <div class="relative w-full h-full text-white overflow-hidden">
      <section
        id="table"
        class="relative"
        style={{ height: `calc(100% - ${tableHeight}px)` }}
      >
        <Seats {...props} />
        <CenterDisplay {...props} />
        <Hand
          cards={game.hands[player]}
          err={props.err}
          play={controls.game.play as any}
        />
      </section>
      <UiButtons {...props} />
    </div>
  );
};

export default Game;
