import { WizardSpec } from "src/game/spec";
import { GameProps } from "@lib/tabletop/preact/types";

import { getHandHeight } from "@shared/components/PositionHand/handLayout";

import { UiButtons } from "./UiButtons";
import { Hud } from "./Hud";
import { Seats } from "./Seats/Seats";
import { Hand } from "./Hand";
import { Trick } from "./Trick";
import { TableCenter } from "./TableCenter";
import { useRefreshOnResize } from "@lib/hooks";

export const Game = (props: GameProps<WizardSpec>) => {
  useRefreshOnResize();

  const { state, room, actions } = props;
  const numCards = state.player ? state.hands[state.player].length || 1 : 1;

  const tableHeight = getHandHeight(
    numCards,
    document.body.getBoundingClientRect(),
    35,
    60
  );

  return (
    <div class="h-full flex justify-center">
      <div class="relative w-full text-white overflow-hidden">
        <section
          id="table"
          class="relative"
          style={{ height: `calc(100% - ${tableHeight}px)` }}
        >
          <Hud {...props} />
          <Hand hand={state.hands[room.player]} play={actions.cart.play} />
          <Seats {...props} />
          <TableCenter {...props} />
          <Trick {...props} />
        </section>
        <UiButtons {...props} />
      </div>
    </div>
  );
};

export default Game;
