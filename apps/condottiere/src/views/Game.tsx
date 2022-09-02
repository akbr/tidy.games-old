import { GameProps } from "@lib/tabletop";
import { getHandHeight } from "@shared/components/PositionHand/handLayout";

import { CondottiereSpec } from "../game/spec";

import { xPeek, yPeek } from "./uiVars";

import UiButtons from "./UiButtons";
import Hand from "./Hand";
import Seats from "./Seats";
import CenterDisplay from "./CenterDisplay";
import PlayedCard from "./PlayedCard";
import { useRefreshOnResize } from "@lib/hooks";
import RetreatedCard from "./RetreatedCard";

export const Game = (props: GameProps<CondottiereSpec>) => {
  useRefreshOnResize();

  const { state, room, actions } = props;
  const hand = state.hands[room.player];

  const dim = document.body.getBoundingClientRect();

  const numCards = hand.length || 1;
  const handMargin = 4;
  const handHeight = getHandHeight(numCards, dim, xPeek, yPeek + handMargin);

  return (
    <div class="relative w-full h-full text-white overflow-hidden">
      <section
        id="table"
        class="relative"
        style={{ height: `calc(100% - ${handHeight}px)` }}
      >
        <Seats {...props} />
        <Hand cards={hand} play={actions.cart.play} />
        <CenterDisplay {...props} />
        <PlayedCard {...props} />
        <RetreatedCard {...props} />
      </section>
      <UiButtons {...props} />
    </div>
  );
};

export default Game;
