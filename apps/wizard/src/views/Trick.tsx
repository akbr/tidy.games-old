import { useLayoutEffect, useRef } from "preact/hooks";
import { useShallowRef } from "@lib/hooks";
import { positionTrick } from "@shared/domEffects/positionTrick";
import { Card } from "@shared/components/Card";

import { useGame, waitFor } from "@src/control";

export const Trick = () => {
  const ref = useRef(null);

  const { game, ctx, playerIndex } = useGame();

  const { phase, trickWinner, trick, trickLeader, player } = game;

  const effect = useShallowRef(
    (() => {
      if (phase === "played") {
        return {
          type: "played",
          player: player!,
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
      positionTrick(ref.current!, {
        numPlayers: ctx.numPlayers,
        leadPlayer: trickLeader,
        perspective: playerIndex,
        effect,
      })
    );
  }, [effect, trick]);

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
