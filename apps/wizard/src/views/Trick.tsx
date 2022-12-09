import { useLayoutEffect, useRef } from "preact/hooks";
import { useShallowRef } from "@lib/hooks";
import { Vec } from "@lib/vector";
import { stageTrick } from "@shared/domEffects/stageTrick";
import { Card } from "@shared/components/Card";

import { BADGE_PADDING, BADGE_DIMENSIONS } from "./uiConsts";

import { useGame, useTableDimensions, waitFor } from "~src/control";

export const PLAY_DISTANCE = Vec.add(BADGE_DIMENSIONS, [
  BADGE_PADDING,
  BADGE_PADDING,
]);

export const Trick = () => {
  const dimensions = useTableDimensions();
  const ref = useRef(null);

  const { board, ctx, playerIndex, action } = useGame();
  const { phase, trickWinner, trick, trickLeader } = board;

  const effect = useShallowRef(
    (() => {
      if (phase === "played") {
        return {
          type: "played",
          player: action?.player!,
        } as const;
      }

      if (phase === "trickWon") {
        return {
          type: "won",
          player: trickWinner!,
        } as const;
      }
    })()
  );

  useLayoutEffect(() => {
    waitFor(
      stageTrick(
        ref.current!,
        [dimensions.width, dimensions.height],
        {
          numPlayers: ctx.numPlayers,
          leadPlayer: trickLeader,
          perspective: playerIndex,
        },
        PLAY_DISTANCE,
        effect
      )
    );
  }, [effect, trick, dimensions.resizeSymbol]);

  return (
    <section ref={ref} id="trick" class="absolute top-0 left-0">
      {trick.map((cardId) => (
        <div key={cardId} class="absolute">
          <Card key={"trick-" + cardId} card={cardId} />
        </div>
      ))}
    </section>
  );
};
