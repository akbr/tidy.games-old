import { is } from "@lib/compare/is";
import { useState } from "preact/hooks";
import { canDiscard } from "../game/logic";
import { Cards, Mercenaries } from "../game/glossary";
import CondottiereSpec from "../game/spec";
import { GameProps } from "@lib/tabletop";
import { setDelay } from "@lib/globalUi";

export const CenterDisplay = (props: GameProps<CondottiereSpec>) => {
  const { state, room, actions } = props;
  const { phase } = state;

  const vnode = (() => {
    const isTurn = state.player === room.player;

    if (phase === "choose") {
      if (!isTurn)
        return (
          <div class="text-center animate-pulse">
            Waiting for condottiere
            <br /> to choose battle city...
          </div>
        );

      return (
        <h3 class="flex flex-col items-center text-center gap-[16px] max-w-[175px] animate-pulse">
          Choose a city <br />
          on the map.
        </h3>
      );
    }

    if (phase === "chosen") {
      setDelay(2000);
      return (
        <h3 class="flex flex-col items-center text-center gap-[16px] max-w-[175px]">
          Battle location: <br />
          {state.battleLocation}
        </h3>
      );
    }

    if (phase === "retreat") {
      if (!isTurn) return <div>Waiting on scarecrow...</div>;

      return (
        <ChooseRetreat
          line={state.lines[state.player!]}
          retreat={actions.cart.retreat}
        />
      );
    }

    if (phase === "battleEnd") {
      setDelay(2000);
      return (
        <h3 class="flex flex-col items-center text-center gap-[16px] max-w-[175px]">
          Battle complete.
          <br />
          {state.battleStatus === -1 && `Tie in ${state.battleLocation}`}
          {state.battleStatus! > -1 && `P${state.battleStatus} wins.`}
        </h3>
      );
    }

    if (phase === "discard") {
      if (state.discardStatus[room.player])
        return <div>Waiting for other players...</div>;

      return (
        <ChooseDiscard
          hand={state.hands[room.player]}
          discard={actions.cart.discard}
        />
      );
    }

    if (phase === "discardsComplete") {
      setDelay(2000);
      const turnContinues = state.playStatus.filter((x) => x).length > 1;
      return turnContinues ? "Round continues!" : "Round is over.";
    }

    return null;
  })();

  return (
    <div class="absolute top-1/2 left-1/2 translate-center text-black">
      {vnode}
    </div>
  );
};

export default CenterDisplay;

function ChooseRetreat({
  line,
  retreat,
}: {
  line: Cards[];
  retreat: (o: Mercenaries | false) => void;
}) {
  const [order, setOrder] = useState<Mercenaries | false>(false);

  const mercenaries = [...new Set(line.filter(is.number))] as Mercenaries[];

  return (
    <div class="flex flex-col items-center text-center gap-[16px] max-w-[175px]">
      <h3>Choose retreat:</h3>
      <select
        name="cities"
        style={{ maxWidth: "100px" }}
        onChange={(e: any) => {
          setOrder(
            e.target.value === "FALSE"
              ? false
              : (parseInt(e.target.value) as Mercenaries)
          );
        }}
      >
        <option value={"FALSE"}>None</option>
        {mercenaries.map((m) => (
          <option value={m}>{m}</option>
        ))}
      </select>
      <button
        onClick={() => {
          retreat(order);
        }}
      >
        Choose
      </button>
    </div>
  );
}

function ChooseDiscard({
  hand,
  discard,
}: {
  hand: Cards[];
  discard: (o: boolean) => void;
}) {
  return (
    <div class="flex flex-col items-center text-center gap-[16px] max-w-[175px]">
      <h3>Discard your hand?</h3>
      <div class="flex gap-2">
        <button
          onClick={() => {
            discard(true);
          }}
          disabled={!canDiscard(hand)}
        >
          Yes
        </button>
        <button
          onClick={() => {
            discard(false);
          }}
        >
          No
        </button>
      </div>
    </div>
  );
}
