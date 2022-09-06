import { positionTrick } from "@shared/domEffects/positionTrick";
import { Card } from "@shared/components/Card";
import { GameProps } from "@lib/tabletop";
import { WizardSpec } from "src/game/spec";
import { useLayoutEffect, useRef } from "preact/hooks";
import { useShallowRef } from "@lib/hooks";
import { receive } from "@lib/globalUi";

export const Trick = ({ state, room, ctx }: GameProps<WizardSpec>) => {
  const ref = useRef(null);

  const { phase, trickWinner, trick, trickLeader } = state;

  const effect = useShallowRef(
    (() => {
      if (phase === "played") {
        return {
          type: "played",
          player: state.player!,
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
    receive(
      positionTrick(ref.current!, {
        numPlayers: ctx.numPlayers,
        leadPlayer: trickLeader,
        perspective: room.player,
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
