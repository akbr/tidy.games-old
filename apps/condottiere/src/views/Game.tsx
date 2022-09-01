import { GameProps } from "@lib/tabletop";
import { getHandHeight } from "@shared/components/PositionHand/handLayout";

import { CondottiereSpec } from "../game/spec";

import { xPeek, yPeek } from "./uiVars";

import UiButtons from "./UiButtons";
import Hand from "./Hand";
import Seats from "./Seats";
import CenterDisplay from "./CenterDisplay";

export const Game = (props: GameProps<CondottiereSpec>) => {
  const { state, room, actions } = props;
  const hand = state.hands[room.player];

  const numCards = hand.length || 1;
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
        <Hand cards={hand} play={actions.cart.play} />
        <CenterDisplay {...props} />
      </section>
      <UiButtons {...props} />
    </div>
  );
};

export default Game;
